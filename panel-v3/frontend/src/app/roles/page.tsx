"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, X, Check, Search, Palette } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface Role {
  id: number;
  name: string;
  color: string;
  permissions: string;
}

const permissionsList = [
  { id: 'instances', name: 'Access Instances', description: 'Allows viewing and managing instances.' },
  { id: 'templates', name: 'Access Templates', description: 'Allows viewing and deploying templates.' },
  { id: 'users', name: 'Manage Users', description: 'Allows adding, editing, and deleting users.' },
  { id: 'roles', name: 'Manage Roles', description: 'Allows creating and modifying roles.' },
  { id: 'settings', name: 'Manage Settings', description: 'Allows changing panel settings.' },
  { id: 'nodes', name: 'Manage Nodes', description: 'Allows adding and configuring edge nodes.' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', color: '#0ea5e9', permissions: [] as string[] });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePermission = (id: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleForm({ name: '', color: '#0ea5e9', permissions: [] });
    setShowModal(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      color: role.color,
      permissions: role.permissions === '*' ? permissionsList.map(p => p.id) : role.permissions.split(',').filter(p => p !== '')
    });
    setShowModal(true);
  };

  const handleSaveRole = async () => {
    const method = editingRole ? 'PUT' : 'POST';
    const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
    const payload = {
      ...roleForm,
      permissions: roleForm.permissions.length === permissionsList.length ? '*' : roleForm.permissions.join(',')
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-white/50">Manage permissions and groups</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-lg"
                  style={{ backgroundColor: `${role.color}10`, borderColor: `${role.color}40`, boxShadow: `0 0 15px ${role.color}20` }}
                >
                  <Shield className="w-6 h-6" style={{ color: role.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: role.color }}>{role.name}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Permissions: {role.permissions.split(',').length}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {role.permissions.split(',').slice(0, 3).map(p => (
                  <span key={p} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/50 border border-white/10 uppercase font-bold">
                    {p}
                  </span>
                ))}
                {role.permissions.split(',').length > 3 && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/30 font-bold">
                    +{role.permissions.split(',').length - 3}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(role)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-dark w-full max-w-2xl rounded-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 uppercase ml-1">Role Name</label>
                  <input
                    type="text"
                    placeholder="Moderator"
                    className="w-full neon-input"
                    value={roleForm.name}
                    onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 uppercase ml-1">Role Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-12 h-10 bg-transparent border-none cursor-pointer"
                      value={roleForm.color}
                      onChange={e => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="flex-1 neon-input font-mono"
                      value={roleForm.color}
                      onChange={e => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-white/70 uppercase ml-1 block">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissionsList.map(perm => {
                    const active = roleForm.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          active ? 'bg-neon-blue/10 border-neon-blue/40 shadow-neon' : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm">{perm.name}</h4>
                          {active && <Check className="w-4 h-4 text-neon-blue" />}
                        </div>
                        <p className="text-xs text-white/40">{perm.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={handleSaveRole}
                  className="w-full neon-button py-3 font-bold text-lg"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
