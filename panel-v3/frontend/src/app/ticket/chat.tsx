import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, User, Bot, ShieldCheck } from 'lucide-react';

export default function TicketChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/tickets/')
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.id === parseInt(id!));
        setTicket(found);
      });
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Mock response logic or actual API call
    setMessage('');
  };

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/ticket')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Support Fleet
        </button>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Ticket #{ticket.id}</span>
           <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase">
              {ticket.status}
           </div>
        </div>
      </div>

      <div className="glass-dark flex-1 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
           <h2 className="text-xl font-bold">{ticket.subject}</h2>
           <p className="text-xs text-white/30 uppercase font-black tracking-widest mt-1">{ticket.category} • {ticket.priority} Priority</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           {/* Initial Message */}
           <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                 <User className="w-5 h-5 text-white/40" />
              </div>
              <div className="space-y-2">
                 <div className="glass-dark p-4 rounded-2xl rounded-tl-none border border-white/5 text-sm leading-relaxed">
                    {ticket.message || "Initializing support session..."}
                 </div>
                 <p className="text-[10px] text-white/20 font-bold uppercase ml-1">Client • Just now</p>
              </div>
           </div>

           {/* System Response Mock */}
           <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
              <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20 shrink-0">
                 <Bot className="w-5 h-5 text-neon-blue" />
              </div>
              <div className="space-y-2 text-right">
                 <div className="bg-neon-blue/5 p-4 rounded-2xl rounded-tr-none border border-neon-blue/10 text-sm leading-relaxed text-neon-blue/80">
                    Your request has been routed to our technical department. A technician will be with you shortly.
                 </div>
                 <p className="text-[10px] text-neon-blue/40 font-bold uppercase mr-1">System Intelligence • Automated</p>
              </div>
           </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5">
           <form onSubmit={handleSend} className="relative">
              <input
                 type="text"
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-neon-blue/40 transition-all"
                 placeholder="Compose secure message..."
                 value={message}
                 onChange={e => setMessage(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-neon-blue rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-neon">
                 <Send className="w-5 h-5" />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}
