'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Server, Globe, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CreateNode() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    port: '8080',
    tags: 'General',
    ram: '16',
    disk: '500',
    processor: 'AMD EPYC'
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.port) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/v1/nodes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'placeholder'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        window.location.href = '/nodes';
      } else {
        const error = await response.json();
        alert(`Failed to create node: ${error.error}`);
      }
    } catch (err) {
      console.error('Error creating node:', err);
      alert('An error occurred while creating the node');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/nodes" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Nodes
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            DEPLOY NEW <span className="text-blue-500">NODE</span>
          </h1>
          <p className="text-neutral-400 font-medium">Expand your cluster by adding a new computational endpoint.</p>
        </header>

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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">IP Address / Domain</label>
                <input
                  type="text"
                  placeholder="127.0.0.1"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Daemon Port</label>
                <input
                  type="number"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Resource Tags</label>
                <input
                  type="text"
                  placeholder="General, High-Performance"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <Link href="/nodes" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </Link>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              <Save size={20} />
              PROVISION NODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
