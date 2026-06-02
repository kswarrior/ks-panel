'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, Shield, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.twoFA) {
            router.push('/2fa');
          } else {
            router.push('/instances');
          }
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Invalid credentials or server error');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="glass p-10 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
           {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-shake">
               {error}
             </div>
           )}
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Protocol Identifier</label>
                 <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username or Email"
                      required
                      className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-2">Security Key</label>
                 <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700"
                    />
                 </div>
              </div>
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] uppercase tracking-tighter"
           >
              {loading ? 'Verifying...' : 'Verify Credentials'}
              <ArrowRight size={20} />
           </button>

           <div className="flex items-center justify-between px-2 pt-2">
              <button className="text-[10px] font-black text-neutral-500 hover:text-white transition-colors uppercase tracking-widest">Forgot Access?</button>
              <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Create Identity</button>
           </div>
        </form>

        <p className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
           Protected by KS Shield Encrypted Handshake
        </p>
      </div>
    </div>
  );
}
