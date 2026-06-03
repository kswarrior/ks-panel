'use client';

import React from 'react';
import { Bell, Shield, Info, AlertCircle, CheckCircle, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function NotificationsPage() {
  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <PageHeader title="Notifications" translationKey="notifications" />

          <button className="mb-4 text-xs font-black text-neutral-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            <Trash2 size={14} /> Clear Archive
          </button>
        </div>

        <div className="space-y-4">
           {[
              { title: 'Security Protocol Updated', desc: 'Enhanced handshake encryption has been deployed across all nodes.', type: 'security', time: '5m ago' },
              { title: 'Node Phoenix-01 Offline', desc: 'Communication lost with primary computational endpoint.', type: 'critical', time: '12m ago' },
              { title: 'Backup Successful', desc: 'System-wide state backup completed and encrypted.', type: 'success', time: '1h ago' },
           ].map((note, i) => (
              <div key={i} className="glass p-6 rounded-[1.5rem] border border-white/10 flex items-start justify-between gap-6 group hover:border-white/20 transition-all">
                 <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                       note.type === 'security' ? 'bg-blue-500/10 text-blue-400' :
                       note.type === 'critical' ? 'bg-red-500/10 text-red-400' :
                       'bg-emerald-500/10 text-emerald-400'
                    }`}>
                       {note.type === 'security' && <Shield size={20} />}
                       {note.type === 'critical' && <AlertCircle size={20} />}
                       {note.type === 'success' && <CheckCircle size={20} />}
                    </div>
                    <div>
                       <h3 className="font-bold text-white tracking-tight">{note.title}</h3>
                       <p className="text-sm text-neutral-400 mt-1">{note.desc}</p>
                       <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-3">{note.time}</p>
                    </div>
                 </div>
                 <button className="p-2 rounded-lg text-neutral-600 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100">
                    <X size={16} />
                 </button>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
