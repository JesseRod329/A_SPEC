"use client";

import { useEffect, useState } from "react";

interface AgentStatus {
  procurement: {
    isActive: boolean;
    dailySpent: number;
    dailyLimit: number;
    eventCount: number;
  };
  marketing: {
    isActive: boolean;
    dailySpent: number;
    dailyLimit: number;
    activeInfluencers: number;
    eventCount: number;
  };
}

export default function AgentStats() {
  const [status, setStatus] = useState<AgentStatus | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.agents);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const procurementPercent =
    (status.procurement.dailySpent / status.procurement.dailyLimit) * 100;
  const marketingPercent =
    (status.marketing.dailySpent / status.marketing.dailyLimit) * 100;

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white/80 mb-4">Agent Stats</h2>

      <div className="space-y-6">
        {/* Procurement Stats */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-aspec-blue">Procurement Budget</span>
            <span className="text-white/60">
              ${status.procurement.dailySpent.toFixed(2)} / $
              {status.procurement.dailyLimit}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-aspec-blue rounded-full transition-all duration-500"
              style={{ width: `${Math.min(procurementPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/40 mt-1">
            {status.procurement.eventCount} events processed
          </p>
        </div>

        {/* Marketing Stats */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-aspec-purple">Marketing Budget</span>
            <span className="text-white/60">
              ${status.marketing.dailySpent.toFixed(2)} / $
              {status.marketing.dailyLimit}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-aspec-purple rounded-full transition-all duration-500"
              style={{ width: `${Math.min(marketingPercent, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{status.marketing.eventCount} events</span>
            <span>{status.marketing.activeInfluencers} active collaborations</span>
          </div>
        </div>

        {/* Guardrails Info */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-xs font-medium text-white/50 mb-2">
            Active Guardrails
          </h3>
          <ul className="text-xs text-white/40 space-y-1">
            <li>• Max single transaction: $500 USDC</li>
            <li>• Procurement daily limit: $2,000 USDC</li>
            <li>• Marketing daily limit: $500 USDC</li>
            <li>• Min confidence threshold: 60%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
