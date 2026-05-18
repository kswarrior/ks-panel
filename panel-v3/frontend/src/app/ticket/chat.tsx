import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, User, Bot, ShieldCheck, Clock } from 'lucide-react';

export default function TicketChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchMessages = () => {
    fetch(`/api/tickets/${id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data || []);
      });
  };

  useEffect(() => {
    fetch('/api/tickets/')
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.id === parseInt(id!));
        setTicket(found);
      });

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        setMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!ticket) return null;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button
          onClick={() => navigate('/ticket')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Support Fleet
        </button>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Ticket #{ticket.id}</span>
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              ticket.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
           }`}>
              {ticket.status}
           </div>
        </div>
      </div>

      <div className="glass-dark flex-1 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Sidebar Info - Desktop Only */}
        <div className="hidden md:flex w-72 border-r border-white/5 flex-col bg-white/[0.01]">
           <div className="p-8 border-b border-white/5">
              <h2 className="text-xl font-black tracking-tight mb-2 leading-tight">{ticket.subject}</h2>
              <div className="flex flex-col gap-3 mt-6">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Category</p>
                    <p className="text-xs font-bold text-white/60">{ticket.category || 'General'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Priority</p>
                    <p className={`text-xs font-bold ${ticket.priority === 'High' ? 'text-red-400' : 'text-white/60'}`}>{ticket.priority}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Opened On</p>
                    <p className="text-xs font-bold text-white/60">{new Date(ticket.created_at).toLocaleDateString()}</p>
                 </div>
              </div>
           </div>
           <div className="p-8 flex-1">
              <div className="p-4 rounded-2xl bg-neon-blue/5 border border-neon-blue/10">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] font-black uppercase text-neon-blue">Secure Session</span>
                 </div>
                 <p className="text-[10px] leading-relaxed text-white/40 italic">This communication channel is end-to-end encrypted and monitored for quality assurance.</p>
              </div>
           </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
           <div className="md:hidden p-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-bold truncate">{ticket.subject}</h2>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-20">
                   <MessageSquare className="w-16 h-16 mb-4" />
                   <p className="font-bold italic">Initializing encrypted session...</p>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isMe = msg.username === ticket.user;
                return (
                  <div key={msg.id} className={`flex gap-4 max-w-[90%] md:max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? '' : 'ml-auto flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                       isMe ? 'bg-white/5 border-white/10' : 'bg-neon-blue/10 border-neon-blue/20'
                    }`}>
                       {isMe ? <User className="w-5 h-5 text-white/40" /> : <Bot className="w-5 h-5 text-neon-blue" />}
                    </div>
                    <div className={`space-y-2 ${isMe ? '' : 'text-right'}`}>
                       <div className={`p-4 md:p-5 rounded-[1.5rem] text-sm leading-relaxed ${
                          isMe ? 'glass-dark rounded-tl-none border border-white/5' : 'bg-neon-blue/5 rounded-tr-none border border-neon-blue/10 text-white/80'
                       }`}>
                          {msg.message}
                       </div>
                       <div className="flex items-center gap-2 px-1 justify-end flex-row-reverse">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-white/20' : 'text-neon-blue/40'}`}>
                             {isMe ? 'CLIENT' : 'OPERATOR'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 shrink-0">
              <form onSubmit={handleSend} className="relative group">
                 <input
                    type="text"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 md:py-5 pl-6 pr-20 focus:outline-none focus:border-neon-blue/40 focus:bg-white/[0.08] transition-all text-sm"
                    placeholder="Compose message to fleet command..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={sending}
                 />
                 <button
                    disabled={sending || !message.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-neon-blue rounded-2xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-neon disabled:opacity-20 disabled:scale-100 disabled:shadow-none"
                 >
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                 </button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-4 opacity-10">
                 <div className="h-px flex-1 bg-white" />
                 <ShieldCheck className="w-3 h-3" />
                 <div className="h-px flex-1 bg-white" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
