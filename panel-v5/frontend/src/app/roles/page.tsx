'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Search, Plus, ChevronRight, Settings, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/roles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoles(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch roles:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent uppercase">
              POLICIES & ROLES
            </h1>
            <p className="text-neutral-400 font-medium">Define access control and granular permission sets.</p>
          </div>

          <Link href="/roles/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
            <Plus size={18} />
            NEW ROLE
          </Link>
        </header>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-emerald-500 animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-xs">Decrypting Protocols...</p>
           </div>
        ) : roles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                <div className="p-8 space-y-6">
                   <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <Shield size={28} />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                         {role.virtual ? 'System' : 'Custom'}
                      </span>
                   </div>

                   <div>
                      <h3 className="text-2xl font-black tracking-tight">{role.name}</h3>
                      <p className="text-sm text-neutral-500 mt-2">Granting specific access permissions to users.</p>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Capabilities</p>
                      <div className="flex flex-wrap gap-2">
                         {Object.keys(role.permissions || {}).length > 0 ? (
                           Object.keys(role.permissions).slice(0, 4).map(perm => (
                              <span key={perm} className="px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400/70 font-medium">
                                 {perm}
                              </span>
                           ))
                         ) : (
                           <span className="text-[10px] text-neutral-600">No specific permissions</span>
                         )}
                         {Object.keys(role.permissions || {}).length > 4 && (
                           <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-neutral-500 font-medium">+{Object.keys(role.permissions).length - 4} more</span>
                         )}
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/5">
                   <div className="flex items-center gap-2 text-neutral-500">
                      <Users size={16} />
                      <span className="text-xs font-bold">Manage Members</span>
                   </div>
                   <Link href={`/roles/edit/${role.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-black hover:bg-emerald-500 hover:text-white transition-all">
                      MANAGE PERMISSIONS
                      <ChevronRight size={14} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Shield size={48} className="mx-auto text-neutral-800 mb-4" />
            <h3 className="text-xl font-bold text-neutral-400">No Roles Configured</h3>
            <p className="text-neutral-600 mt-2 max-w-sm mx-auto font-medium">Establish access hierarchies by creating your first custom permission set.</p>
          </div>
        )}
      </div>
    </div>
  );
}
