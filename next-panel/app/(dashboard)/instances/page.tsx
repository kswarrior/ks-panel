"use client";

import React, { useState } from "react";
import { InstanceCard } from "@/components/InstanceCard";
import { Plus, Filter, Grid, List as ListIcon, RefreshCw, Layout } from "lucide-react";

// Mock data based on EJS logic
const mockInstances = [
  {
    Id: "d6b2c8a1",
    Name: "Minecraft Survival",
    Node: { name: "Europe-Node-01" },
    ContainerId: "7f8e9a0b1c2d3e4f5g6h7i8j",
    VolumeId: "vol_a1b2c3d4",
    Disk: 10240,
    suspended: false,
  },
  {
    Id: "f9e8d7c6",
    Name: "Rust High Pop",
    Node: { name: "Europe-Node-01" },
    ContainerId: "1a2b3c4d5e6f7g8h9i0j1k2l",
    VolumeId: "vol_e5f6g7h8",
    Disk: 20480,
    suspended: false,
  },
  {
    Id: "a1b2c3d4",
    Name: "Discord Bot (JS)",
    Node: { name: "US-Central-02" },
    ContainerId: "m1n2o3p4q5r6s7t8u9v0w1x2",
    VolumeId: "vol_i9j0k1l2",
    Disk: 2048,
    suspended: true,
  },
];

export default function InstancesPage() {
  const [instances] = useState(mockInstances);
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-cyber-purple rounded-full shadow-[0_0_15px_rgba(157,0,255,0.5)]" />
            Active Instances
          </h2>
          <p className="mt-2 text-neutral-500 font-medium tracking-wide">
            You are currently managing <span className="text-white">{instances.length}</span> virtual environments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex glass p-1 rounded-xl border-white/5">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_30px_rgba(157,0,255,0.5)] active:scale-95">
            <Plus className="w-4 h-4" />
            Deploy New
          </button>
        </div>
      </div>

      {/* Filter / Search Bar Placeholder */}
      <div className="flex items-center justify-between glass px-6 py-4 border-white/5">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-xs font-black text-cyber-blue uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
            <Filter className="w-3 h-3" />
            Filter By Status
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Sort:</span>
            <select className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest focus:outline-none cursor-pointer">
              <option>Alphabetical</option>
              <option>Recent First</option>
              <option>Resource Usage</option>
            </select>
          </div>
        </div>

        <button className="text-neutral-500 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Instances Grid */}
      {instances.length === 0 ? (
        <div className="glass p-20 text-center border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layout className="w-8 h-8 text-neutral-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No instances found</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">
            You haven't deployed any instances yet. Click the button above to get started.
          </p>
        </div>
      ) : (
        <div className={view === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          {instances.map((instance) => (
            <InstanceCard key={instance.Id} instance={instance} />
          ))}
        </div>
      )}
    </div>
  );
}
