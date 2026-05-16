"use client";

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-white/90">Access Denied</h2>
        <p className="text-white/40 max-w-md mx-auto">
          You don't have the necessary permissions to view this page.
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
      <Link
        href="/instances"
        className="neon-button flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
