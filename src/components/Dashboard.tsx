"use client";

import { useState } from "react";
import WalletBalance from "./WalletBalance";
import AgentFeed from "./AgentFeed";
import AgentControls from "./AgentControls";
import AgentStats from "./AgentStats";
import OrbVisualization from "./OrbVisualization";

type AgentStatus = "idle" | "thinking" | "executing" | "settled" | "error";

export default function Dashboard() {
  const [lastResult, setLastResult] = useState<any>(null);
  const [orbStatus, setOrbStatus] = useState<AgentStatus>("idle");
  const [transactionCount, setTransactionCount] = useState(0);

  const handleTrigger = async (agentType: string, action: string) => {
    try {
      setOrbStatus("thinking");
      let endpoint = "/api/agent";
      let body: any = {};

      if (action === "reset") {
        body = { action: "reset" };
      } else if (action === "discover") {
        body = { action: "discover", agentType };
      } else {
        body = { action: "analyze", agentType };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setOrbStatus("executing");
      const result = await response.json();
      setLastResult(result);
      console.log("Agent result:", result);

      // Update orb status based on result
      if (result.transaction?.success) {
        setTransactionCount((prev) => prev + 1);
        setOrbStatus("settled");
      } else if (result.error) {
        setOrbStatus("error");
      } else {
        setOrbStatus("settled");
      }

      // Reset to idle after a delay
      setTimeout(() => setOrbStatus("idle"), 3000);
    } catch (error) {
      console.error("Agent trigger error:", error);
      setOrbStatus("error");
      setTimeout(() => setOrbStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-aspec-blue via-aspec-purple to-aspec-green bg-clip-text text-transparent">
              A_SPEC
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Agentic Supply, Promotion & Exchange Center
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-aspec-green/20 text-aspec-green text-xs rounded-full">
              Arc Testnet
            </span>
            <span className="px-3 py-1 bg-aspec-blue/20 text-aspec-blue text-xs rounded-full">
              Gemini 2.0 Flash
            </span>
          </div>
        </div>
      </header>

      {/* 3D Visualization */}
      <div className="mb-6 relative">
        <OrbVisualization status={orbStatus} transactionCount={transactionCount} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet & Controls */}
        <div className="space-y-6">
          <WalletBalance />
          <AgentControls onTrigger={handleTrigger} />
          <AgentStats />
        </div>

        {/* Middle Column - Procurement Agent */}
        <div>
          <AgentFeed agentType="procurement" title="Procurement Agent" />
        </div>

        {/* Right Column - Marketing Agent */}
        <div>
          <AgentFeed agentType="marketing" title="Marketing Agent" />
        </div>
      </div>

      {/* Last Result Display */}
      {lastResult && (
        <div className="mt-6 glass rounded-xl p-6">
          <h3 className="text-sm font-medium text-white/60 mb-2">
            Last Agent Response
          </h3>
          <pre className="text-xs text-white/80 overflow-auto max-h-40 bg-black/20 rounded-lg p-4">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-white/30 text-sm">
        <p>Built for Agentic Commerce on Arc Hackathon 2026</p>
        <p className="mt-1">
          Powered by Gemini 2.0 Flash | Circle USDC | Arc Blockchain | x402 Protocol
        </p>
      </footer>
    </div>
  );
}
