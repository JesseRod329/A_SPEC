// Circle USDC Sandbox Integration
// For hackathon demo purposes, we simulate Circle API responses

export interface CircleWallet {
  walletId: string;
  entityId: string;
  type: string;
  description: string;
  balances: {
    amount: string;
    currency: string;
  }[];
}

export interface CircleTransfer {
  id: string;
  source: {
    type: string;
    id: string;
  };
  destination: {
    type: string;
    address: string;
    chain: string;
  };
  amount: {
    amount: string;
    currency: string;
  };
  status: "pending" | "complete" | "failed";
  transactionHash?: string;
  createDate: string;
}

export interface CirclePaymentIntent {
  id: string;
  amount: {
    amount: string;
    currency: string;
  };
  settlementCurrency: string;
  paymentMethods: {
    type: string;
    chain: string;
  }[];
  fees: {
    amount: string;
    currency: string;
  };
  status: "created" | "pending" | "confirmed" | "paid" | "failed";
}

class CircleService {
  private apiKey: string;
  private baseUrl: string;
  private mockMode: boolean = false;
  private mockTransfers: CircleTransfer[] = [];

  constructor() {
    this.apiKey = process.env.CIRCLE_API_KEY || "";
    this.baseUrl = process.env.CIRCLE_BASE_URL || "https://api-sandbox.circle.com";

    // Enable mock mode if no valid API key
    if (!this.apiKey || this.apiKey.startsWith("SAND_API_KEY_xxxxx")) {
      console.log("Circle: Running in mock mode (no API key configured)");
      this.mockMode = true;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.mockMode) {
      return this.getMockResponse(endpoint, options);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Circle API error: ${response.status}`);
    }

    return response.json();
  }

  private getMockResponse(endpoint: string, options: RequestInit): any {
    // Mock responses for demo
    if (endpoint.includes("/wallets")) {
      return {
        data: {
          walletId: "mock-wallet-001",
          entityId: "aspec-demo",
          type: "end_user_wallet",
          description: "A_SPEC Demo Wallet",
          balances: [
            { amount: "10000.00", currency: "USD" }
          ]
        }
      };
    }

    if (endpoint.includes("/transfers") && options.method === "POST") {
      const transfer: CircleTransfer = {
        id: `transfer-${Date.now()}`,
        source: { type: "wallet", id: "mock-wallet-001" },
        destination: { type: "blockchain", address: "0x...", chain: "ARC" },
        amount: { amount: "100.00", currency: "USD" },
        status: "complete",
        transactionHash: `0x${Date.now().toString(16)}`,
        createDate: new Date().toISOString(),
      };
      this.mockTransfers.push(transfer);
      return { data: transfer };
    }

    if (endpoint.includes("/transfers")) {
      return { data: this.mockTransfers };
    }

    return { data: {} };
  }

  async createWallet(idempotencyKey: string, description: string): Promise<CircleWallet> {
    const response = await this.makeRequest("/v1/wallets", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey,
        description,
      }),
    });
    return response.data;
  }

  async getWalletBalance(walletId: string): Promise<CircleWallet> {
    const response = await this.makeRequest(`/v1/wallets/${walletId}`);
    return response.data;
  }

  async createTransfer(
    idempotencyKey: string,
    sourceWalletId: string,
    destinationAddress: string,
    destinationChain: string,
    amount: string,
    currency: string = "USD"
  ): Promise<CircleTransfer> {
    const response = await this.makeRequest("/v1/transfers", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey,
        source: {
          type: "wallet",
          id: sourceWalletId,
        },
        destination: {
          type: "blockchain",
          address: destinationAddress,
          chain: destinationChain,
        },
        amount: {
          amount,
          currency,
        },
      }),
    });
    return response.data;
  }

  async getTransfer(transferId: string): Promise<CircleTransfer> {
    const response = await this.makeRequest(`/v1/transfers/${transferId}`);
    return response.data;
  }

  async createPaymentIntent(
    idempotencyKey: string,
    amount: string,
    currency: string = "USD"
  ): Promise<CirclePaymentIntent> {
    const response = await this.makeRequest("/v1/paymentIntents", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey,
        amount: { amount, currency },
        settlementCurrency: "USD",
        paymentMethods: [
          { type: "blockchain", chain: "ARC" }
        ],
      }),
    });
    return response.data;
  }

  isInMockMode(): boolean {
    return this.mockMode;
  }
}

export const circleService = new CircleService();
