import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Clock, Tag, User, ChevronRight } from 'lucide-react';

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
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="h-48 glass-dark rounded-3xl border border-white/5 animate-pulse" />
           ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-dark p-20 text-center rounded-[2.5rem] border border-white/5">
           <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-10 text-neon-blue" />
           <h3 className="text-xl font-bold mb-2">All systems clear</h3>
           <p className="text-white/40 mb-8 max-w-md mx-auto italic">No active support sessions found. If you're experiencing issues, our fleet is ready to assist.</p>
           <button onClick={() => navigate('/ticket/create')} className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border border-white/5">Initialize Support</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket: any) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/ticket/chat/${ticket.id}`)}
              className="glass-dark p-8 rounded-[2.5rem] border border-white/5 hover:border-neon-blue/30 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                 <ChevronRight className="w-6 h-6 text-neon-blue" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                 <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'text-emerald-400' : 'text-white/20'}`}>
                    {ticket.status}
                 </span>
              </div>

              <h3 className="text-lg font-bold mb-4 line-clamp-2 leading-snug group-hover:text-neon-blue transition-colors">{ticket.subject}</h3>

              <div className="flex flex-wrap gap-2 mb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/40 uppercase">
                    <Tag className="w-3 h-3" />
                    {ticket.category || 'General'}
                 </div>
                 <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg text-[10px] font-bold uppercase ${
                    ticket.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white/40'
                 }`}>
                    {ticket.priority}
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                       <User className="w-3 h-3 text-white/40" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-white/30">{ticket.user}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 uppercase">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
