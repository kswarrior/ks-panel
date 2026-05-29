'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Plus, Clock, User, Tag, ChevronRight, Send, Paperclip, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTickets(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tickets:', err);
        setLoading(false);
      });
  }, []);

  const filteredTickets = tickets.filter(t =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

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

            <Link href="/tickets/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition-all active:scale-95">
              <Plus size={18} />
              OPEN TICKET
            </Link>
          </div>
        </header>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-amber-500 animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-xs">Querying Support Channels...</p>
           </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="glass group rounded-3xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col">
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                          {ticket.category || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">#{ticket.id?.substring(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-xl leading-tight pt-1">{ticket.subject}</h3>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest">
                      {ticket.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-neutral-400 text-sm line-clamp-2">
                    {ticket.last_message || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                        <User size={14} className="text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Creator</p>
                        <p className="text-xs font-bold mt-1">{ticket.user_id || 'System'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-500" />
                      <div>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Updated</p>
                        <p className="text-xs font-bold mt-1">{new Date(ticket.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/tickets/${ticket.id}`} className="w-full bg-white/5 p-4 flex items-center justify-center gap-2 text-sm font-bold hover:bg-amber-500 hover:text-white transition-all group-hover:bg-amber-600/20 group-hover:text-amber-400">
                  VIEW DISCUSSION
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <MessageSquare size={48} className="mx-auto text-neutral-800 mb-4" />
            <h3 className="text-xl font-bold text-neutral-400">No Support Tickets</h3>
            <p className="text-neutral-600 mt-2 max-w-sm mx-auto font-medium">Any issues? Open a support ticket and our team will get back to you shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
