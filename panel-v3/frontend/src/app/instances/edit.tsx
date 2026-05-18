import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, ArrowLeft, Save, ShieldCheck } from 'lucide-react';

export default function InstancesEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    memory: '',
    cpu: '',
    disk: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/instances')
      .then(res => res.json())
      .then(data => {
        const instance = data.find((i: any) => i.id === parseInt(id!));
        if (instance) {
          setFormData({
            name: instance.name,
            memory: instance.memory?.toString() || '1024',
            cpu: instance.cpu?.toString() || '100',
            disk: instance.disk?.toString() || '5120'
          });
        }
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/instances?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/instances');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/instances')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Instances
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <Settings className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configure Instance</h1>
            <p className="text-white/40 text-sm">Fine-tune hardware limits and identification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Instance Name</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">RAM (MB)</label>
              <input
                type="number"
                className="w-full neon-input py-3 px-4"
                value={formData.memory}
                onChange={e => setFormData({...formData, memory: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">CPU (%)</label>
              <input
                type="number"
                className="w-full neon-input py-3 px-4"
                value={formData.cpu}
                onChange={e => setFormData({...formData, cpu: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Disk (MB)</label>
              <input
                type="number"
                className="w-full neon-input py-3 px-4"
                value={formData.disk}
                onChange={e => setFormData({...formData, disk: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
