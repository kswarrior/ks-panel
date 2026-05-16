import React from 'react';

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-neon-blue/20 blur-xl"></div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Under Construction</h1>
      <p className="text-white/50">This module is coming soon to KS PANEL v3</p>
    </div>
  );
}
