import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Save, Shield } from 'lucide-react';

export default function UserEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    roleId: 0,
    status: ''
  });
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    fetch('/api/users')
      .then(res => res.json())
      .then(users => {
        const user = users.find((u: any) => u.id === parseInt(id!));
        if (user) {
          setFormData({
            displayName: user.display_name,
            username: user.username,
            password: '',
            roleId: user.role_id,
            status: user.status
          });
        }
      });

    // Fetch roles
    fetch('/api/roles/')
      .then(res => res.json())
      .then(setRoles);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/users?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/user');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/user')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Users
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <UserIcon className="w-32 h-32 text-neon-blue" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <UserIcon className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit User Profile</h1>
            <p className="text-white/40 text-sm">Modify account details and permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Display Name</label>
              <input
                type="text"
                required
                className="w-full neon-input py-3 px-4"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Username</label>
              <input
                type="text"
                required
                className="w-full neon-input py-3 px-4"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Assigned Role</label>
                <select
                  required
                  className="w-full neon-input py-3 px-4 appearance-none"
                  value={formData.roleId}
                  onChange={e => setFormData({...formData, roleId: parseInt(e.target.value)})}
                >
                  {roles.map((role: any) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Account Status</label>
                <select
                  required
                  className="w-full neon-input py-3 px-4 appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              className="w-full neon-input py-3 px-4"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
