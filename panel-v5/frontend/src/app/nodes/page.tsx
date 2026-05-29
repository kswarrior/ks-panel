'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Activity, Server, Database, Globe, MoreVertical, Settings, Edit, Trash2, Copy, Radar, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NodesPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/v1/nodes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNodes(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch nodes:', err);
        setLoading(false);
      });
  }, []);

  const filteredNodes = nodes.filter(n =>
    n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.address?.toLowerCase().includes(search.toLowerCase()) ||
    n.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              NODES
            </h1>
            <p className="text-neutral-400 font-medium">Infrastructure management and cluster oversight.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => { setShowSearch(!showSearch); setShowFilters(false); }}
                className={`p-2 rounded-xl transition-all ${showSearch ? 'text-blue-400 bg-blue-400/10' : 'text-neutral-400 hover:bg-white/5'}`}
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => { setShowFilters(!showFilters); setShowSearch(false); }}
                className={`p-2 rounded-xl transition-all ${showFilters ? 'text-emerald-400 bg-emerald-400/10' : 'text-neutral-400 hover:bg-white/5'}`}
              >
                <Filter size={20} />
              </button>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-800 border border-white/10 text-neutral-300 text-sm font-bold transition-all active:scale-95">
              <Radar size={18} />
              RADAR
            </button>

            <Link href="/nodes/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <Plus size={18} />
              CREATE
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative group animate-in slide-in-from-top-4 duration-300">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by node name, IP address, or ID..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 group hover:border-emerald-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" />
                  Total Nodes
                </p>
                <p className="text-5xl font-black text-white">{nodes.length}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Globe size={28} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 group hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <Server size={14} className="text-blue-500" />
                  Active Nodes
                </p>
                <p className="text-5xl font-black text-white">{nodes.filter(n => n.status === 'Online').length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Database size={28} className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Nodes Grid */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Cluster...</p>
           </div>
        ) : filteredNodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredNodes.map((node) => (
              <div key={node.id} className="glass group rounded-3xl border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-300 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                    <Globe size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-2 w-2 rounded-full ${node.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${node.status === 'Online' ? 'text-emerald-500' : 'text-red-500'}`}>{node.status}</span>
                  </div>
                </div>

                <div>
                   <h3 className="font-bold text-lg leading-none">{node.name}</h3>
                   <p className="text-xs text-neutral-500 mt-2 font-mono">{node.address}:{node.port}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">RAM</p>
                      <p className="text-sm font-bold text-neutral-300">{node.ram} GB</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Disk</p>
                      <p className="text-sm font-bold text-neutral-300">{node.disk} GB</p>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <Link href={`/nodes/${node.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
                      <Settings size={14} /> CONFIGURE
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl col-span-full">
            <p className="text-neutral-500 font-medium">No nodes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
