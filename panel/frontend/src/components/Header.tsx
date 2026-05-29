'use client';

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden lg:flex items-center relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" size={16} />
           <input
              type="text"
              placeholder="Search command..."
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all w-64"
           />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">KS</span>
           </div>
           <h2 className="text-sm font-black tracking-tighter text-white uppercase">KS PANEL</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button className="p-2 text-neutral-500 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0c]"></span>
         </button>
         <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-white uppercase leading-none">jules_engineer</p>
               <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
               <div className="w-full h-full rounded-full bg-[#0d0d0f] flex items-center justify-center text-[10px] font-black">JE</div>
            </div>
         </div>
      </div>
    </header>
  );
}
