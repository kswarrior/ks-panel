import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Edit2, Trash2,
  Shield, Mail, CheckCircle2, AlertCircle,
  Fingerprint
} from 'lucide-react';

export default function UserIndex() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState<Record<number, any>>({});
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

        const roleMap: Record<number, any> = {};
        rData.forEach((r: any) => roleMap[r.id] = r);
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
          <h1 className="text-4xl font-black tracking-tighter mb-2">Users</h1>
        </div>
        <button
          onClick={() => navigate('/user/create')}
          className="neon-button px-8 py-3.5 font-bold flex items-center gap-3 self-start"
        >
          <UserPlus className="w-5 h-5" />
          Create New User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user: any) => {
          const role = roles[user.role_id] || { name: 'Loading...', color: '#ffffff' };
          return (
            <div key={user.id} className="glass-dark p-6 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all overflow-hidden">
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] -mr-6 -mt-6 pointer-events-none"
              >
                 <Fingerprint className="w-full h-full" />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-sm border border-white/10 uppercase group-hover:border-neon-blue/30 transition-all">
                  {user.username.substring(0,2)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => navigate(`/user/edit/${user.id}`)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-neon-blue"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1 truncate">{user.display_name || user.username}</h3>
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest truncate">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${role.color}10`,
                      borderColor: `${role.color}30`,
                      color: role.color
                    }}
                  >
                    <Shield className="w-3 h-3" />
                    {role.name}
                  </div>

                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                    user.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                    {user.status}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && !loading && (
        <div className="p-20 text-center glass-dark rounded-3xl border border-white/5">
           <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-10 text-white" />
           <p className="font-medium text-white/20">No users found in database</p>
        </div>
      )}
    </div>
  );
}
