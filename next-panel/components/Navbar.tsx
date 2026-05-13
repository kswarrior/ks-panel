"use client";

import React from "react";
import { Bell, Search, Zap, LifeBuoy } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-4 left-72 right-6 z-40 h-16 glass px-6 flex items-center justify-between border-white/5 shadow-2xl">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search instances, nodes, or files..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyber-purple/50 focus:border-cyber-purple/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-xl text-neutral-400 hover:text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300 group" title="System Latency">
          <Zap className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
        </button>

        <button className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300" title="Support">
          <LifeBuoy className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        <button className="relative p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyber-pink rounded-full border border-cyber-bg shadow-[0_0_8px_rgba(255,0,255,0.8)]"></span>
        </button>
      </div>
    </header>
  );
}
