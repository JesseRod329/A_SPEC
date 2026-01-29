"use client";

import { useEffect, useState } from "react";

interface OrbProps {
  status: "idle" | "thinking" | "executing" | "settled" | "error";
  transactionCount: number;
}

export default function OrbVisualization({ status, transactionCount }: OrbProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "thinking":
        return { primary: "#3B82F6", glow: "rgba(59, 130, 246, 0.4)" };
      case "executing":
        return { primary: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)" };
      case "settled":
        return { primary: "#10B981", glow: "rgba(16, 185, 129, 0.4)" };
      case "error":
        return { primary: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" };
      default:
        return { primary: "#8B5CF6", glow: "rgba(139, 92, 246, 0.4)" };
    }
  };

  const colors = getStatusColor();
  const isActive = status === "thinking" || status === "executing";

  if (!mounted) {
    return (
      <div className="w-full h-64 rounded-xl glass flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-aspec-purple/30 border-t-aspec-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-xl glass relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full opacity-60 animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: colors.primary,
              animationDuration: `${3 + particle.delay}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Central orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer glow rings */}
        <div
          className={`absolute w-40 h-40 rounded-full transition-all duration-500 ${
            isActive ? "animate-ping" : ""
          }`}
          style={{
            backgroundColor: colors.glow,
            opacity: 0.2,
          }}
        />
        <div
          className={`absolute w-32 h-32 rounded-full transition-all duration-500 ${
            isActive ? "animate-pulse" : ""
          }`}
          style={{
            backgroundColor: colors.glow,
            opacity: 0.3,
          }}
        />

        {/* Main orb */}
        <div
          className={`relative w-24 h-24 rounded-full transition-all duration-500 ${
            isActive ? "animate-pulse scale-110" : "scale-100"
          }`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.primary}, ${colors.primary}88)`,
            boxShadow: `0 0 60px ${colors.glow}, inset 0 0 30px rgba(255,255,255,0.2)`,
          }}
        >
          {/* Highlight */}
          <div
            className="absolute top-3 left-4 w-6 h-6 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
            }}
          />

          {/* Status icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === "thinking" && (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {status === "executing" && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {status === "settled" && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === "error" && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {status === "idle" && (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            )}
          </div>
        </div>

        {/* Orbiting ring */}
        <div
          className={`absolute w-36 h-36 rounded-full border-2 transition-all duration-500 ${
            isActive ? "animate-spin" : ""
          }`}
          style={{
            borderColor: `${colors.primary}40`,
            animationDuration: "8s",
          }}
        >
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        </div>
      </div>

      {/* Status indicator overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isActive ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: colors.primary }}
        />
        <span className="text-xs text-white/70 capitalize">{status}</span>
        {transactionCount > 0 && (
          <span className="text-xs text-aspec-green ml-2">
            {transactionCount} tx
          </span>
        )}
      </div>
    </div>
  );
}
