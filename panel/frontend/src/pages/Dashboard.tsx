import React from "react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
        <span className="w-2 h-8 bg-cyber-blue rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
        System Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card">
          <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Global Status</h3>
          <p className="text-3xl font-black text-white neon-text-blue">Optimal</p>
        </div>
        <div className="glass-card">
          <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total Resources</h3>
          <p className="text-3xl font-black text-white neon-text-purple">92.4 GB</p>
        </div>
        <div className="glass-card">
          <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Network Traffic</h3>
          <p className="text-3xl font-black text-white neon-text-blue">1.2 TB</p>
        </div>
      </div>
    </div>
  );
}
