import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Zap, Database, Globe, Cpu } from 'lucide-react';

export default function InstancesCreate() {
  const [formData, setFormData] = useState({
    name: '',
    nodeId: '',
    templateId: '',
    memory: '1024',
    cpu: '100',
    disk: '5120'
  });
  const [nodes, setNodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/nodes').then(res => res.json()).then(setNodes);
    fetch('/api/templates').then(res => res.json()).then(setTemplates);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/instances');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/instances')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Fleet
      </button>

      <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <Zap className="w-7 h-7 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Deploy New Instance</h1>
            <p className="text-white/40 text-sm">Initialize a fresh environment on your infrastructure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Instance Identification</label>
              <input
                type="text"
                required
                className="w-full neon-input py-4 px-6 text-lg font-bold"
                placeholder="PROD-WEB-SRV-01"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Target Node</label>
                <select
                  required
                  className="w-full neon-input py-4 px-6 appearance-none font-bold"
                  value={formData.nodeId}
                  onChange={e => setFormData({...formData, nodeId: e.target.value})}
                >
                  <option value="">Select Target Node</option>
                  {nodes.map((n: any) => (
                    <option key={n.id} value={n.id}>{n.name} ({n.ip})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Software Template</label>
                <select
                  required
                  className="w-full neon-input py-4 px-6 appearance-none font-bold"
                  value={formData.templateId}
                  onChange={e => setFormData({...formData, templateId: e.target.value})}
                >
                  <option value="">Choose OS/App</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
             <h3 className="text-xs font-black uppercase tracking-widest text-neon-blue flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Resource Allocation
             </h3>

             <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/30">RAM (MB)</label>
                   <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-blue/50 transition-all outline-none"
                      value={formData.memory}
                      onChange={e => setFormData({...formData, memory: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/30">CPU (%)</label>
                   <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-blue/50 transition-all outline-none"
                      value={formData.cpu}
                      onChange={e => setFormData({...formData, cpu: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/30">DISK (MB)</label>
                   <input
                      type="number"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-blue/50 transition-all outline-none"
                      value={formData.disk}
                      onChange={e => setFormData({...formData, disk: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-5 font-black text-lg flex items-center justify-center gap-3">
              <Server className="w-6 h-6" />
              Begin Deployment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
