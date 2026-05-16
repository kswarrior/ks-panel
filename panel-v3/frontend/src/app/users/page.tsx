"use client";

import React from 'react';
import { Search, UserPlus, MoreVertical, Shield, Mail } from 'lucide-react';

const users = [
  { id: 1, username: 'admin', email: 'admin@kspanel.com', role: 'Administrator', status: 'Active' },
  { id: 2, username: 'jdoe', email: 'john.doe@example.com', role: 'Moderator', status: 'Active' },
  { id: 3, username: 'mksmith', email: 'm.smith@web.io', role: 'User', status: 'Suspended' },
  { id: 4, username: 'alex_dev', email: 'alex@startup.co', role: 'User', status: 'Active' },
  { id: 5, username: 'sarah_q', email: 'sarah.q@tech.net', role: 'User', status: 'Inactive' },
];

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/50">Control user access and permissions</p>
        </div>
        <button className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto">
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
              placeholder="Search users by name or email..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase font-bold tracking-widest">Filter:</span>
            <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-neon-blue/50">
              <option>All Roles</option>
              <option>Administrator</option>
              <option>Moderator</option>
              <option>User</option>
            </select>
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                        <span className="text-neon-blue font-bold text-sm uppercase">{user.username.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.username}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-neon-blue" />
                      <span className="text-sm font-medium">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      user.status === 'Suspended' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-white/10 text-white/40 border border-white/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 text-center">
          <button className="text-sm text-neon-blue hover:underline font-medium">Load more users</button>
        </div>
      </div>
    </div>
  );
}
