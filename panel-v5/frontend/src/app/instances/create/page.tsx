'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Box, Globe, Shield, Cpu, HardDrive, Activity, Terminal } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function CreateInstance() {
  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/instances" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-4">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Instances
        </Link>

        <PageHeader title="Create Instance" translationKey="createInstance" />

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <Box size={24} />
              <h2 className="text-xl font-bold tracking-tight">Resource Allocation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Instance Name</label>
                <input
                  type="text"
                  placeholder="My-Production-App"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Node</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none">
                  <option value="">Select Target Node</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex justify-between">
                   <span>Memory (MB)</span>
                   <span className="text-purple-400">4096 MB</span>
                </label>
                <input type="range" min="512" max="16384" step="512" className="w-full accent-purple-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex justify-between">
                   <span>CPU (Cores)</span>
                   <span className="text-purple-400">2 Cores</span>
                </label>
                <input type="range" min="1" max="16" step="1" className="w-full accent-purple-500" />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xl shadow-purple-600/20 transition-all active:scale-95">
              <Save size={20} />
              INITIALIZE ENVIRONMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
