import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, ShieldQuestion } from 'lucide-react';

export default function TicketCreate() {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    priority: 'Normal',
    message: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tickets/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/ticket');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/ticket')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Support
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <ShieldQuestion className="w-6 h-6 text-neon-blue" />
          </div>
          <h1 className="text-2xl font-bold">Open Support Ticket</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Subject</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              placeholder="e.g. Instance connection failure"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Category</label>
              <select
                className="w-full neon-input py-3 px-4 appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>General</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Abuse</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Priority</label>
              <select
                className="w-full neon-input py-3 px-4 appearance-none"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Detailed Message</label>
            <textarea
              required
              className="w-full neon-input py-3 px-4 min-h-[150px]"
              placeholder="Please describe your issue in detail..."
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
