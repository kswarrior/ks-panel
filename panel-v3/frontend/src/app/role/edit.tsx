import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function RoleEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    color: '#0ea5e9',
    permissions: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/roles/')
      .then(res => res.json())
      .then(roles => {
        const role = roles.find((r: any) => r.id === parseInt(id!));
        if (role) {
          setFormData({
            name: role.name,
            color: role.color,
            permissions: role.permissions
          });
        }
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/roles/?id=${id}`, {
      method: 'PUT',
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

      <div className="glass-dark p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Shield className="w-6 h-6" style={{ color: formData.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Role Permissions</h1>
            <p className="text-white/40 text-sm">Managing authorization levels for {formData.name}</p>
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
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Active Permissions</label>
            <textarea
              className="w-full neon-input py-3 px-4 min-h-[120px] font-mono text-sm"
              value={formData.permissions}
              onChange={e => setFormData({...formData, permissions: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Update Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
