'use client';

import React from 'react';
import { Menu, X, Fingerprint } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#0d0d0f] border-b border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.4)]">
          <Fingerprint size={18} className="text-white" />
        </div>
        <h2 className="text-lg font-black tracking-tighter text-white uppercase">KS Panel</h2>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-all active:scale-95"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
