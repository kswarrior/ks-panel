'use client';

import React, { useState } from 'react';
import { MessageSquare, Search, Filter, Plus, Clock, User, Tag, ChevronRight, Send, Paperclip } from 'lucide-react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent uppercase">
              SUPPORT TICKETS
            </h1>
            <p className="text-neutral-400 font-medium">Manage support requests and communications.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition-all active:scale-95">
              <Plus size={18} />
              OPEN TICKET
            </button>
          </div>
        </header>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {/* Example Ticket Card */}
          <div className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                      Billing
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">#TK-8821</span>
                  </div>
                  <h3 className="font-bold text-xl leading-tight pt-1">Inquiry regarding latest invoice charges</h3>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest">
                  Active
                </span>
              </div>

              <p className="text-neutral-400 text-sm line-clamp-2">
                I noticed a discrepancy in my last billing cycle regarding the resource overage charges. Could someone please review...
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                    <User size={14} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Creator</p>
                    <p className="text-xs font-bold mt-1">jules_engineer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-500" />
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Updated</p>
                    <p className="text-xs font-bold mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-white/5 p-4 flex items-center justify-center gap-2 text-sm font-bold hover:bg-amber-500 hover:text-white transition-all group-hover:bg-amber-600/20 group-hover:text-amber-400">
              VIEW DISCUSSION
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
