'use client';

import React from 'react';
import { Layout, Box, Search, Plus, Filter, Cpu, Database, Settings, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import PageHeader from '@/components/PageHeader';

export default function TemplatesPage() {
  const { t } = useTranslation();

  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <PageHeader title="Templates" translationKey="templates" />

          <div className="flex flex-wrap items-center gap-3 mb-4">
             <div className="relative group flex-1 min-w-[200px] md:min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search blueprints..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>

            <button className="chamfered flex items-center gap-2 px-6 py-2.5 bg-[#00f2ff] hover:bg-[#00d8e4] text-black font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all active:scale-95">
              <Plus size={18} />
              {t('create')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
           {/* Template Card */}
           <div className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                 <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                       <Box size={32} />
                    </div>
                    <div className="text-right">
                       <span className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Type</span>
                       <span className="block text-xs font-bold text-white mt-1">Docker Container</span>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-2xl font-black tracking-tight leading-none pt-2">Minecraft Java</h3>
                    <p className="text-xs text-orange-400 font-black tracking-widest mt-2 uppercase">Official Blueprint</p>
                    <p className="text-sm text-neutral-500 mt-4 line-clamp-2">High-performance gaming environment pre-configured with optimizations for Paper/Spigot.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                       <Cpu size={14} className="text-neutral-500" />
                       <span className="text-[10px] font-bold text-neutral-400 uppercase">Scalable</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                       <Database size={14} className="text-neutral-500" />
                       <span className="text-[10px] font-bold text-neutral-400 uppercase">Vol. Support</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white/5 p-4 flex items-center gap-2 border-t border-white/5">
                 <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-black hover:bg-orange-500 hover:text-white transition-all uppercase tracking-tighter">
                    Customize
                 </button>
                 <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 hover:text-white transition-all">
                    <Download size={16} />
                 </button>
                 <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 hover:text-white transition-all">
                    <Settings size={16} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
