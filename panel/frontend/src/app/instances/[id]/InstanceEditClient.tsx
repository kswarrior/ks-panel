'use client';

import React from 'react';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InstanceEditClient() {
  const { id } = useParams() as { id: string };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href={`/instances/${id}`} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Instance
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Edit <span className="text-purple-500">Instance</span>
          </h1>
          <p className="text-neutral-400 font-medium">Reconfigure resources for this application environment.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-purple-400">
              <Settings size={24} />
              <h2 className="text-xl font-bold tracking-tight">Resource Re-allocation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Instance Name</label>
                <input
                  type="text"
                  placeholder="My-Production-App"
                  defaultValue="Production-API-01"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex justify-between">
                   <span>Memory (MB)</span>
                   <span className="text-purple-400">4096 MB</span>
                </label>
                <input type="range" min="512" max="16384" step="512" defaultValue="4096" className="w-full accent-purple-500" />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              DISCARD
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xl shadow-purple-600/20 transition-all active:scale-95">
              <Save size={20} />
              UPDATE INSTANCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
