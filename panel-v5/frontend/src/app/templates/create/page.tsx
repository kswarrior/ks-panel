'use client';

import React from 'react';
import { ArrowLeft, Save, Box, Cpu, Database, Layout, Code } from 'lucide-react';
import Link from 'next/link';

export default function CreateTemplate() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Blueprints
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Architect <span className="text-orange-500">Blueprint</span>
          </h1>
          <p className="text-neutral-400 font-medium">Design a new application template for rapid deployment.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-orange-400">
              <Box size={24} />
              <h2 className="text-xl font-bold tracking-tight">Core Metadata</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Template Name</label>
                <input type="text" placeholder="Python 3.11 Workspace" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Docker Image</label>
                <input type="text" placeholder="python:3.11-slim" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50 transition-all" />
              </div>
            </div>
          </section>

          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-orange-400">
              <Code size={24} />
              <h2 className="text-xl font-bold tracking-tight">Startup Script</h2>
            </div>
            <textarea rows={5} placeholder="bash /entrypoint.sh" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-orange-500/50 transition-all resize-none"></textarea>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-xl shadow-orange-600/20 transition-all active:scale-95">
              <Save size={20} />
              COMMIT ARCHITECTURE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
