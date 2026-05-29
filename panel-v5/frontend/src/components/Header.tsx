'use client';

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">KS</span>
           </div>
           <h2 className="text-sm font-black tracking-tighter text-white uppercase">KS PANEL</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button className="p-2 text-neutral-500 hover:text-white transition-colors">
            <Bell size={20} />
         </button>
         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
            <div className="w-full h-full rounded-full bg-[#0d0d0f] flex items-center justify-center text-[10px] font-black">JE</div>
         </div>
      </div>
    </header>
  );
}
