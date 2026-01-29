"use client";

import { useEffect, useState } from "react";

interface AgentEvent {
  id: string;
  timestamp: string;
  type: string;
  data: {
    supplier?: string;
    product?: string;
    influencer?: string;
    platform?: string;
    decision?: {
      action: string;
      reasoning: string;
      confidence: number;
    };
    transaction?: {
      success: boolean;
      txHash?: string;
      explorerUrl?: string;
      error?: string;
    };
    thought?: string;
    error?: string;
  };
}

interface AgentFeedProps {
  agentType: "procurement" | "marketing";
  title: string;
}

export default function AgentFeed({ agentType, title }: AgentFeedProps) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isActive, setIsActive] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "events", data: { count: 10 } }),
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data[agentType] || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      const data = await response.json();
      if (data.success) {
        setIsActive(data.agents[agentType]?.isActive || false);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStatus();
    const interval = setInterval(() => {
      fetchEvents();
      fetchStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, [agentType]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "analysis":
      case "discovery":
        return "🔍";
      case "decision":
      case "evaluation":
        return "🧠";
      case "execution":
      case "payment":
        return "💸";
      case "campaign":
        return "📢";
      case "error":
        return "❌";
      default:
        return "📌";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "analysis":
      case "discovery":
        return "border-aspec-blue";
      case "decision":
      case "evaluation":
        return "border-aspec-purple";
      case "execution":
      case "payment":
        return "border-aspec-green";
      case "campaign":
        return "border-aspec-gold";
      case "error":
        return "border-red-500";
      default:
        return "border-white/20";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/80">{title}</h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? "bg-aspec-green animate-pulse" : "bg-white/30"
            }`}
          ></span>
          <span className="text-xs text-white/50">
            {isActive ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">
            No activity yet. Trigger an agent action to see events.
          </p>
        ) : (
          events.slice().reverse().map((event) => (
            <div
              key={event.id}
              className={`border-l-2 ${getEventColor(event.type)} pl-3 py-2`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90">
                    {event.data.thought || event.data.error || "Processing..."}
                  </p>
                  {event.data.decision && (
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          event.data.decision.action === "EXECUTE"
                            ? "bg-aspec-green/20 text-aspec-green"
                            : event.data.decision.action === "REJECT"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-aspec-gold/20 text-aspec-gold"
                        }`}
                      >
                        {event.data.decision.action}
                      </span>
                      <span className="text-xs text-white/50">
                        {event.data.decision.confidence}% confidence
                      </span>
                    </div>
                  )}
                  {event.data.transaction?.txHash && (
                    <a
                      href={event.data.transaction.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-aspec-blue hover:underline mt-1 block truncate"
                    >
                      TX: {event.data.transaction.txHash.slice(0, 20)}...
                    </a>
                  )}
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
