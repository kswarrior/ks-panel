import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, MoreVertical, Edit2, Trash2,
  Shield, Mail, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function UserIndex() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/roles/')
        ]);
        const uData = await uRes.json();
        const rData = await rRes.json();

        setUsers(uData);

        const roleMap: Record<number, string> = {};
        rData.forEach((r: any) => roleMap[r.id] = r.name);
        setRoles(roleMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) setUsers(users.filter((u: any) => u.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">User Management</h1>
          <p className="text-white/40 max-w-lg">Control access levels and manage staff accounts across the panel</p>
        </div>
        <button
          onClick={() => navigate('/user/create')}
          className="neon-button px-8 py-3.5 font-bold flex items-center gap-3 self-start"
        >
          <UserPlus className="w-5 h-5" />
          Create New User
        </button>
      </div>

      <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">User Identity</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-white/[0.01] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs border border-white/10 uppercase group-hover:border-neon-blue/30 transition-all">
                      {user.username.substring(0,2)}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-none mb-1.5">{user.display_name || user.username}</p>
                      <div className="flex items-center gap-2 text-white/30 text-xs">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon-blue/50" />
                    <span className="text-sm font-medium">{roles[user.role_id] || 'Loading...'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {user.status}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/user/edit/${user.id}`)}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-neon-blue transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="p-20 text-center text-white/20">
             <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-10" />
             <p className="font-medium">No users found in database</p>
          </div>
        )}
      </div>
    </div>
  );
}
