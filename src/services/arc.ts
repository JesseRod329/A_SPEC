import { ethers } from "ethers";

// Arc testnet configuration
const ARC_TESTNET_CONFIG = {
  chainId: 1921, // Arc testnet chain ID
  rpcUrl: process.env.ARC_RPC_URL || "https://testnet-rpc.arc.network",
  explorerUrl: "https://testnet-explorer.arc.network",
  nativeCurrency: {
    name: "ARC",
    symbol: "ARC",
    decimals: 18,
  },
  // USDC contract on Arc testnet (mock address for demo)
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// Standard ERC20 ABI for USDC
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
  gasUsed?: string;
}

export interface WalletBalance {
  arc: string;
  usdc: string;
  address: string;
}

class ArcWalletService {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private usdcContract: ethers.Contract | null = null;
  private mockMode: boolean = false;
  private mockBalance: number = 10000; // Mock USDC balance for demo

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Check if we have a real private key
      const privateKey = process.env.ARC_WALLET_PRIVATE_KEY;

      if (!privateKey || privateKey === "your_testnet_key") {
        console.log("Arc wallet: Running in mock mode (no private key configured)");
        this.mockMode = true;
        return;
      }

      this.provider = new ethers.providers.JsonRpcProvider(ARC_TESTNET_CONFIG.rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.usdcContract = new ethers.Contract(
        ARC_TESTNET_CONFIG.usdcAddress,
        ERC20_ABI,
        this.wallet
      );

      console.log("Arc wallet initialized:", this.wallet.address);
    } catch (error) {
      console.log("Arc wallet: Running in mock mode (initialization failed)");
      this.mockMode = true;
    }
  }

  async getBalance(): Promise<WalletBalance> {
    if (this.mockMode) {
      return {
        arc: "100.00",
        usdc: this.mockBalance.toFixed(2),
        address: "0xMOCK_WALLET_ADDRESS_FOR_DEMO",
      };
    }

    try {
      const arcBalance = await this.wallet!.getBalance();
      const usdcBalance = await this.usdcContract!.balanceOf(this.wallet!.address);

      return {
        arc: ethers.utils.formatEther(arcBalance),
        usdc: ethers.utils.formatUnits(usdcBalance, 6), // USDC has 6 decimals
        address: this.wallet!.address,
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      return {
        arc: "0.00",
        usdc: "0.00",
        address: this.wallet?.address || "unknown",
      };
    }
  }

  async transferUSDC(to: string, amount: number): Promise<TransactionResult> {
    if (this.mockMode) {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (amount > this.mockBalance) {
        return {
          success: false,
          error: "Insufficient USDC balance",
        };
      }

      this.mockBalance -= amount;
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        explorerUrl: `${ARC_TESTNET_CONFIG.explorerUrl}/tx/${mockTxHash}`,
        gasUsed: "21000",
      };
    }

    try {
      // Convert amount to USDC units (6 decimals)
      const amountInUnits = ethers.utils.parseUnits(amount.toString(), 6);

      const tx = await this.usdcContract!.transfer(to, amountInUnits);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.transactionHash,
        explorerUrl: `${ARC_TESTNET_CONFIG.explorerUrl}/tx/${receipt.transactionHash}`,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error("USDC transfer error:", error);
      return {
        success: false,
        error: error.message || "Transaction failed",
      };
    }
  }

  getExplorerUrl(txHash: string): string {
    return `${ARC_TESTNET_CONFIG.explorerUrl}/tx/${txHash}`;
  }

  isInMockMode(): boolean {
    return this.mockMode;
  }

  // For demo purposes: add funds to mock wallet
  addMockFunds(amount: number) {
    if (this.mockMode) {
      this.mockBalance += amount;
    }
  }
}

export const arcWallet = new ArcWalletService();
