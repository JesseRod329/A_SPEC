import { geminiService, AgentDecision } from "@/services/gemini";
import { arcWallet, TransactionResult } from "@/services/arc";
import { PROCUREMENT_AGENT_PROMPT } from "./prompts";
import { v4 as uuidv4 } from "uuid";

export interface SupplierPriceData {
  supplier: string;
  product: string;
  currentPrice: number;
  targetPrice: number;
  historicalPrices: number[];
  supplierWallet: string;
}

export interface ProcurementEvent {
  id: string;
  timestamp: string;
  type: "analysis" | "decision" | "execution" | "error";
  data: {
    supplier?: string;
    product?: string;
    price?: number;
    decision?: AgentDecision;
    transaction?: TransactionResult;
    thought?: string;
    error?: string;
  };
}

export interface ProcurementAgentState {
  isActive: boolean;
  dailySpent: number;
  dailyLimit: number;
  maxSingleTransaction: number;
  lastActivity: string;
  events: ProcurementEvent[];
}

class ProcurementAgent {
  private state: ProcurementAgentState = {
    isActive: false,
    dailySpent: 0,
    dailyLimit: 2000,
    maxSingleTransaction: 500,
    lastActivity: new Date().toISOString(),
    events: [],
  };

  private eventListeners: ((event: ProcurementEvent) => void)[] = [];

  getState(): ProcurementAgentState {
    return { ...this.state };
  }

  subscribe(listener: (event: ProcurementEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  private emitEvent(event: ProcurementEvent) {
    this.state.events.push(event);
    this.state.lastActivity = event.timestamp;
    this.eventListeners.forEach(listener => listener(event));
  }

  async analyzeAndExecute(priceData: SupplierPriceData): Promise<{
    decision: AgentDecision;
    transaction?: TransactionResult;
  }> {
    this.state.isActive = true;

    // Emit analysis started event
    this.emitEvent({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: "analysis",
      data: {
        supplier: priceData.supplier,
        product: priceData.product,
        price: priceData.currentPrice,
        thought: `Analyzing ${priceData.product} from ${priceData.supplier} at $${priceData.currentPrice}...`,
      },
    });

    try {
      // Get AI decision
      const decision = await geminiService.analyzeProcurementDecision(
        PROCUREMENT_AGENT_PROMPT,
        {
          supplier: priceData.supplier,
          product: priceData.product,
          currentPrice: priceData.currentPrice,
          targetPrice: priceData.targetPrice,
          historicalPrices: priceData.historicalPrices,
          dailySpentSoFar: this.state.dailySpent,
          dailyLimit: this.state.dailyLimit,
          maxSingleTransaction: this.state.maxSingleTransaction,
        }
      );

      // Emit decision event
      this.emitEvent({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: "decision",
        data: {
          supplier: priceData.supplier,
          decision,
          thought: decision.reasoning,
        },
      });

      // Execute if decision is to buy
      if (decision.action === "EXECUTE" && decision.parameters?.amount) {
        const amount = Math.min(
          decision.parameters.amount as number,
          this.state.maxSingleTransaction,
          this.state.dailyLimit - this.state.dailySpent
        );

        if (amount <= 0) {
          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "error",
            data: {
              error: "Daily spending limit reached",
              thought: "Cannot execute - daily limit would be exceeded.",
            },
          });
          this.state.isActive = false;
          return { decision };
        }

        // Execute transaction
        const transaction = await arcWallet.transferUSDC(
          priceData.supplierWallet,
          amount
        );

        if (transaction.success) {
          this.state.dailySpent += amount;

          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "execution",
            data: {
              supplier: priceData.supplier,
              product: priceData.product,
              transaction,
              thought: `Successfully transferred $${amount} USDC to ${priceData.supplier}`,
            },
          });
        } else {
          this.emitEvent({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type: "error",
            data: {
              error: transaction.error,
              thought: `Transaction failed: ${transaction.error}`,
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
          thought: `Error during analysis: ${error.message}`,
        },
      });
      this.state.isActive = false;
      throw error;
    }
  }

  // Reset daily spending (would be called by a cron job in production)
  resetDailySpending() {
    this.state.dailySpent = 0;
  }

  // Update guardrails
  updateGuardrails(dailyLimit?: number, maxSingleTransaction?: number) {
    if (dailyLimit !== undefined) {
      this.state.dailyLimit = dailyLimit;
    }
    if (maxSingleTransaction !== undefined) {
      this.state.maxSingleTransaction = maxSingleTransaction;
    }
  }

  // Get recent events
  getRecentEvents(count: number = 10): ProcurementEvent[] {
    return this.state.events.slice(-count);
  }

  // Clear events
  clearEvents() {
    this.state.events = [];
  }
}

export const procurementAgent = new ProcurementAgent();
