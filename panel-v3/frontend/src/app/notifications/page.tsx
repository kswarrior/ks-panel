"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Send, User, Clock, Trash2, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-white/50">Send and manage system-wide alerts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
        >
          <Send className="w-5 h-5" />
          Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          notifications.map(n => (
            <div key={n.id} className="glass-dark p-6 rounded-2xl border border-white/5 flex items-start gap-4 group">
              <div className={`p-3 rounded-xl ${
                n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-neon-blue/10 text-neon-blue'
              }`}>
                {n.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                 n.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{n.title}</h3>
                  <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.created_at}</span>
                </div>
                <p className="text-white/60 mt-1">{n.message}</p>
              </div>
              <button
                onClick={async () => {
                  if (confirm('Delete this notification?')) {
                    await fetch(`/api/notifications/${n.id}`, { method: 'DELETE' });
                    fetchNotifications();
                  }
                }}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="glass-dark w-full max-w-lg rounded-2xl p-8 relative z-10">
            <h2 className="text-2xl font-bold mb-6">Send Global Notification</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Title</label>
                <input
                  type="text"
                  className="w-full neon-input"
                  placeholder="Maintenance Alert"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Type</label>
                <select
                  className="w-full neon-input bg-black/40"
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Message</label>
                <textarea
                  className="w-full neon-input h-32 resize-none"
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all">Cancel</button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/notifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(form)
                    });
                    if (res.ok) {
                      setShowCreate(false);
                      fetchNotifications();
                    }
                  }}
                  className="flex-1 neon-button font-bold py-3"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
