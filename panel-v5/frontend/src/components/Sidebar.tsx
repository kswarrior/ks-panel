'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Globe,
  Users,
  ShieldCheck,
  Box,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Instances', icon: Server, href: '/instances' },
  { name: 'Nodes', icon: Globe, href: '/nodes' },
  { name: 'Templates', icon: Box, href: '/templates' },
  { name: 'Users', icon: Users, href: '/users' },
  { name: 'Roles', icon: ShieldCheck, href: '/roles' },
  { name: 'Tickets', icon: MessageSquare, href: '/tickets' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
    {/* Mobile Overlay */}
    {open && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
    )}

    <aside className={`
      w-[280px] bg-[#0d0d0f] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0
      fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-500">
              <Fingerprint size={24} className="text-white" />
           </div>
           <div>
              <h2 className="text-xl font-black tracking-tighter text-white">KS PANEL</h2>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] leading-none mt-1">Version 5.0</p>
           </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose()}
              className={`flex items-center justify-between rounded-xl group transition-all duration-300 overflow-hidden ${
                isActive
                ? 'bg-blue-600/10 text-white border border-blue-500/20'
                : 'text-neutral-500 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3 pl-4 py-3">
                 <item.icon size={18} className={isActive ? 'text-blue-400' : 'group-hover:text-white transition-colors'} />
                 <span className="text-sm font-bold tracking-tight">{item.name}</span>
              </div>
              <div className={`w-12 h-full flex items-center justify-center transition-all ${
                isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 group-hover:bg-white/10 text-neutral-500 group-hover:text-white'
              }`}>
                <ChevronRight size={16} className={isActive ? 'translate-x-0' : '-translate-x-1 group-hover:translate-x-0 transition-transform'} />
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
         <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-[#0d0d0f] flex items-center justify-center text-xs font-black">JE</div>
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate uppercase">jules_engineer</p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Administrator</p>
               </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-tighter">
               <LogOut size={14} />
               Terminal Session Exit
            </button>
         </div>
      </div>
    </aside>
    </>
  );
}
