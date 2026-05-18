import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Save, Lock } from 'lucide-react';

export default function RoleCreate() {
  const [formData, setFormData] = useState({
    name: '',
    color: '#0ea5e9',
    permissions: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/roles/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/role');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/role')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Roles
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <ShieldAlert className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Define New Role</h1>
            <p className="text-white/40 text-sm">Configure permissions and role aesthetics</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Role Name</label>
              <input
                type="text"
                required
                className="w-full neon-input py-3 px-4"
                placeholder="Moderator"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Accent Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 neon-input py-3 px-4"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Permissions (Comma separated or * for all)</label>
            <textarea
              className="w-full neon-input py-3 px-4 min-h-[120px] font-mono text-sm"
              placeholder="view_instances, manage_nodes, *"
              value={formData.permissions}
              onChange={e => setFormData({...formData, permissions: e.target.value})}
            />
            <div className="flex flex-wrap gap-2 mt-2">
               {['view_instances', 'manage_instances', 'view_users', 'manage_users', 'manage_settings', 'view_nodes', 'manage_nodes'].map(p => (
                 <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const current = formData.permissions.split(',').map(x => x.trim()).filter(Boolean);
                    if (!current.includes(p)) {
                      setFormData({...formData, permissions: [...current, p].join(', ')})
                    }
                  }}
                  className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/40 hover:text-white transition-all"
                 >
                   + {p}
                 </button>
               ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Initialize Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
