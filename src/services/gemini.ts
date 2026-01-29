import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";

// Gemini 3 Flash client for agent reasoning
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export interface AgentDecision {
  action: "EXECUTE" | "HOLD" | "REJECT";
  reasoning: string;
  confidence: number;
  parameters?: Record<string, unknown>;
}

export interface PriceAnalysis {
  currentPrice: number;
  targetPrice: number;
  recommendation: "BUY" | "WAIT" | "SKIP";
  reasoning: string;
}

export interface InfluencerEvaluation {
  score: number;
  recommendation: "ENGAGE" | "PASS";
  reasoning: string;
  suggestedBudget?: number;
}

class GeminiService {
  private model: GenerativeModel;

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
  }

  async analyzeProcurementDecision(
    systemPrompt: string,
    priceData: {
      supplier: string;
      product: string;
      currentPrice: number;
      targetPrice: number;
      historicalPrices: number[];
      dailySpentSoFar: number;
      dailyLimit: number;
      maxSingleTransaction: number;
    }
  ): Promise<AgentDecision> {
    const userPrompt = `
Analyze this procurement opportunity:

SUPPLIER: ${priceData.supplier}
PRODUCT: ${priceData.product}
CURRENT PRICE: $${priceData.currentPrice} USDC
TARGET PRICE: $${priceData.targetPrice} USDC
7-DAY PRICE HISTORY: ${priceData.historicalPrices.map(p => `$${p}`).join(", ")}

BUDGET STATUS:
- Daily Spent: $${priceData.dailySpentSoFar} / $${priceData.dailyLimit}
- Max Single Transaction: $${priceData.maxSingleTransaction}

Respond with a JSON object containing:
{
  "action": "EXECUTE" | "HOLD" | "REJECT",
  "reasoning": "Brief explanation of decision",
  "confidence": 0-100,
  "parameters": { "amount": number, "urgency": "low" | "medium" | "high" }
}

Only respond with the JSON, no other text.
`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AgentDecision;
      }

      return {
        action: "HOLD",
        reasoning: "Unable to parse agent response",
        confidence: 0
      };
    } catch (error) {
      console.error("Gemini procurement analysis error:", error);
      return {
        action: "HOLD",
        reasoning: `Error during analysis: ${error}`,
        confidence: 0
      };
    }
  }

  async evaluateInfluencer(
    systemPrompt: string,
    influencerData: {
      handle: string;
      platform: string;
      followers: number;
      engagementRate: number;
      niche: string;
      requestedRate: number;
      previousCollaborations?: number;
    }
  ): Promise<AgentDecision> {
    const userPrompt = `
Evaluate this influencer for marketing collaboration:

INFLUENCER: @${influencerData.handle}
PLATFORM: ${influencerData.platform}
FOLLOWERS: ${influencerData.followers.toLocaleString()}
ENGAGEMENT RATE: ${influencerData.engagementRate}%
NICHE: ${influencerData.niche}
REQUESTED RATE: $${influencerData.requestedRate} USDC per post
${influencerData.previousCollaborations ? `PREVIOUS COLLABORATIONS: ${influencerData.previousCollaborations}` : ""}

Respond with a JSON object containing:
{
  "action": "EXECUTE" | "HOLD" | "REJECT",
  "reasoning": "Brief explanation of decision",
  "confidence": 0-100,
  "parameters": { "suggestedBudget": number, "postCount": number }
}

Only respond with the JSON, no other text.
`;

    try {
      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AgentDecision;
      }

      return {
        action: "HOLD",
        reasoning: "Unable to parse agent response",
        confidence: 0
      };
    } catch (error) {
      console.error("Gemini influencer evaluation error:", error);
      return {
        action: "HOLD",
        reasoning: `Error during evaluation: ${error}`,
        confidence: 0
      };
    }
  }

  async generateThought(context: string): Promise<string> {
    try {
      const result = await this.model.generateContent([
        { text: "You are A_SPEC, an autonomous commerce agent. Generate a brief internal thought (1-2 sentences) about your current task." },
        { text: context }
      ]);

      return result.response.text();
    } catch (error) {
      return "Processing...";
    }
  }
}

export const geminiService = new GeminiService();
