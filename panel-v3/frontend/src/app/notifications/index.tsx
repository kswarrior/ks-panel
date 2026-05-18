import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, Mail, CheckCircle2,
  Clock, Trash2, Send,
  Inbox
} from 'lucide-react';

export default function NotificationsIndex() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/notifications/')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/notifications/sent"
            className="glass-dark px-6 py-3.5 font-bold flex items-center gap-3 rounded-2xl border border-white/5 hover:border-white/20 transition-all"
          >
            <Send className="w-5 h-5 text-white/40" />
            Sent Messages
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((n: any) => (
          <div key={n.id} className="glass-dark p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all flex flex-col md:flex-row gap-6 items-start">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              n.is_read ? 'bg-white/5 border-white/5 text-white/20' : 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'
            }`}>
              <Bell className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className={`text-lg font-bold truncate ${n.is_read ? 'text-white/60' : 'text-white'}`}>{n.title}</h3>
                  <span className="text-[10px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5 shrink-0">
                     <Clock className="w-3 h-3" />
                     Just Now
                  </span>
               </div>
               <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">
                 {n.message}
               </p>
               <div className="flex items-center gap-4">
                  <button className="text-[10px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-all">Mark as read</button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-all">Delete</button>
               </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="p-20 text-center glass-dark rounded-3xl border border-white/5">
             <Inbox className="w-12 h-12 mx-auto mb-4 opacity-10 text-white" />
             <p className="font-medium text-white/20 uppercase tracking-widest text-xs">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
