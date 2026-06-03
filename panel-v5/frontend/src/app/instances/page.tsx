'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Activity, Server, Cpu, HardDrive, LayoutGrid, List, MoreVertical, Play, Square, RotateCcw, ExternalLink, Terminal, Shield } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import PageHeader from '@/components/PageHeader';

export default function InstancesPage() {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  return (
    <div className="min-h-full p-4 lg:p-6 animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <PageHeader title="Instances" translationKey="instances" />

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
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

          {/* Instance Card Template */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group relative">
               {/* Decorative border glow */}
               <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none chamfered" />

               <div className="glass chamfered border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-1 w-full bg-cyan-500/10 relative overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-500 w-1/3 shadow-[0_0_10px_#00f2ff]" />
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 chamfered bg-cyan-500/5 flex items-center justify-center border border-cyan-500/20 text-[#00f2ff] group-hover:bg-cyan-500/10 transition-colors">
                          <Server size={28} className="text-glow-cyan" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl tracking-tighter uppercase italic leading-none group-hover:text-[#00f2ff] transition-colors">NODE_{i.toString().padStart(2, '0')}</h3>
                          <p className="text-[9px] font-black text-neutral-500 mt-2 font-mono tracking-widest">ADDR: 192.168.1.{i}:8080</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-1 border border-emerald-500/20">
                         <div className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse" />
                         <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none pt-0.5">{t('active') || 'ACTIVE'}</span>
                      </div>
                    </div>

                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">CPU_LOAD</p>
                        <p className="text-sm font-black italic">14.2%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">MEM_UTIL</p>
                        <p className="text-sm font-black italic">4.2G</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">NET_IO</p>
                        <p className="text-sm font-black italic">12MB/S</p>
                      </div>
                    </div>

                    {/* Action Controls */}
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
                          <span className="text-[10px] font-black uppercase tracking-widest relative z-10">TERMINAL</span>
                          <Terminal size={14} className="text-cyan-500 relative z-10" />
                          <div className="absolute inset-0 bg-cyan-500/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform" />
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
