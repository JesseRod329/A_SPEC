"use client";

import { useState } from "react";

interface AgentControlsProps {
  onTrigger: (agentType: string, action: string) => void;
}

export default function AgentControls({ onTrigger }: AgentControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (agentType: string, action: string) => {
    setLoading(`${agentType}-${action}`);
    try {
      await onTrigger(agentType, action);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (agentType: string, action: string) =>
    loading === `${agentType}-${action}`;

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white/80 mb-4">Agent Controls</h2>

      <div className="space-y-6">
        {/* Procurement Agent */}
        <div>
          <h3 className="text-sm font-medium text-aspec-blue mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aspec-blue"></span>
            Procurement Agent
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("procurement", "analyze")}
              disabled={isLoading("procurement", "analyze")}
              className="px-4 py-2 bg-aspec-blue/20 hover:bg-aspec-blue/30 text-aspec-blue rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading("procurement", "analyze") ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-aspec-blue/30 border-t-aspec-blue rounded-full animate-spin"></span>
                  Analyzing...
                </span>
              ) : (
                "Analyze Prices"
              )}
            </button>
          </div>
        </div>

        {/* Marketing Agent */}
        <div>
          <h3 className="text-sm font-medium text-aspec-purple mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aspec-purple"></span>
            Marketing Agent
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("marketing", "discover")}
              disabled={isLoading("marketing", "discover")}
              className="px-4 py-2 bg-aspec-purple/20 hover:bg-aspec-purple/30 text-aspec-purple rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading("marketing", "discover") ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-aspec-purple/30 border-t-aspec-purple rounded-full animate-spin"></span>
                  Discovering...
                </span>
              ) : (
                "Discover Influencers"
              )}
            </button>
            <button
              onClick={() => handleAction("marketing", "analyze")}
              disabled={isLoading("marketing", "analyze")}
              className="px-4 py-2 bg-aspec-purple/20 hover:bg-aspec-purple/30 text-aspec-purple rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading("marketing", "analyze") ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-aspec-purple/30 border-t-aspec-purple rounded-full animate-spin"></span>
                  Evaluating...
                </span>
              ) : (
                "Evaluate & Engage"
              )}
            </button>
          </div>
        </div>

        {/* System Controls */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white/60 mb-3">System</h3>
          <button
            onClick={() => handleAction("system", "reset")}
            disabled={isLoading("system", "reset")}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reset Agents
          </button>
        </div>
      </div>
    </div>
  );
}
