'use client';

import React from 'react';
import { History, Search, Filter, User, Globe, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function AuditLogsPage() {
  return (
    <div className="p-4 lg:p-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <PageHeader title="Audit Logs" translationKey="auditLogs" />

          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
             <button className="p-2 rounded-xl text-neutral-400 hover:bg-white/5 transition-all"><Search size={20} /></button>
             <button className="p-2 rounded-xl text-neutral-400 hover:bg-white/5 transition-all"><Filter size={20} /></button>
          </div>
        </div>

        <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                       <th className="px-8 py-5">Event Protocol</th>
                       <th className="px-8 py-5">Initiator</th>
                       <th className="px-8 py-5">Terminal/IP</th>
                       <th className="px-8 py-5 text-right">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[1, 2, 3, 4, 5].map(i => (
                       <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                <span className="font-bold text-sm tracking-tight text-white/90">instance:power:start</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <User size={14} className="text-neutral-500" />
                                <span className="text-xs font-bold">jules_engineer</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <Globe size={14} className="text-neutral-500" />
                                <span className="text-xs font-mono text-neutral-400">192.168.1.44</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-[10px] text-neutral-500">
                             2023-10-24 14:22:01.442
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
