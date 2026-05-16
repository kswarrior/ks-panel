"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, User, Clock, CheckCircle, XCircle, Send, Paperclip } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface Ticket {
  id: number;
  subject: string;
  user: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  useEffect(() => {
    // Real API call here
    setTickets([
      { id: 1, subject: 'Unable to connect to Node 01', user: 'kshosting', status: 'open', priority: 'high', created_at: '2h ago' },
      { id: 2, subject: 'Payment confirmation', user: 'alex_dev', status: 'closed', priority: 'low', created_at: '1d ago' },
      { id: 3, subject: 'Feature request: API Keys', user: 'sky_panel', status: 'pending', priority: 'medium', created_at: '5h ago' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="h-[calc(100dvh-10rem)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <button className="p-2 bg-neon-blue/10 text-neon-blue rounded-lg border border-neon-blue/20 hover:bg-neon-blue hover:text-white transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search tickets..." className="w-full neon-input pl-10 py-2 text-sm" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)
          ) : (
            tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTicket === t.id ? 'bg-neon-blue/10 border-neon-blue/40 shadow-neon' : 'glass-dark border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                    t.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/40'
                  }`}>{t.priority}</span>
                  <span className="text-[10px] text-white/30 font-bold">{t.created_at}</span>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{t.subject}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 flex items-center gap-1"><User className="w-3 h-3" /> {t.user}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    t.status === 'open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                    t.status === 'pending' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-white/20'
                  }`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="hidden lg:flex flex-1 glass-dark rounded-2xl border border-white/5 flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                  <MessageSquare className="w-5 h-5 text-neon-blue" />
                </div>
                <div>
                  <h2 className="font-bold">Unable to connect to Node 01</h2>
                  <p className="text-xs text-white/40">Opened by kshosting • #T-1004</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 glass hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Close Ticket
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">kshosting</span>
                    <span className="text-[10px] text-white/30 font-bold">2h ago</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm text-white/80 leading-relaxed">
                    Hello, I'm trying to connect to my edge node 01 but getting a timeout error. I've checked the firewall and port 5050 is open. Any help?
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center shrink-0 shadow-neon">
                  <span className="text-[10px] font-bold text-neon-blue">AD</span>
                </div>
                <div className="max-w-[80%] flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-white/30 font-bold">1h ago</span>
                    <span className="font-bold text-sm text-neon-blue">Admin Support</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tr-none bg-neon-blue/10 border border-neon-blue/20 text-sm text-white/90 leading-relaxed shadow-neon">
                    Hi kshosting, thanks for reaching out. Please try running <code className="bg-black/40 px-1 rounded text-neon-blue">./ksedge --status</code> on the server and send us the output.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5">
              <div className="relative group">
                <textarea
                  placeholder="Type your reply..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-32 outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all resize-none h-24 text-sm"
                />
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button className="p-2 hover:bg-white/10 text-white/40 rounded-xl transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="bg-neon-blue text-black p-3 rounded-xl shadow-neon hover:scale-105 transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
              <MessageSquare className="w-10 h-10 text-white/20" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Select a ticket</h2>
              <p className="text-sm text-white/40 max-w-xs mx-auto">Choose a ticket from the sidebar to view the conversation history and reply.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
