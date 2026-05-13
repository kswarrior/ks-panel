"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Users,
  ShieldCheck,
  Settings,
  Database,
  Cpu,
  FileText,
  Puzzle,
  LogOut,
  User
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Instances", href: "/instances", icon: Server },
];

const adminItems = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Nodes", href: "/admin/nodes", icon: Cpu },
  { name: "Templates", href: "/admin/templates", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Addons", href: "/admin/plugins", icon: Puzzle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 flex flex-col transition-all duration-300">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 border border-cyber-purple/30 flex items-center justify-center shadow-[0_0_15px_rgba(157,0,255,0.2)]">
            <Server className="w-6 h-6 text-cyber-purple" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white neon-text-purple">KS PANEL</h1>
            <span className="text-[10px] font-bold text-cyber-purple uppercase tracking-[0.3em]">Next Gen</span>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 mx-4 my-6 glass bg-white/[0.02] border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center">
              <User className="w-5 h-5 text-cyber-blue" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-bg shadow-[0_0_8px_rgba(57,255,20,0.5)]"></div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate">Administrator</span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Global Owner</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto">
        <div>
          <p className="px-4 mb-4 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Main Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 mb-4 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Administration</p>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: any; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
        active
          ? "text-white bg-white/5 neon-border-purple shadow-[inset_0_0_20px_rgba(157,0,255,0.05)]"
          : "text-neutral-400 hover:text-white hover:bg-white/5"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5 transition-all duration-300",
        active ? "text-cyber-purple drop-shadow-[0_0_8px_rgba(157,0,255,0.8)]" : "group-hover:scale-110"
      )} />
      <span className="font-bold tracking-wide">{item.name}</span>

      {active && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyber-purple rounded-l-full shadow-[0_0_10px_rgba(157,0,255,0.8)]" />
      )}
    </Link>
  );
}
