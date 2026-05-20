'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Activity, Server, Cpu, HardDrive, LayoutGrid, List, MoreVertical, Play, Square, RotateCcw, ExternalLink } from 'lucide-react';

export default function InstancesPage() {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase">
              INSTANCES
            </h1>
            <p className="text-neutral-400 font-medium">Manage and monitor your virtualized applications.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mr-2">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'text-purple-400 bg-purple-400/10' : 'text-neutral-400 hover:bg-white/5'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-xl transition-all ${view === 'list' ? 'text-purple-400 bg-purple-400/10' : 'text-neutral-400 hover:bg-white/5'}`}
              >
                <List size={20} />
              </button>
            </div>

            <div className="relative group min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search instances..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-95">
              <Plus size={18} />
              NEW INSTANCE
            </button>
          </div>
        </header>

        {/* Instance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* Example Instance Card */}
          <div className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                    <Server size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">Production-API-01</h3>
                    <p className="text-xs text-neutral-500 mt-1 font-mono">127.0.0.1:25565</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                   <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Running</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                    <Cpu size={10} /> CPU
                  </p>
                  <p className="text-sm font-bold">12.5%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={10} /> RAM
                  </p>
                  <p className="text-sm font-bold">2.4 / 4 GB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                    <HardDrive size={10} /> DISK
                  </p>
                  <p className="text-sm font-bold">15 / 50 GB</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all">
                  <Play size={16} />
                </button>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 transition-all">
                  <RotateCcw size={16} />
                </button>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all">
                  <Square size={16} />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all">
                MANAGE
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
