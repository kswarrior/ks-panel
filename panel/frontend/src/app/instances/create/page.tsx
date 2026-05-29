'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Box, Globe, Shield, Cpu, HardDrive, Activity, Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateInstance() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    nodeId: '',
    memory: 4096,
    cpu: 2
  });

  useEffect(() => {
    fetch('/api/v1/nodes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNodes(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch nodes:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.nodeId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/v1/instances/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'placeholder'
        },
        body: JSON.stringify({
          name: formData.name,
          nodeId: formData.nodeId,
          memory: formData.memory,
          cpu: formData.cpu,
          image: 'ghcr.io/parkervcp/yolks:debian', // Default image
          imagename: 'Debian',
          ports: '8080:8080',
          user: 'placeholder-user',
          primary: true
        })
      });

      if (response.ok) {
        window.location.href = '/instances';
      } else {
        const error = await response.json();
        alert(`Failed to create instance: ${error.error}`);
      }
    } catch (err) {
      console.error('Error deploying instance:', err);
      alert('An error occurred while deploying the instance');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/instances" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Instances
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Create <span className="text-purple-500">Instance</span>
          </h1>
          <p className="text-neutral-400 font-medium">Provision a new application environment on your cluster.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Node</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                  value={formData.nodeId}
                  onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                >
                  <option value="">Select Target Node</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.name} ({node.address})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex justify-between">
                   <span>Memory (MB)</span>
                   <span className="text-purple-400">{formData.memory} MB</span>
                </label>
                <input
                  type="range"
                  min="512"
                  max="16384"
                  step="512"
                  className="w-full accent-purple-500"
                  value={formData.memory}
                  onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex justify-between">
                   <span>CPU (Cores)</span>
                   <span className="text-purple-400">{formData.cpu} Cores</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  className="w-full accent-purple-500"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <Link href="/instances" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </Link>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xl shadow-purple-600/20 transition-all active:scale-95"
            >
              <Save size={20} />
              INITIALIZE ENVIRONMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
