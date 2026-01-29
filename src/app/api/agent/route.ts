import { NextRequest, NextResponse } from "next/server";
import { procurementAgent, SupplierPriceData } from "@/agents/procurement";
import { marketingAgent, InfluencerData } from "@/agents/marketing";
import { arcWallet } from "@/services/arc";

// Mock supplier data for demo
const MOCK_SUPPLIERS: SupplierPriceData[] = [
  {
    supplier: "GlobalTextiles Co",
    product: "Cotton T-Shirts (100 units)",
    currentPrice: 14.50,
    targetPrice: 18.00,
    historicalPrices: [16.00, 15.50, 15.00, 14.80, 14.50],
    supplierWallet: "0xSUPPLIER_TEXTILES_WALLET",
  },
  {
    supplier: "PackagePro",
    product: "Eco-Friendly Mailers (500 units)",
    currentPrice: 225.00,
    targetPrice: 250.00,
    historicalPrices: [240.00, 235.00, 230.00, 228.00, 225.00],
    supplierWallet: "0xSUPPLIER_PACKAGING_WALLET",
  },
  {
    supplier: "PrintMasters",
    product: "Custom Labels (1000 units)",
    currentPrice: 85.00,
    targetPrice: 80.00,
    historicalPrices: [82.00, 84.00, 85.00, 86.00, 85.00],
    supplierWallet: "0xSUPPLIER_PRINT_WALLET",
  },
];

// Mock influencer data for demo
const MOCK_INFLUENCERS: InfluencerData[] = [
  {
    handle: "creativevibes",
    platform: "Instagram",
    followers: 45000,
    engagementRate: 4.2,
    niche: "Lifestyle/Fashion",
    requestedRate: 50,
    walletAddress: "0xINFLUENCER_CREATIVE_WALLET",
  },
  {
    handle: "techreview_mike",
    platform: "YouTube",
    followers: 120000,
    engagementRate: 3.8,
    niche: "Tech Reviews",
    requestedRate: 150,
    walletAddress: "0xINFLUENCER_TECH_WALLET",
  },
  {
    handle: "artisan_goods",
    platform: "TikTok",
    followers: 28000,
    engagementRate: 6.1,
    niche: "Handmade/Crafts",
    requestedRate: 35,
    walletAddress: "0xINFLUENCER_ARTISAN_WALLET",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentType, data } = body;

    switch (action) {
      case "analyze": {
        if (agentType === "procurement") {
          // Use provided data or random mock supplier
          const priceData = data || MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];
          const result = await procurementAgent.analyzeAndExecute(priceData);
          return NextResponse.json({
            success: true,
            agentType: "procurement",
            ...result,
          });
        }

        if (agentType === "marketing") {
          // Use provided data or random mock influencer
          const influencer = data || MOCK_INFLUENCERS[Math.floor(Math.random() * MOCK_INFLUENCERS.length)];
          const result = await marketingAgent.evaluateAndEngage(influencer);
          return NextResponse.json({
            success: true,
            agentType: "marketing",
            ...result,
          });
        }

        return NextResponse.json(
          { error: "Invalid agent type" },
          { status: 400 }
        );
      }

      case "discover": {
        if (agentType === "marketing") {
          const result = await marketingAgent.discoverInfluencers();
          return NextResponse.json({
            ...result,
            agentType: "marketing",
          });
        }
        return NextResponse.json(
          { error: "Discovery only available for marketing agent" },
          { status: 400 }
        );
      }

      case "status": {
        const procurementState = procurementAgent.getState();
        const marketingState = marketingAgent.getState();
        const balance = await arcWallet.getBalance();

        return NextResponse.json({
          success: true,
          wallet: balance,
          mockMode: arcWallet.isInMockMode(),
          agents: {
            procurement: {
              isActive: procurementState.isActive,
              dailySpent: procurementState.dailySpent,
              dailyLimit: procurementState.dailyLimit,
              eventCount: procurementState.events.length,
            },
            marketing: {
              isActive: marketingState.isActive,
              dailySpent: marketingState.dailySpent,
              dailyLimit: marketingState.dailyLimit,
              activeInfluencers: marketingState.activeInfluencers.length,
              eventCount: marketingState.events.length,
            },
          },
        });
      }

      case "events": {
        const count = data?.count || 20;
        return NextResponse.json({
          success: true,
          procurement: procurementAgent.getRecentEvents(count),
          marketing: marketingAgent.getRecentEvents(count),
        });
      }

      case "reset": {
        procurementAgent.resetDailySpending();
        marketingAgent.resetDailySpending();
        procurementAgent.clearEvents();
        marketingAgent.clearEvents();
        return NextResponse.json({
          success: true,
          message: "Agent state reset",
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: error.message || "Agent execution failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return mock data options for the demo
  return NextResponse.json({
    suppliers: MOCK_SUPPLIERS,
    influencers: MOCK_INFLUENCERS,
    endpoints: {
      analyze: "POST /api/agent { action: 'analyze', agentType: 'procurement' | 'marketing', data?: {...} }",
      discover: "POST /api/agent { action: 'discover', agentType: 'marketing' }",
      status: "POST /api/agent { action: 'status' }",
      events: "POST /api/agent { action: 'events', data: { count: number } }",
      reset: "POST /api/agent { action: 'reset' }",
    },
  });
}
