'use client';

import React from 'react';
import { Shield, Lock, ArrowRight, Fingerprint } from 'lucide-react';

export default function TwoFactorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Shield size={32} className="text-blue-400" />
              <div className="absolute inset-0 rounded-full border border-blue-500/50 animate-ping opacity-20" />
           </div>
           <h1 className="text-3xl font-black tracking-tighter uppercase">Security <span className="text-blue-500 text-glow">Verification</span></h1>
           <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.4em]">Multi-Factor Protocol Active</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl">
           <p className="text-center text-sm text-neutral-400">Enter the 6-digit verification code from your security device to proceed.</p>

           <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                 <input key={i} type="text" maxLength={1} className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-black text-blue-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
              ))}
           </div>

           <button className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] uppercase tracking-tighter">
              Authorize Session
              <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
