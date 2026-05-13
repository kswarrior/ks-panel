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
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        isActive ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
      )}
      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-500' : ''}`} />
      <span className="ml-1">{children}</span>
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
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            KS
          </div>
          <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <span className="text-sm font-bold text-white tracking-tight">KS Panel</span>
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]">Next Gen</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Main */}
          <div>
            {!isCollapsed && <p className="px-4 mb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">Main</p>}
            <div className="space-y-1">
              <NavLink href="/instances" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              )}>Instances</NavLink>
            </div>
          </div>

          {/* Administration */}
          <div>
            {!isCollapsed && <p className="px-4 mb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">Administration</p>}
            <div className="space-y-1">
              <NavLink href="/admin/users" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}>Users</NavLink>
              <NavLink href="/admin/nodes" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
              )}>Nodes</NavLink>
              <NavLink href="/admin/roles" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              )}>Roles</NavLink>
              <NavLink href="/admin/templates" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              )}>Templates</NavLink>
              <NavLink href="/admin/settings" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}>Settings</NavLink>
              <NavLink href="/admin/theme" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              )}>Theme</NavLink>
              <NavLink href="/admin/language" icon={(props: any) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}>Language</NavLink>
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5">
           <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold shrink-0 shadow-lg shadow-blue-500/10 border border-blue-500/20">
                 AD
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">Administrator</span>
                  <Link href="/api/auth/signout" className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] hover:text-red-400 transition-colors">SIGN OUT</Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </aside>
  );
};
