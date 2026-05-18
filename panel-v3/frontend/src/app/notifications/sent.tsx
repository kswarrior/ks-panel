import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send, ArrowLeft, Clock,
  Search, Filter, Plus,
  Trash2, Mail, Users
} from 'lucide-react';

export default function SentNotifications() {
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/sent')
      .then(res => res.json())
      .then(data => {
        setSent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link
            to="/notifications"
            className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 hover:text-neon-blue transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Inbox
          </Link>
          <h1 className="text-4xl font-black tracking-tighter">Sent History</h1>
        </div>

        <button className="neon-button px-8 py-3.5 font-bold flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Broadcast Message
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sent.map((n: any) => (
          <div key={n.id} className="glass-dark p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">{n.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/20 tracking-widest">
                       <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 14 Recipients</span>
                       <span className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 2 hours ago</span>
                    </div>
                  </div>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                  {n.message}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                 <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    Delivered
                 </div>
                 <button className="p-3 hover:bg-white/5 rounded-xl text-white/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
                    <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        ))}

        {sent.length === 0 && !loading && (
          <div className="p-20 text-center glass-dark rounded-3xl border border-white/5 border-dashed">
             <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
                <Send className="w-10 h-10 text-white/10" />
             </div>
             <h2 className="text-xl font-bold mb-2">No History</h2>
             <p className="text-white/20 text-sm max-w-xs mx-auto">You haven't sent any broadcast notifications or automated messages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
