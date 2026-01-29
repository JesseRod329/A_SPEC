import { geminiService, AgentDecision } from "@/services/gemini";
import { arcWallet, TransactionResult } from "@/services/arc";
import { x402Service, X402ResourceResponse } from "@/services/x402";
import { MARKETING_AGENT_PROMPT } from "./prompts";
import { v4 as uuidv4 } from "uuid";

export interface InfluencerData {
  handle: string;
  platform: string;
  followers: number;
  engagementRate: number;
  niche: string;
  requestedRate: number;
  walletAddress: string;
}

export interface MarketingEvent {
  id: string;
  timestamp: string;
  type: "discovery" | "evaluation" | "payment" | "campaign" | "error";
  data: {
    influencer?: string;
    platform?: string;
    decision?: AgentDecision;
    transaction?: TransactionResult;
    x402Response?: X402ResourceResponse<any>;
    thought?: string;
    error?: string;
  };
}

export interface MarketingAgentState {
  isActive: boolean;
  dailySpent: number;
  dailyLimit: number;
  maxPerPost: number;
  lastActivity: string;
  events: MarketingEvent[];
  activeInfluencers: string[];
}

class MarketingAgent {
  private state: MarketingAgentState = {
    isActive: false,
    dailySpent: 0,
    dailyLimit: 500,
    maxPerPost: 100,
    lastActivity: new Date().toISOString(),
    events: [],
    activeInfluencers: [],
  };

  private eventListeners: ((event: MarketingEvent) => void)[] = [];

  getState(): MarketingAgentState {
    return { ...this.state };
  }

  subscribe(listener: (event: MarketingEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  private emitEvent(event: MarketingEvent) {
    this.state.events.push(event);
    this.state.lastActivity = event.timestamp;
    this.eventListeners.forEach(listener => listener(event));
  }

  async discoverInfluencers(): Promise<X402ResourceResponse<any>> {
    this.state.isActive = true;

    this.emitEvent({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: "discovery",
      data: {
        thought: "Querying influencer database via x402 protocol...",
      },
    });

    // Use x402 to fetch premium influencer data (requires micropayment)
    const response = await x402Service.fetchWithPayment<any>(
      "/api/influencer/premium",
      { autoPayLimit: 10 }
    );

    this.emitEvent({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: "discovery",
      data: {
        x402Response: response,
        thought: response.success
          ? `Retrieved ${response.data?.influencers?.length || 0} influencer profiles`
          : `x402 payment required: $${response.paymentRequired?.amount}`,
      },
    });

    this.state.isActive = false;
    return response;
  }

  async evaluateAndEngage(influencer: InfluencerData): Promise<{
    decision: AgentDecision;
    transaction?: TransactionResult;
  }> {
    this.state.isActive = true;

    // Emit evaluation started event
    this.emitEvent({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: "evaluation",
      data: {
        influencer: influencer.handle,
        platform: influencer.platform,
        thought: `Evaluating @${influencer.handle} (${influencer.followers.toLocaleString()} followers, ${influencer.engagementRate}% engagement)...`,
      },
    });

    try {
      // Get AI evaluation
      const decision = await geminiService.evaluateInfluencer(
        MARKETING_AGENT_PROMPT,
        {
          handle: influencer.handle,
          platform: influencer.platform,
          followers: influencer.followers,
          engagementRate: influencer.engagementRate,
          niche: influencer.niche,
          requestedRate: influencer.requestedRate,
        }
      );

      // Emit decision event
      this.emitEvent({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: "evaluation",
        data: {
          influencer: influencer.handle,
          decision,
          thought: decision.reasoning,
        },
      });

      // Execute payment if decision is to engage
      if (decision.action === "EXECUTE" && decision.parameters?.suggestedBudget) {
        const budget = Math.min(
          decision.parameters.suggestedBudget as number,
          this.state.maxPerPost,
          this.state.dailyLimit - this.state.dailySpent
        );

        if (budget <= 0) {
          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "error",
            data: {
              error: "Daily marketing budget exhausted",
              thought: "Cannot engage - daily marketing limit reached.",
            },
          });
          this.state.isActive = false;
          return { decision };
        }

        // Execute micropayment to influencer
        const transaction = await arcWallet.transferUSDC(
          influencer.walletAddress,
          budget
        );

        if (transaction.success) {
          this.state.dailySpent += budget;
          this.state.activeInfluencers.push(influencer.handle);

          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "payment",
            data: {
              influencer: influencer.handle,
              transaction,
              thought: `Payment of $${budget} USDC sent to @${influencer.handle} for campaign collaboration`,
            },
          });

          // Simulate campaign activation
          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "campaign",
            data: {
              influencer: influencer.handle,
              thought: `Campaign activated with @${influencer.handle} - awaiting post confirmation`,
            },
          });
        } else {
          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "error",
            data: {
              error: transaction.error,
              thought: `Payment failed: ${transaction.error}`,
            },
          });
        }

        this.state.isActive = false;
        return { decision, transaction };
      }

      this.state.isActive = false;
      return { decision };
    } catch (error: any) {
      this.emitEvent({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: "error",
        data: {
          error: error.message,
          thought: `Error during evaluation: ${error.message}`,
        },
      });
      this.state.isActive = false;
      throw error;
    }
  }

  // Reset daily spending
  resetDailySpending() {
    this.state.dailySpent = 0;
  }

  // Update guardrails
  updateGuardrails(dailyLimit?: number, maxPerPost?: number) {
    if (dailyLimit !== undefined) {
      this.state.dailyLimit = dailyLimit;
    }
    if (maxPerPost !== undefined) {
      this.state.maxPerPost = maxPerPost;
    }
  }

  // Get active influencer collaborations
  getActiveInfluencers(): string[] {
    return [...this.state.activeInfluencers];
  }

  // Get recent events
  getRecentEvents(count: number = 10): MarketingEvent[] {
    return this.state.events.slice(-count);
  }

  // Clear events
  clearEvents() {
    this.state.events = [];
  }
}

export const marketingAgent = new MarketingAgent();
