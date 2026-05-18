import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Server,
  Layers,
  Palette,
  Bell,
  MessageSquare,
  Activity,
  Box
} from 'lucide-react';
import { ExtensionSlot } from './ExtensionFramework';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ isOpen, onClose }: any) {
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => setUser(data)).catch(() => {});
  }, []);

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.permissions === '*') return true;
    return user.permissions.split(',').includes(perm);
  };

  const navItems = [
    { name: 'Instances', icon: Box, href: '/instances', perm: 'view_instances' },
    { name: 'Nodes', icon: Server, href: '/node', perm: 'view_nodes' },
    { name: 'Database', icon: Server, href: '/database', perm: 'view_nodes' },
    { name: 'Templates', icon: Layers, href: '/templates', perm: 'view_templates' },
    { name: 'Users', icon: Users, href: '/user', perm: 'view_users' },
    { name: 'Roles', icon: ShieldCheck, href: '/role', perm: 'view_roles' },
    { name: 'Themes', icon: Palette, href: '/theme', perm: 'view_themes' },
    { name: 'Support', icon: MessageSquare, href: '/ticket', perm: 'view_instances' },
    { name: 'Settings', icon: Settings, href: '/settings', perm: 'manage_settings' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-[var(--header-height,64px)] bottom-0 w-[var(--sidebar-width,256px)] glass-dark border-r border-white/5 z-[70] transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-6">
           <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Core Management</p>
           <nav className="space-y-1">
              {navItems.filter(item => hasPermission(item.perm)).map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-neon-blue/10 text-neon-blue font-bold border border-neon-blue/20"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-neon-blue" : "text-white/20 group-hover:text-white/60")} />
                    <span className="text-sm">{item.name}</span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon-blue rounded-r-full shadow-neon" />
                    )}
                  </Link>
                );
              })}
           </nav>
        </div>

        <div className="px-6 mb-6">
           <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Extensions</p>
           <div className="space-y-2">
              <ExtensionSlot id="sidebar-bottom" />
           </div>
        </div>

        <div className="mt-auto px-6">
           <div className="p-5 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/10">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Activity className="w-4 h-4 text-green-500" />
                 </div>
                 <div>
                    <p className="text-xs font-bold leading-none mb-1 text-green-500">Node Status</p>
                    <p className="text-[10px] text-white/40 font-medium">System Operational</p>
                 </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-full" />
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
}
