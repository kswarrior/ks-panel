'use client';

import React from 'react';
import { Fingerprint, Shield, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mx-auto mb-6">
              <UserPlus size={32} className="text-white" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter uppercase">Initialize <span className="text-emerald-500 text-glow">Identity</span></h1>
           <p className="text-neutral-500 font-bold text-xs uppercase tracking-[0.3em]">Create your Nexus access profile</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Username</label>
                 <input type="text" placeholder="Identity Code" className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-700" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Email Address</label>
                 <input type="email" placeholder="Communication Node" className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-700" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Security Key</label>
                 <input type="password" placeholder="••••••••••••" className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-700" />
              </div>
           </div>

           <button className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] uppercase tracking-tighter">
              Create Account
              <ArrowRight size={20} />
           </button>

           <div className="text-center pt-2">
              <button className="text-[10px] font-black text-neutral-500 hover:text-white transition-colors uppercase tracking-widest">Already have an identity? Sign In</button>
           </div>
        </div>
      </div>
    </div>
  );
}
