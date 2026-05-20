'use client';

import React from 'react';
import { ArrowLeft, Save, Server, Globe, Shield, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditNode() {
  const params = useParams();
  const id = params.id;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/nodes" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Nodes
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Edit Node <span className="text-emerald-500">#{id?.slice(0, 8)}</span>
          </h1>
          <p className="text-neutral-400 font-medium">Modify configuration for this infrastructure endpoint.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <Settings size={24} />
              <h2 className="text-xl font-bold tracking-tight">Node Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Similar fields as Create */}
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              REVERT
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
              <Save size={20} />
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
