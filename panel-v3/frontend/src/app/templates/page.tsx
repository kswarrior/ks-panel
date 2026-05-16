"use client";

import React from 'react';
import { Box, Code, Cpu, Database, Layout, Search } from 'lucide-react';

const templates = [
  { id: 1, name: 'Minecraft Vanilla', type: 'Game Server', icon: Box, description: 'Standard Minecraft server with no mods or plugins.' },
  { id: 2, name: 'PaperMC', type: 'Game Server', icon: Box, description: 'High-performance Minecraft server with plugin support.' },
  { id: 3, name: 'Node.js App', type: 'Web Service', icon: Code, description: 'General purpose Node.js environment for web applications.' },
  { id: 4, name: 'Python Flask', type: 'API', icon: Layout, description: 'Lightweight Python web framework environment.' },
  { id: 5, name: 'Redis Stack', type: 'Database', icon: Database, description: 'In-memory data structure store with modules.' },
  { id: 6, name: 'PostgreSQL', type: 'Database', icon: Database, description: 'Advanced open-source relational database.' },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-white/50">Browse and deploy pre-configured environments</p>
        </div>
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-blue transition-colors" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-neon-blue/30 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20 mb-4 group-hover:shadow-neon transition-all">
              <tpl.icon className="w-6 h-6 text-neon-blue" />
            </div>
            <div className="space-y-1 mb-4">
              <h3 className="font-bold text-lg group-hover:text-neon-blue transition-colors">{tpl.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tpl.type}</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {tpl.description}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <button className="text-xs font-bold text-neon-blue hover:underline">View details</button>
              <button className="neon-button text-[10px] py-1 px-3 uppercase tracking-tighter">Deploy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
