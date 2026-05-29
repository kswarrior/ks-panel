'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Box, Search, Plus, Filter, Cpu, Database, Settings, Download, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch templates:', err);
        setLoading(false);
      });
  }, []);

  const filteredTemplates = templates.filter(t =>
    t.Name?.toLowerCase().includes(search.toLowerCase()) ||
    t.Description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent uppercase">
              POWER TEMPLATES
            </h1>
            <p className="text-neutral-400 font-medium">Infrastructure blueprints for rapid application deployment.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search blueprints..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link href="/templates/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all active:scale-95">
              <Plus size={18} />
              NEW TEMPLATE
            </Link>
          </div>
        </header>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-orange-500 animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-xs">Loading Blueprints...</p>
           </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.Name} className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col">
                <div className="p-6 space-y-6 flex-1">
                   <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                         <Box size={32} />
                      </div>
                      <div className="text-right">
                         <span className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Type</span>
                         <span className="block text-xs font-bold text-white mt-1">Docker</span>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-2xl font-black tracking-tight leading-none pt-2">{template.Name}</h3>
                      <p className="text-xs text-orange-400 font-black tracking-widest mt-2 uppercase">Official Blueprint</p>
                      <p className="text-sm text-neutral-500 mt-4 line-clamp-2">{template.Description || 'No description available for this blueprint.'}</p>
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
                   <Link href={`/templates/edit/${template.Name}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-black hover:bg-orange-500 hover:text-white transition-all uppercase tracking-tighter">
                      Customize
                   </Link>
                   <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 hover:text-white transition-all">
                      <Download size={16} />
                   </button>
                   <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-500 hover:text-white transition-all">
                      <Settings size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Box size={48} className="mx-auto text-neutral-800 mb-4" />
            <h3 className="text-xl font-bold text-neutral-400">No Templates Available</h3>
            <p className="text-neutral-600 mt-2 max-w-sm mx-auto font-medium">Create your first infrastructure blueprint to streamline your deployment process.</p>
          </div>
        )}
      </div>
    </div>
  );
}
