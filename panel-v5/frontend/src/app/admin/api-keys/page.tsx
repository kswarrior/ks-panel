'use client';

import React from 'react';
import { Key, Plus, Trash2, Shield, Clock } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent uppercase">
              API ACCESS
            </h1>
            <p className="text-neutral-400 font-medium">Manage programmatic access tokens for the Nexus API.</p>
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all active:scale-95">
            <Plus size={18} />
            GENERATE KEY
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
           {/* Key Row */}
           <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Key size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg leading-none">External-Metrics-Collector</h3>
                    <p className="text-xs font-mono text-neutral-500 mt-2">ks_live_••••••••••••••••••••••••••••</p>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                       <Shield size={10} /> Permissions
                    </p>
                    <p className="text-xs font-bold">Read-Only / System Stats</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={10} /> Created
                    </p>
                    <p className="text-xs font-bold text-neutral-400">Oct 12, 2023</p>
                 </div>
                 <button className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
