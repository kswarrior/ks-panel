import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Shield, Globe, Terminal, Link2 } from 'lucide-react';

export default function NodeCreate() {
  const [formData, setFormData] = useState({
    name: '',
    connection_type: 'IP Address',
    host: '',
    port: '5050'
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
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Node Name</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              placeholder="Helsinki-01"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Connection Type</label>
            <div className="grid grid-cols-3 gap-3">
               {[
                 { id: 'Localhost', icon: Terminal },
                 { id: 'IP Address', icon: Globe },
                 { id: 'Tunnel', icon: Link2 }
               ].map(type => (
                 <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({...formData, connection_type: type.id})}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-xs font-bold ${
                      formData.connection_type === type.id
                      ? 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                 >
                    <type.icon className="w-4 h-4" />
                    {type.id}
                 </button>
               ))}
            </div>
          </div>

          {formData.connection_type !== 'Localhost' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                  {formData.connection_type === 'Tunnel' ? 'Tunnel Address' : 'IP Address'}
                </label>
                <div className="relative">
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input
                      type="text"
                      required
                      className="w-full neon-input py-3 pl-11 pr-4 font-mono text-sm"
                      placeholder={formData.connection_type === 'Tunnel' ? 'node.kspanel.io' : '1.2.3.4'}
                      value={formData.host}
                      onChange={e => setFormData({...formData, host: e.target.value})}
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Control Port</label>
                <input
                  type="text"
                  required
                  className="w-full neon-input py-3 px-4 font-mono text-sm"
                  value={formData.port}
                  onChange={e => setFormData({...formData, port: e.target.value})}
                />
              </div>
            </div>
          )}

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
