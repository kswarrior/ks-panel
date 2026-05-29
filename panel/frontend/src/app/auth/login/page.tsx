'use client';

import React from 'react';
import { Fingerprint, Shield, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] mx-auto mb-6">
              <Fingerprint size={32} className="text-white" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter uppercase">Nexus <span className="text-blue-500 text-glow">Access</span></h1>
           <p className="text-neutral-500 font-bold text-xs uppercase tracking-[0.3em]">Initialize Identity Protocol</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Protocol Identifier</label>
                 <div className="relative group">
                    <input type="text" placeholder="Username or Email" className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Security Key</label>
                 <div className="relative group">
                    <input type="password" placeholder="••••••••••••" className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700" />
                 </div>
              </div>
           </div>

           <button className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] uppercase tracking-tighter">
              Verify Credentials
              <ArrowRight size={20} />
           </button>

           <div className="flex items-center justify-between px-2 pt-2">
              <button className="text-[10px] font-black text-neutral-500 hover:text-white transition-colors uppercase tracking-widest">Forgot Access?</button>
              <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Create Identity</button>
           </div>
        </div>

        <p className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
           Protected by KS Shield Encrypted Handshake
        </p>
      </div>
    </div>
  );
}
