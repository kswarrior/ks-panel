"use client";

import React from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
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

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="email"
                placeholder="admin@kspanel.com"
                className="w-full neon-input pl-11"
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
                placeholder="••••••••"
                className="w-full neon-input pl-11"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5 text-neon-blue focus:ring-neon-blue" />
            <label htmlFor="remember" className="text-sm text-white/50">Remember for 30 days</label>
          </div>

          <Link
            href="/"
            className="w-full neon-button flex items-center justify-center gap-2 font-bold py-3 text-lg"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </Link>
        </form>

        <p className="text-center text-sm text-white/40">
          Secure access via end-to-end encrypted connection
        </p>
      </div>
    </div>
  );
}
