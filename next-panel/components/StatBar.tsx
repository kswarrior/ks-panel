"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatBarProps {
  label: string;
  value: string | number;
  percentage: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "pink" | "green";
}

export function StatBar({ label, value, percentage, icon, color }: StatBarProps) {
  const colors = {
    blue: "from-cyber-blue/50 to-cyber-blue shadow-[0_0_10px_rgba(0,255,255,0.4)]",
    purple: "from-cyber-purple/50 to-cyber-purple shadow-[0_0_10px_rgba(157,0,255,0.4)]",
    pink: "from-cyber-pink/50 to-cyber-pink shadow-[0_0_10px_rgba(255,0,255,0.4)]",
    green: "from-cyber-green/50 to-cyber-green shadow-[0_0_10px_rgba(57,255,20,0.4)]",
  };

  const textColors = {
    blue: "text-cyber-blue",
    purple: "text-cyber-purple",
    pink: "text-cyber-pink",
    green: "text-cyber-green",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <div className={cn("w-3 h-3", textColors[color])}>{icon}</div>
          <span>{label}</span>
        </div>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", colors[color])}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
