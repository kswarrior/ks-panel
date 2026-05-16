"use client";

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Shield, Mail, X, Check, Lock, User } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface KSUser {
  id: number;
  display_name: string;
  username: string;
  email: string;
  role_id: number;
  status: string;
}

interface Role {
  id: number;
  name: string;
  color: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<KSUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles')
      ]);
      const [uData, rData] = await Promise.all([uRes.json(), rRes.json()]);
      setUsers(uData || []);
      setRoles(rData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/50">Control user access and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-blue transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-neon-blue/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/60 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : (
                users.map((user) => {
                  const role = roles.find(r => r.id === user.role_id);
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 font-bold text-sm uppercase">
                            {user.display_name?.substring(0, 2) || user.username.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{user.display_name || user.username}</p>
                            <p className="text-xs text-white/40 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role?.color || '#ffffff' }} />
                          <span className="text-sm font-medium">{role?.name || 'User'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="glass-dark w-full max-w-lg rounded-2xl p-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Add New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Display Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full neon-input"
                    value={formData.displayName}
                    onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Username</label>
                  <input
                    type="text"
                    placeholder="jdoe"
                    className="w-full neon-input"
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full neon-input"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full neon-input"
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Confirm</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full neon-input"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Role</label>
                <select
                  className="w-full neon-input bg-black/40"
                  value={formData.roleId}
                  onChange={e => setFormData(p => ({ ...p, roleId: e.target.value }))}
                >
                  <option value="">Select a role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6">
                <button className="w-full neon-button py-3 font-bold text-lg">
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
