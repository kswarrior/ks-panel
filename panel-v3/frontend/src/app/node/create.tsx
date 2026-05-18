import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Save, Globe, Shield } from 'lucide-react';

export default function NodeCreate() {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: '5050',
    status: 'Online'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/node');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/node')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Nodes
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <Server className="w-6 h-6 text-neon-blue" />
          </div>
          <h1 className="text-2xl font-bold">Register Edge Node</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Node Name</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              placeholder="Helsinki-01"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">IP Address</label>
              <div className="relative">
                 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                 <input
                    type="text"
                    required
                    className="w-full neon-input py-3 pl-11 pr-4 font-mono text-sm"
                    placeholder="1.2.3.4"
                    value={formData.ip}
                    onChange={e => setFormData({...formData, ip: e.target.value})}
                 />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Control Port</label>
              <input
                type="text"
                required
                className="w-full neon-input py-3 px-4 font-mono text-sm"
                value={formData.port}
                onChange={e => setFormData({...formData, port: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Connect Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
