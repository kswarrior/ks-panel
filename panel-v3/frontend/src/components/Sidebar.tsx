import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Instances', icon: LayoutDashboard, href: '/' },
    { name: 'Users', icon: Users, href: '/users' },
    { name: 'Roles', icon: ShieldCheck, href: '/roles' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-64 glass-dark z-[70] transition-transform duration-300 lg:translate-x-0 lg:top-16",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 lg:hidden flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight">KS PANEL</span>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-md">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-neon-blue" : "group-hover:text-white"
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-neon-blue rounded-full shadow-neon" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-gradient-to-br from-neon-blue/20 to-transparent border border-neon-blue/20">
              <p className="text-xs font-semibold text-neon-blue uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
