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
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'medium' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket);
    }
  }, [selectedTicket]);

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply })
      });
      if (res.ok) {
        setReply('');
        fetchMessages(selectedTicket);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const res = await fetch('/api/tickets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
        fetchTickets();
        setSelectedTicket(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100dvh-10rem)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="p-2 bg-neon-blue/10 text-neon-blue rounded-lg border border-neon-blue/20 hover:bg-neon-blue hover:text-white transition-all"
          >
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
                  <h2 className="font-bold">{tickets.find(t => t.id === selectedTicket)?.subject}</h2>
                  <p className="text-xs text-white/40">Ticket #T-100{selectedTicket}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await fetch(`/api/tickets/${selectedTicket}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'closed' })
                    });
                    fetchTickets();
                  }}
                  className="px-4 py-2 glass hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Close Ticket
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map(m => {
                const isMe = m.role_id === 1 || m.role_id === 2; // Simple check for admin/owner
                return (
                  <div key={m.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-neon-blue/20 border border-neon-blue/30 shadow-neon' : 'bg-white/5 border border-white/10'}`}>
                      {isMe ? <span className="text-[10px] font-bold text-neon-blue">AD</span> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-sm ${isMe ? 'text-neon-blue' : ''}`}>{isMe ? 'Support' : m.display_name || m.username}</span>
                        <span className="text-[10px] text-white/30 font-bold">{m.created_at}</span>
                      </div>
                      <div className={`p-4 rounded-2xl ${isMe ? 'rounded-tr-none bg-neon-blue/10 border border-neon-blue/20 text-white/90 shadow-neon' : 'rounded-tl-none bg-white/5 border border-white/5 text-white/80'}`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5">
              <form className="relative group" onSubmit={(e) => { e.preventDefault(); handleSendReply(); }}>
                <textarea
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-32 outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all resize-none h-24 text-sm"
                />
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button type="button" className="p-2 hover:bg-white/10 text-white/40 rounded-xl transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="submit" className="bg-neon-blue text-black p-3 rounded-xl shadow-neon hover:scale-105 transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
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

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="glass-dark w-full max-w-lg rounded-2xl p-8 relative z-10">
            <h2 className="text-2xl font-bold mb-6">Open New Ticket</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Subject</label>
                <input
                  type="text"
                  className="w-full neon-input"
                  placeholder="Describe your issue"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Priority</label>
                <select
                  className="w-full neon-input bg-black/40"
                  value={newTicket.priority}
                  onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all">Cancel</button>
                <button onClick={handleCreateTicket} className="flex-1 neon-button font-bold py-3">Open Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
