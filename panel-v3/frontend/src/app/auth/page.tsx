"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (res.ok) {
        router.push('/instances');
      } else {
        setError('Invalid username/email or password');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  useEffect(() => {
    // Clear any existing cookie on auth page mount to allow fresh login
    document.cookie = "ks_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  return (
    <div className="w-full max-w-md">
      <div className="glass p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-neon-blue rounded-2xl shadow-neon flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-3xl">K</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-white/50">Login to your KS PANEL account</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Username or Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or admin@kspanel.com"
                className="w-full neon-input pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-white/70">Password</label>
              <a href="#" className="text-xs text-neon-blue hover:underline">Forgot password?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full neon-input pl-11"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5 text-neon-blue focus:ring-neon-blue" />
            <label htmlFor="remember" className="text-sm text-white/50">Remember for 30 days</label>
          </div>

          <button
            type="submit"
            className="w-full neon-button flex items-center justify-center gap-2 font-bold py-3 text-lg"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Secure access via end-to-end encrypted connection
        </p>
      </div>
    </div>
  );
}
