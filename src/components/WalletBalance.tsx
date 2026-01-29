"use client";

import { useEffect, useState } from "react";

interface Balance {
  arc: string;
  usdc: string;
  address: string;
}

export default function WalletBalance() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.wallet);
        setMockMode(data.mockMode);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/80">Wallet Balance</h2>
        {mockMode && (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            Demo Mode
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-white/50 mb-1">USDC Balance</p>
          <p className="text-3xl font-bold text-aspec-green">
            ${balance?.usdc || "0.00"}
          </p>
        </div>

        <div>
          <p className="text-sm text-white/50 mb-1">ARC Balance</p>
          <p className="text-xl font-semibold text-white/90">
            {balance?.arc || "0.00"} ARC
          </p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">
            {balance?.address || "Not connected"}
          </p>
        </div>
      </div>
    </div>
  );
}
