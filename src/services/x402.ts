// x402 Protocol - HTTP-native micropayments for agent-to-agent commerce
// Based on the x402 standard for HTTP 402 Payment Required flows

import { arcWallet, TransactionResult } from "./arc";

export interface X402PaymentRequest {
  // x-402 headers from the server
  paymentRequired: boolean;
  amount: number;
  currency: string;
  paymentAddress: string;
  paymentNetwork: string;
  description: string;
  expiresAt?: string;
}

export interface X402PaymentReceipt {
  paid: boolean;
  txHash?: string;
  amount: number;
  timestamp: string;
}

export interface X402ResourceResponse<T> {
  success: boolean;
  data?: T;
  paymentRequired?: X402PaymentRequest;
  receipt?: X402PaymentReceipt;
  error?: string;
}

class X402Service {
  private receipts: Map<string, X402PaymentReceipt> = new Map();

  /**
   * Simulate fetching a resource that requires x402 payment
   * In production, this would make a real HTTP request and handle 402 responses
   */
  async fetchWithPayment<T>(
    url: string,
    options?: {
      autoPayLimit?: number; // Max auto-pay amount in USDC
      paymentApproved?: boolean; // Pre-approved payment flag
    }
  ): Promise<X402ResourceResponse<T>> {
    const autoPayLimit = options?.autoPayLimit ?? 10; // Default $10 max
    const paymentApproved = options?.paymentApproved ?? false;

    try {
      // Simulate initial request that returns 402
      const mockPaymentRequired = this.simulatePaymentRequired(url);

      if (!mockPaymentRequired) {
        // Resource is free
        return {
          success: true,
          data: this.getMockData(url) as T,
        };
      }

      // Check if payment is within auto-pay limit
      if (mockPaymentRequired.amount > autoPayLimit && !paymentApproved) {
        return {
          success: false,
          paymentRequired: mockPaymentRequired,
          error: `Payment of $${mockPaymentRequired.amount} exceeds auto-pay limit of $${autoPayLimit}`,
        };
      }

      // Execute payment
      const paymentResult = await this.executePayment(mockPaymentRequired);

      if (!paymentResult.success) {
        return {
          success: false,
          paymentRequired: mockPaymentRequired,
          error: paymentResult.error,
        };
      }

      // Create receipt
      const receipt: X402PaymentReceipt = {
        paid: true,
        txHash: paymentResult.txHash,
        amount: mockPaymentRequired.amount,
        timestamp: new Date().toISOString(),
      };

      this.receipts.set(url, receipt);

      // Return the unlocked resource
      return {
        success: true,
        data: this.getMockData(url) as T,
        receipt,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "x402 request failed",
      };
    }
  }

  /**
   * Simulate the 402 Payment Required response from a server
   */
  private simulatePaymentRequired(url: string): X402PaymentRequest | null {
    // Simulate different pricing tiers based on URL patterns
    if (url.includes("/influencer/premium")) {
      return {
        paymentRequired: true,
        amount: 5,
        currency: "USDC",
        paymentAddress: "0xINFLUENCER_WALLET_ADDRESS",
        paymentNetwork: "ARC",
        description: "Premium influencer data access",
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };
    }

    if (url.includes("/influencer/basic")) {
      return {
        paymentRequired: true,
        amount: 1,
        currency: "USDC",
        paymentAddress: "0xINFLUENCER_WALLET_ADDRESS",
        paymentNetwork: "ARC",
        description: "Basic influencer data access",
      };
    }

    if (url.includes("/marketing/campaign")) {
      return {
        paymentRequired: true,
        amount: 10,
        currency: "USDC",
        paymentAddress: "0xMARKETING_SERVICE_WALLET",
        paymentNetwork: "ARC",
        description: "Campaign execution fee",
      };
    }

    if (url.includes("/supplier/data")) {
      return {
        paymentRequired: true,
        amount: 2,
        currency: "USDC",
        paymentAddress: "0xSUPPLIER_DATA_WALLET",
        paymentNetwork: "ARC",
        description: "Real-time supplier pricing data",
      };
    }

    // Free endpoints
    return null;
  }

  /**
   * Execute the x402 payment
   */
  private async executePayment(request: X402PaymentRequest): Promise<TransactionResult> {
    // Check expiration
    if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
      return {
        success: false,
        error: "Payment request has expired",
      };
    }

    // Execute USDC transfer via Arc wallet
    return await arcWallet.transferUSDC(
      request.paymentAddress,
      request.amount
    );
  }

  /**
   * Get mock data for demo purposes
   */
  private getMockData(url: string): any {
    if (url.includes("/influencer")) {
      return {
        influencers: [
          {
            handle: "creativevibes",
            platform: "Instagram",
            followers: 45000,
            engagementRate: 4.2,
            niche: "Lifestyle/Fashion",
            rate: 50,
          },
          {
            handle: "techreview_mike",
            platform: "YouTube",
            followers: 120000,
            engagementRate: 3.8,
            niche: "Tech Reviews",
            rate: 150,
          },
          {
            handle: "artisan_goods",
            platform: "TikTok",
            followers: 28000,
            engagementRate: 6.1,
            niche: "Handmade/Crafts",
            rate: 35,
          },
        ],
        accessLevel: "premium",
        retrievedAt: new Date().toISOString(),
      };
    }

    if (url.includes("/supplier")) {
      return {
        suppliers: [
          {
            name: "GlobalTextiles Co",
            product: "Cotton T-Shirts (100 units)",
            currentPrice: 14.50,
            moq: 100,
            leadTime: "7 days",
          },
          {
            name: "PackagePro",
            product: "Eco-Friendly Mailers (500 units)",
            currentPrice: 0.45,
            moq: 500,
            leadTime: "3 days",
          },
        ],
        priceUpdatedAt: new Date().toISOString(),
      };
    }

    return { status: "ok" };
  }

  /**
   * Get payment receipt for a URL
   */
  getReceipt(url: string): X402PaymentReceipt | undefined {
    return this.receipts.get(url);
  }

  /**
   * Get all payment receipts
   */
  getAllReceipts(): X402PaymentReceipt[] {
    return Array.from(this.receipts.values());
  }
}

export const x402Service = new X402Service();
