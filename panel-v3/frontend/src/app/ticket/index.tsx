import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ExternalLink, Clock, Tag } from 'lucide-react';

export default function TicketIndex() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/tickets/')
      .then(res => res.json())
      .then(data => {
        setTickets(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Support</h1>
        </div>
        <button
          onClick={() => navigate('/ticket/create')}
          className="neon-button flex items-center justify-center gap-2 font-bold px-6 py-2.5"
        >
          <Plus className="w-5 h-5" />
          Create Ticket
        </button>
      </div>

      <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Issue Subject</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Interaction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tickets.map((ticket: any) => (
              <tr key={ticket.id} className="hover:bg-white/[0.01] transition-all group">
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="font-bold text-sm mb-1">{ticket.subject}</span>
                      <span className="text-[10px] text-white/20 font-bold uppercase flex items-center gap-1.5">
                         <Clock className="w-3 h-3" />
                         Opened 2h ago
                      </span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/40 uppercase">
                      <Tag className="w-3 h-3" />
                      {ticket.category}
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">{ticket.status}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <button
                     onClick={() => navigate(`/ticket/chat/${ticket.id}`)}
                     className="px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/20 rounded-xl text-[10px] font-black text-neon-blue uppercase transition-all"
                   >
                      Enter Chat
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && !loading && (
          <div className="p-20 text-center text-white/20">
             <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
             <p className="font-medium italic">No active support sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
