'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, Shield, Lock, ArrowRight, Terminal } from 'lucide-react';

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
          setError(data.message || 'ACCESS DENIED: INVALID SIGNATURE');
        }
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'SYSTEM ERROR: CONNECTION REFUSED');
      }
    } catch (err) {
      setError('CRITICAL: SECURITY HANDSHAKE FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale opacity-20"
        style={{ backgroundImage: 'url("/background.jpg")' }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-[#0a0a0c]/80 to-[#0a0a0c]" />

      {/* Scanner Effect */}
      <div className="scanner-line z-2" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        <div className="text-center space-y-4">
           <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="w-full h-full glass chamfered flex items-center justify-center border-cyan-500/50 border relative z-10">
                <Fingerprint size={40} className="text-[#00f2ff] text-glow-cyan" />
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                <span className="text-white">NEXUS</span>
                <span className="text-[#00f2ff] text-glow-cyan ml-2">ACCESS</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Terminal size={12} className="text-cyan-500" />
                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.4em]">Initialize Security Protocol v5.0</p>
              </div>
           </div>
        </div>

        <div className="relative group">
          {/* Decorative Corner Accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500 z-20" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500 z-20" />

          <form onSubmit={handleSubmit} className="glass chamfered p-10 border border-white/5 space-y-6 shadow-2xl relative overflow-hidden bg-black/40 backdrop-blur-3xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-3">
                <Shield size={16} />
                {error}
              </div>
            )}

            <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={10} />
                      Identity Identifier
                    </label>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USER_NAME_ALPHA"
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all placeholder:text-neutral-700 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Lock size={10} />
                      Security Signature
                    </label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all placeholder:text-neutral-700 font-mono text-sm"
                  />
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full chamfered flex items-center justify-center gap-3 py-5 font-black transition-all active:scale-[0.98] uppercase tracking-tighter relative group/btn overflow-hidden ${
                loading
                ? 'bg-cyan-900/50 cursor-wait text-cyan-500/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
              }`}
            >
              {/* Button Glitch Effect on Hover */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-12" />

              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  <span className="font-mono">AUTHENTICATING...</span>
                </div>
              ) : (
                <>
                  <span className="text-lg italic">ESTABLISH UPLINK</span>
                  <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between px-2 pt-2">
                <button type="button" className="text-[10px] font-black text-neutral-600 hover:text-white transition-colors uppercase tracking-widest underline decoration-cyan-500/20 underline-offset-4">Reset Node</button>
                <button type="button" className="text-[10px] font-black text-[#00f2ff] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 group/reg">
                  Generate Identity
                  <ArrowRight size={10} className="group-hover/reg:translate-x-0.5 transition-transform" />
                </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4">
           <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
           <p className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em]">
              System Protected by <span className="text-white">KS-SHIELD</span> Neural Encryption
           </p>
        </div>
      </div>

      {/* Decorative side elements */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-20">
         {[1, 2, 3].map(i => <div key={i} className="w-1 h-12 bg-cyan-500" />)}
      </div>
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-20">
         {[1, 2, 3].map(i => <div key={i} className="w-1 h-12 bg-cyan-500" />)}
      </div>
    </div>
  );
}
