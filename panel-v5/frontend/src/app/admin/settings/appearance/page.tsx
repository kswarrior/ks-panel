'use client';

import React from 'react';
import { Palette, Mail, Shield, Save, Globe } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function AppearanceSettings() {
  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-4">
        <PageHeader title="Appearance" translationKey="appearance" />

        <section className="glass p-8 rounded-3xl border border-white/10 space-y-8">
           <div className="flex items-center gap-3 text-blue-400">
              <Palette size={24} />
              <h2 className="text-xl font-bold tracking-tight uppercase">Branding & Logo</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Panel Name</label>
                 <input type="text" defaultValue="KS Panel" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Logo URL</label>
                 <input type="text" placeholder="https://..." className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Primary Color Scheme</label>
              <div className="flex flex-wrap gap-4">
                 {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                    <button key={color} className="w-12 h-12 rounded-full border-2 border-white/10 hover:scale-110 transition-all" style={{ backgroundColor: color }} />
                 ))}
              </div>
           </div>

           <div className="pt-4 border-t border-white/5">
              <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95 uppercase">
                 <Save size={20} /> Commit Interface Changes
              </button>
           </div>
        </section>
      </div>
    </div>
  );
}
