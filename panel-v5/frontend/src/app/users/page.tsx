'use client';

import React from 'react';
import { User, Shield, Key, Search, Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import PageHeader from '@/components/PageHeader';

export default function UsersPage() {
  const { t } = useTranslation();

  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <PageHeader title="Users" translationKey="users" />

          <div className="flex flex-wrap items-center gap-3 mb-4">
             <div className="relative group flex-1 min-w-[200px] md:min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            <button className="chamfered flex items-center gap-2 px-6 py-2.5 bg-[#00f2ff] hover:bg-[#00d8e4] text-black font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all active:scale-95">
              <Plus size={18} />
              {t('createUserButton')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {/* User Card */}
           <div className="glass group rounded-3xl border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                       JD
                    </div>
                    <div>
                       <h3 className="font-bold text-lg leading-none">John Doe</h3>
                       <p className="text-xs text-neutral-500 mt-1">john@example.com</p>
                    </div>
                 </div>
                 <button className="p-2 text-neutral-600 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                 </button>
              </div>

              <div className="flex flex-wrap gap-2">
                 <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                    Owner
                 </span>
                 <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={10} /> {t('verifiedStatus')}
                 </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{t('instances')}</p>
                    <p className="text-xl font-black">12</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Tickets</p>
                    <p className="text-xl font-black">2</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                 <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
                    <Edit size={14} /> {t('edit')}
                 </button>
                 <button className="w-12 flex items-center justify-center py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
