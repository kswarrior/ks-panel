'use client';

import React from 'react';
import { User, Mail, Shield, Key, ArrowLeft, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            MY <span className="text-blue-500">PROFILE</span>
          </h1>
          <p className="text-neutral-400 font-medium">Manage your identity and account security protocols.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-1 space-y-6">
              <div className="glass p-8 rounded-3xl border border-white/10 text-center space-y-4">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 mx-auto">
                    <div className="w-full h-full rounded-full bg-[#0d0d0f] flex items-center justify-center text-3xl font-black">JE</div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">jules_engineer</h3>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Administrator</p>
                 </div>
                 <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all uppercase">
                    Sign Out
                 </button>
              </div>
           </div>

           <div className="md:col-span-2 space-y-8">
              <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                 <div className="flex items-center gap-3 text-blue-400">
                    <User size={20} />
                    <h2 className="font-bold uppercase tracking-tight">Identity Details</h2>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Username</label>
                       <input type="text" defaultValue="jules_engineer" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
                       <input type="email" defaultValue="jules@example.com" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                 </div>
                 <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all">
                    <Save size={14} /> UPDATE IDENTITY
                 </button>
              </section>

              <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                 <div className="flex items-center gap-3 text-emerald-400">
                    <Shield size={20} />
                    <h2 className="font-bold uppercase tracking-tight">Security & 2FA</h2>
                 </div>
                 <p className="text-sm text-neutral-400">Enhance your account security by enabling Two-Factor Authentication.</p>
                 <button className="px-8 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">
                    CONFIGURE 2FA
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}
