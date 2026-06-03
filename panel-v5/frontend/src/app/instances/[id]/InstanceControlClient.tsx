'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, FileCode, Database, Settings, Shield, Clock, Power, Play, Square, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/components/TranslationProvider';

export default function InstanceControlClient() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState('console');
  const { t } = useTranslation();

  const tabs = [
    { id: 'console', name: 'Console', icon: Terminal },
    { id: 'files', name: 'Files', icon: FileCode },
    { id: 'databases', name: 'Databases', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full bg-[#0a0a0c] text-white flex flex-col">
      {/* Top Header */}
      <div className="border-b border-white/5 bg-[#0d0d0f]/50 backdrop-blur-md px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/instances" className="p-2 rounded-xl hover:bg-white/5 text-neutral-500 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-black tracking-tight text-lg leading-none uppercase italic italic">
              {t?.('instanceControl') || 'CONTROL'} / <span className="text-cyan-400">Production-API-01</span>
            </h1>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
               Node: phx-01 <span className="text-white/20">|</span> ID: {id?.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
             <Play size={14} /> START
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-black border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all">
             <RotateCcw size={14} /> RESTART
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
             <Square size={14} /> STOP
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#0d0d0f] p-4 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-neutral-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-[#0a0a0c]">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {activeTab === 'console' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="aspect-video bg-black rounded-3xl border border-white/10 p-6 font-mono text-sm overflow-hidden flex flex-col shadow-2xl">
                    <div className="flex-1 text-neutral-400 space-y-1 overflow-auto">
                       <p><span className="text-emerald-500 font-bold">[SYS]</span> Initializing system components...</p>
                       <p><span className="text-emerald-500 font-bold">[SYS]</span> Docker container spawned successfully.</p>
                       <p><span className="text-purple-400 font-bold">[APP]</span> Server listening on port 25565</p>
                       <p className="animate-pulse">_</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                       <span className="text-purple-500 font-black tracking-widest">{'>'}</span>
                       <input type="text" placeholder="Type a command..." className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-neutral-700" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
                       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                         <Power size={10} /> Uptime
                       </p>
                       <p className="text-2xl font-black">24d 12h 45m</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
                       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                         <Shield size={10} /> Security
                       </p>
                       <p className="text-2xl font-black text-emerald-400 text-glow">Protected</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
                       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                         <Clock size={10} /> Latency
                       </p>
                       <p className="text-2xl font-black">14ms</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
