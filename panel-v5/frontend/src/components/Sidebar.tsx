'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Fingerprint,
  Terminal,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'DASHBOARD', icon: LayoutDashboard, href: '/' },
  { name: 'INSTANCES', icon: Server, href: '/instances' },
  { name: 'NODES', icon: Globe, href: '/nodes' },
  { name: 'TEMPLATES', icon: Box, href: '/templates' },
  { name: 'USERS', icon: Users, href: '/users' },
  { name: 'ROLES', icon: ShieldCheck, href: '/roles' },
  { name: 'TICKETS', icon: MessageSquare, href: '/tickets' },
  { name: 'SETTINGS', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // The backend uses GET /auth/logout according to grep results
      const response = await fetch('/auth/logout', { method: 'GET' });
      // Even if it redirects, we want to go to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/auth/login');
    }
  };

  return (
    <>
    {/* Mobile Overlay */}
    {open && (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
        onClick={onClose}
      />
    )}

    <aside className={`
      w-[280px] bg-[#0a0a0c] border-r border-cyan-500/10 flex flex-col h-screen sticky top-0 shrink-0
      fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Sidebar Header / Logo */}
      <div className="p-8 border-b border-cyan-500/5">
        <div className="flex items-center gap-3 group cursor-pointer">
           <div className="w-12 h-12 glass chamfered flex items-center justify-center border-cyan-500/30 border shadow-[0_0_15px_rgba(0,242,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all duration-500">
              <Fingerprint size={28} className="text-[#00f2ff] text-glow-cyan" />
           </div>
           <div>
              <h2 className="text-2xl font-black tracking-tighter text-white italic leading-none">NEXUS</h2>
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em] leading-none mt-1">CORE OS v5.0</p>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative">
        {/* Background Scanline for Sidebar */}
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose()}
              className={`flex items-center justify-between chamfered group transition-all duration-300 relative overflow-hidden ${
                isActive
                ? 'bg-cyan-500/10 text-[#00f2ff] border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(0,242,255,0.05)]'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4 pl-5 py-4">
                 <item.icon size={18} className={isActive ? 'text-[#00f2ff] drop-shadow-[0_0_5px_#00f2ff]' : 'group-hover:text-cyan-400 transition-colors'} />
                 <span className="text-xs font-black tracking-widest">{item.name}</span>
              </div>

              {isActive && (
                <div className="w-1 h-8 bg-cyan-500 absolute right-0 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f2ff]" />
              )}

              {!isActive && (
                <div className="w-8 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight size={14} className="text-cyan-500" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / User Profile */}
      <div className="p-4 border-t border-cyan-500/5 bg-black/20">
         <div className="glass chamfered p-4 border-white/5 space-y-4 relative overflow-hidden group/user">
            <div className="absolute inset-0 bg-cyan-500/5 translate-x-[-100%] group-hover/user:translate-x-0 transition-transform duration-700" />

            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 chamfered border border-cyan-500/30 p-0.5 relative">
                  <div className="w-full h-full chamfered bg-cyan-500/10 flex items-center justify-center text-xs font-black text-cyan-500">
                    AD
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">ADMIN_IDENT_01</p>
                  <p className="text-[9px] font-bold text-cyan-500/60 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={8} />
                    UPLINK ACTIVE
                  </p>
               </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full chamfered flex items-center justify-center gap-2 py-3 bg-[#ff003c]/10 text-[#ff003c] text-[10px] font-black hover:bg-[#ff003c] hover:text-white transition-all uppercase tracking-widest border border-[#ff003c]/20 relative z-10"
            >
               <LogOut size={12} />
               TERMINATE SESSION
            </button>
         </div>
      </div>
    </aside>
    </>
  );
}
