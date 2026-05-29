'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    description: '',
    priority: 'Normal'
  });

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Assume standard ticket creation logic
    alert('Support ticket submission protocol initialized. Our team will review your request shortly.');
    window.location.href = '/tickets';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/tickets" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </Link>

        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Open <span className="text-amber-500">Ticket</span>
          </h1>
          <p className="text-neutral-400 font-medium">Request assistance or report a system anomaly.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3 text-amber-400">
              <MessageSquare size={24} />
              <h2 className="text-xl font-bold tracking-tight">Request Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Subject</label>
                <input
                  type="text"
                  placeholder="Inquiry regarding resource allocation..."
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General Support</option>
                    <option value="Billing">Billing & Finance</option>
                    <option value="Technical">Technical Issue</option>
                    <option value="Feature">Feature Request</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Priority</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  placeholder="Provide a detailed log of the issue or your inquiry..."
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all min-h-[160px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <Link href="/tickets" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              CANCEL
            </Link>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xl shadow-amber-600/20 transition-all active:scale-95"
            >
              <Save size={20} />
              SUBMIT TICKET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
