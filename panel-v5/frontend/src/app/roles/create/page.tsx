'use client';

import React from 'react';
import { ArrowLeft, Save, Shield, Lock, Search } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function CreateRole() {
  return (
    <div className="p-4 lg:p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/roles" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-4">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </Link>

        <PageHeader title="Create Role" translationKey="createRole" />

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <Shield size={24} />
              <h2 className="text-xl font-bold tracking-tight">Policy Identity</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Role Name</label>
                <input type="text" placeholder="Systems Auditor" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={3} placeholder="Describe the purpose of this role..." className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"></textarea>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Capabilities</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['manage_nodes', 'manage_users', 'manage_instances', 'view_audit_logs', 'manage_templates', 'manage_settings'].map(perm => (
                    <label key={perm} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all">
                       <input type="checkbox" className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/50" />
                       <span className="text-xs font-bold uppercase tracking-tighter">{perm.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
               </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
              <Save size={20} />
              ENACT POLICY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
