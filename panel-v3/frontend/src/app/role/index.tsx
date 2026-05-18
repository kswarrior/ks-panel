import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, MoreVertical, Edit2,
  Trash2, Lock, Users, Fingerprint
} from 'lucide-react';

export default function RoleIndex() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/roles/')
      .then(res => res.json())
      .then(data => {
        setRoles(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Deleting a role might affect user access. Proceed?')) {
      const res = await fetch(`/api/roles/?id=${id}`, { method: 'DELETE' });
      if (res.ok) setRoles(roles.filter((r: any) => r.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Roles</h1>
        </div>
        <button
          onClick={() => navigate('/role/create')}
          className="neon-button px-8 py-3.5 font-bold flex items-center gap-3 self-start"
        >
          <Plus className="w-5 h-5" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role: any) => (
          <div key={role.id} className="glass-dark p-6 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all">
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 pointer-events-none"
              style={{ color: role.color }}
            >
               <Fingerprint className="w-full h-full" />
            </div>

            <div className="flex items-start justify-between mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all"
                style={{ backgroundColor: `${role.color}10`, borderColor: `${role.color}30`, color: role.color }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => navigate(`/role/edit/${role.id}`)}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-neon-blue"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1 uppercase tracking-tight">{role.name}</h3>
            <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest mb-6">
               <Lock className="w-3 h-3" />
               {role.permissions === '*' ? 'System Administrator' : `${role.permissions.split(',').length} Active Permissions`}
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between text-xs">
                  <span className="text-white/30">Assigned Staff</span>
                  <div className="flex items-center gap-1.5 font-bold">
                     <Users className="w-3 h-3 text-neon-blue" />
                     <span>--</span>
                  </div>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue/40 w-1/3" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
