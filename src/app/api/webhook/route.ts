import { NextRequest, NextResponse } from "next/server";

// Webhook endpoint for receiving transaction confirmations
// In production, this would receive callbacks from Arc/Circle

interface WebhookPayload {
  type: "transaction.confirmed" | "transaction.failed" | "payment.received";
  data: {
    txHash?: string;
    amount?: string;
    currency?: string;
    from?: string;
    to?: string;
    status?: string;
    timestamp?: string;
  };
}

// Store recent webhooks for demo purposes
const recentWebhooks: WebhookPayload[] = [];

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();

    // Log webhook
    console.log("Webhook received:", payload);

    // Store for demo
    recentWebhooks.push({
      ...payload,
      data: {
        ...payload.data,
        timestamp: new Date().toISOString(),
      },
    });

    // Keep only last 50 webhooks
    if (recentWebhooks.length > 50) {
      recentWebhooks.shift();
    }

    // Process based on type
    switch (payload.type) {
      case "transaction.confirmed":
        // Could trigger agent state updates here
        console.log(`Transaction ${payload.data.txHash} confirmed`);
        break;

      case "transaction.failed":
        console.log(`Transaction ${payload.data.txHash} failed`);
        break;

      case "payment.received":
        console.log(`Payment received: ${payload.data.amount} ${payload.data.currency}`);
        break;
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    webhooks: recentWebhooks.slice(-20),
    count: recentWebhooks.length,
  });
}
