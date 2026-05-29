'use client';

import React from 'react';
import { ArrowLeft, Save, User, Shield, Mail, Key } from 'lucide-react';
import Link from 'next/link';

export default function CreateUser() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/users" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Users
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Create <span className="text-blue-500">Identity</span>
          </h1>
          <p className="text-neutral-400 font-medium">Provision a new user account with specific access privileges.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-blue-400">
              <User size={24} />
              <h2 className="text-xl font-bold tracking-tight">Profile Credentials</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Username</label>
                <input type="text" placeholder="neo_matrix" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" placeholder="neo@nexus.io" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Assigned Role</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95">
              <Save size={20} />
              PROVISION ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
