'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Search, Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase">
              USER ACCESS
            </h1>
            <p className="text-neutral-400 font-medium">Manage identities and system-wide permissions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link href="/users/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <Plus size={18} />
              ADD USER
            </Link>
          </div>
        </header>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-xs">Authenticating Registry...</p>
           </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.userId} className="glass group rounded-3xl border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-300 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                         {user.username?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="font-bold text-lg leading-none">{user.username}</h3>
                         <p className="text-xs text-neutral-500 mt-1">{user.email}</p>
                      </div>
                   </div>
                   <button className="p-2 text-neutral-600 hover:text-white transition-colors">
                      <MoreVertical size={20} />
                   </button>
                </div>

                <div className="flex flex-wrap gap-2">
                   {user.admin && (
                     <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                        Admin
                     </span>
                   )}
                   {user.verified ? (
                     <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle size={10} /> Verified
                     </span>
                   ) : (
                     <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <XCircle size={10} /> Unverified
                     </span>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Instances</p>
                      <p className="text-xl font-black">{user.accessTo?.length || 0}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Identity</p>
                      <p className="text-xs font-black truncate">{user.userId.split('-')[0]}</p>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <Link href={`/users/edit/${user.userId}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
                      <Edit size={14} /> EDIT
                   </Link>
                   <button className="w-12 flex items-center justify-center py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <User size={48} className="mx-auto text-neutral-800 mb-4" />
            <h3 className="text-xl font-bold text-neutral-400">No Users Found</h3>
            <p className="text-neutral-600 mt-2 max-w-sm mx-auto font-medium">Add your team members or customers to the panel by clicking the Add User button above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
