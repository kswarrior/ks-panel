'use client';

import React from 'react';
import { Menu, X, Fingerprint, Terminal, Bell } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-1 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-cyan-500/10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 chamfered bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:text-white transition-all active:scale-95"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex w-8 h-8 glass chamfered items-center justify-center border-cyan-500/30 border shadow-[0_0_10px_rgba(0,242,255,0.1)]">
            <Fingerprint size={18} className="text-[#00f2ff]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[10px] sm:text-sm font-black tracking-widest text-white uppercase italic flex items-center gap-2 truncate">
              <span className="hidden md:inline text-neutral-500">SYSTEM /</span>
              DASHBOARD
            </h2>
            <p className="text-[8px] sm:text-[9px] font-bold text-cyan-500 uppercase tracking-[0.2em] leading-none mt-1 truncate">Uplink Status: Optimized</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="w-10 h-10 chamfered bg-white/5 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all relative group">
           <Bell size={18} />
           <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff003c] rounded-full shadow-[0_0_5px_#ff003c]" />
           <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity chamfered" />
        </button>

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* Global Search / CLI trigger */}
        <button className="hidden md:flex items-center gap-3 px-4 py-2 chamfered bg-white/5 border border-white/5 text-neutral-500 hover:text-white hover:border-white/10 transition-all group">
           <Terminal size={14} className="text-cyan-500" />
           <span className="text-[10px] font-black uppercase tracking-widest">COMMAND_LKR</span>
           <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] border border-white/10">CTRL+K</span>
        </button>
      </div>
    </header>
  );
}
