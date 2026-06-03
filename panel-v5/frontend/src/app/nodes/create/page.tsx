'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Server, Globe, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function CreateNode() {
  const [formData, setBaseData] = useState({
    name: '',
    address: '',
    port: '8080',
    location: '',
    category: 'General',
    maxInstances: '50'
  });

  return (
    <div className="p-4 lg:p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/nodes" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-4">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Nodes
        </Link>

        <PageHeader title="Deploy New Node" translationKey="deployNewNode" />

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-blue-400">
              <Server size={24} />
              <h2 className="text-xl font-bold tracking-tight">Core Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Node Name</label>
                <input
                  type="text"
                  placeholder="Phoenix-Primary-01"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">IP Address / Domain</label>
                <input
                  type="text"
                  placeholder="127.0.0.1"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Daemon Port</label>
                <input
                  type="number"
                  defaultValue="8080"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Geographic Location</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                  <option value="">Select Location</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95">
              <Save size={20} />
              PROVISION NODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
