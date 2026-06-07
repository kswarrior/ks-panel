'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Activity, Server, Cpu, HardDrive, LayoutGrid, List, MoreVertical, Play, Square, RotateCcw, ExternalLink, Terminal, Shield } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import PageHeader from '@/components/PageHeader';

interface Instance {
  id: string;
  name: string;
  address: string;
  status: string;
  cpu: string;
  memory: string;
  net: string;
}

export default function InstancesPage() {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/v1/instances', {
          headers: {
            'x-api-key': 'placeholder'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch instances');
        const data = await response.json();

        const mappedInstances = data.map((inst: any) => ({
          id: inst.Id,
          name: inst.Name,
          address: inst.Node ? `${inst.Node.address}:${inst.Node.port}` : 'UNKNOWN',
          status: inst.InternalState || 'UNKNOWN',
          cpu: inst.Cpu ? `${inst.Cpu}%` : '0%',
          memory: inst.Memory ? `${inst.Memory}MB` : '0MB',
          net: '0MB/S'
        }));

        setInstances(mappedInstances);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch instances:', error);
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  const filteredInstances = instances.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full pt-2 px-4 lg:px-6 animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <PageHeader title="Instances" translationKey="instances" />

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
            {/* View Toggle */}
            <div className="hidden sm:flex chamfered bg-white/5 border border-white/5 p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-all chamfered ${view === 'grid' ? 'text-black bg-[#00f2ff]' : 'text-neutral-500 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-all chamfered ${view === 'list' ? 'text-black bg-[#00f2ff]' : 'text-neutral-500 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Search Module */}
            <div className="relative group flex-1 min-w-[200px] md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#00f2ff] transition-colors" size={16} />
              <input
                type="text"
                placeholder="FILTER_BY_IDENTIFIER..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[#00f2ff]/30 transition-all placeholder:text-neutral-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Create Button */}
            <button
              className="chamfered flex items-center gap-3 px-5 md:px-8 py-3.5 bg-[#00f2ff] hover:bg-[#00d8e4] text-black font-black text-xs shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all active:scale-95 uppercase tracking-widest group"
            >
              <Plus size={18} />
              <span className="hidden xs:inline">{t('createNewInstance')}</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass chamfered border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden relative animate-pulse">
                <div className="h-1 w-full bg-white/5" />
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 chamfered bg-white/5 border border-white/5" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-white/5 rounded" />
                      <div className="h-2 w-32 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/5">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="space-y-2">
                        <div className="h-2 w-12 bg-white/5 rounded" />
                        <div className="h-3 w-16 bg-white/5 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 chamfered bg-white/5" />
                      <div className="w-10 h-10 chamfered bg-white/5" />
                    </div>
                    <div className="w-24 h-10 chamfered bg-white/5" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredInstances.length > 0 ? (
            filteredInstances.map((instance) => (
              <div key={instance.id} className="group relative">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none chamfered" />
                <div className="glass chamfered border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden relative">
                    <div className="h-1 w-full bg-cyan-500/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500 w-1/3 shadow-[0_0_10px_#00f2ff]" />
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 chamfered bg-cyan-500/5 flex items-center justify-center border border-cyan-500/20 text-[#00f2ff] group-hover:bg-cyan-500/10 transition-colors">
                            <Server size={28} className="text-glow-cyan" />
                          </div>
                          <div>
                            <h3 className="font-black text-xl tracking-tighter uppercase italic leading-none group-hover:text-[#00f2ff] transition-colors">{instance.name}</h3>
                            <p className="text-[9px] font-black text-neutral-500 mt-2 font-mono tracking-widest">ADDR: {instance.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-1 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse" />
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none pt-0.5">{instance.status}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/5">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">CPU_LOAD</p>
                          <p className="text-sm font-black italic">{instance.cpu}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">MEM_UTIL</p>
                          <p className="text-sm font-black italic">{instance.memory}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">NET_IO</p>
                          <p className="text-sm font-black italic">{instance.net}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 chamfered bg-white/5 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-[#00f2ff] hover:bg-cyan-500/10 transition-all">
                              <Play size={16} fill="currentColor" />
                            </button>
                            <button className="w-10 h-10 chamfered bg-white/5 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                              <RotateCcw size={16} />
                            </button>
                            <button className="w-10 h-10 chamfered bg-white/5 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-[#ff003c] hover:bg-[#ff003c]/10 transition-all">
                              <Square size={16} fill="currentColor" />
                            </button>
                        </div>
                        <button className="group/btn flex items-center gap-3 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all relative overflow-hidden chamfered">
                            <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{t('terminal')}</span>
                            <Terminal size={14} className="text-cyan-500 relative z-10" />
                            <div className="absolute inset-0 bg-cyan-500/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform" />
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl col-span-full">
              <p className="text-neutral-500 font-medium">No instances found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
