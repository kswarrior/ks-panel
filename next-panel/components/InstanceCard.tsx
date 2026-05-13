"use client";

import React, { useEffect, useState } from "react";
import { Cpu, HardDrive, Layout, Activity, ExternalLink, ShieldAlert } from "lucide-react";
import { StatBar } from "./StatBar";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Instance {
  Id: string;
  Name: string;
  Node: { name: string } | null;
  ContainerId: string | null;
  VolumeId: string | null;
  Disk: number;
  suspended?: boolean;
}

interface InstanceStats {
  cpu: number;
  ram: number;
  disk: number;
  status: "online" | "offline" | "loading";
}

export function InstanceCard({ instance }: { instance: Instance }) {
  const [stats, setStats] = useState<InstanceStats>({
    cpu: 0,
    ram: 0,
    disk: 0,
    status: "loading",
  });

  // WebSocket Logic (Simplified for component)
  useEffect(() => {
    if (!instance.ContainerId) return;

    // In a real implementation, this would connect to the panel's WS
    // For now, we simulate data or leave it as loading
    const timer = setTimeout(() => {
      setStats({
        cpu: Math.random() * 50,
        ram: Math.random() * 80,
        disk: Math.random() * 40,
        status: instance.suspended ? "offline" : "online",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [instance.ContainerId, instance.suspended]);

  return (
    <div className="glass-card group relative overflow-hidden border-white/5">
      {/* Suspended Overlay */}
      {instance.suspended && (
        <div className="absolute inset-0 bg-red-500/5 z-0 pointer-events-none" />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-cyber-blue/50 group-hover:bg-cyber-blue/5 transition-all duration-500">
            <Layout className="w-6 h-6 text-neutral-400 group-hover:text-cyber-blue group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
          </div>
          <div>
            <h3 className="font-black text-white tracking-tight group-hover:text-cyber-blue transition-colors">
              {instance.Name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-neutral-600 font-mono uppercase tracking-widest">
                {instance.Id.substring(0, 8)}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {instance.Node?.name || "No Node"}
              </span>
            </div>
          </div>
        </div>

        <button className="p-2 rounded-lg text-neutral-600 hover:text-white hover:bg-white/5 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]",
          stats.status === "online"
            ? "bg-cyber-green/5 border-cyber-green/20 text-cyber-green shadow-[0_0_15px_rgba(57,255,20,0.1)]"
            : stats.status === "offline"
            ? "bg-red-500/5 border-red-500/20 text-red-500"
            : "bg-white/5 border-white/10 text-neutral-500"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            stats.status === "online" ? "bg-cyber-green animate-pulse" : "bg-current"
          )} />
          {instance.suspended ? "Suspended" : stats.status}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="block text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Docker ID</span>
          <span className="block text-[11px] font-mono text-neutral-400 truncate">
            {instance.ContainerId?.substring(0, 12) || "N/A"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="block text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Volume</span>
          <span className="block text-[11px] font-mono text-neutral-400 truncate">
            {instance.VolumeId?.substring(0, 8) || "N/A"}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-4">
        <StatBar
          label="Processor"
          value={`${stats.cpu.toFixed(1)}%`}
          percentage={stats.cpu}
          icon={<Cpu className="w-full h-full" />}
          color="blue"
        />
        <StatBar
          label="Memory"
          value={`${stats.ram.toFixed(1)}%`}
          percentage={stats.ram}
          icon={<Activity className="w-full h-full" />}
          color="purple"
        />
        <StatBar
          label="Storage"
          value={`${stats.disk.toFixed(1)}%`}
          percentage={stats.disk}
          icon={<HardDrive className="w-full h-full" />}
          color="pink"
        />
      </div>

      {/* Hover Effects */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-24 h-24 bg-cyber-blue/10 blur-3xl rounded-full -mr-12 -mt-12" />
      </div>
    </div>
  );
}
