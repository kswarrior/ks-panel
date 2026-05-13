'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NavLink = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon: any }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        isActive ? 'text-white bg-white/5 shadow-[inset_4px_0_0_0_#3b82f6]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-500' : ''}`} />
      <span>{children}</span>
    </Link>
  );
};

export const Sidebar = ({ isOpen, isCollapsed, toggleMobile }: { isOpen: boolean, isCollapsed: boolean, toggleMobile: () => void }) => {
  return (
    <aside
      id="pc-sidebar"
      className={`fixed inset-y-0 z-50 flex flex-col glass border-r border-white/5 transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            KS
          </div>
          <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <span className="text-sm font-bold text-white tracking-tight">KS Panel</span>
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Next Gen</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Main */}
          <div>
            {!isCollapsed && <p className="px-4 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Main</p>}
            <div className="space-y-1">
              <NavLink href="/dashboard" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              )}>Overview</NavLink>
              <NavLink href="/instances" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              )}>Instances</NavLink>
            </div>
          </div>

          {/* Administration */}
          <div>
            {!isCollapsed && <p className="px-4 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Administration</p>}
            <div className="space-y-1">
              <NavLink href="/admin/users" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}>Users</NavLink>
              <NavLink href="/admin/nodes" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
              )}>Nodes</NavLink>
              <NavLink href="/admin/settings" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}>Settings</NavLink>
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5">
           <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold shrink-0">
                 AD
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">Administrator</span>
                  <Link href="/api/auth/signout" className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors">Sign Out</Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </aside>
  );
};
