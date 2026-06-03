'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, MessageSquare, Tag, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function CreateTicket() {
  return (
    <div className="p-4 lg:p-6 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/tickets" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-4">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </Link>

        <PageHeader title="Open Support Ticket" translationKey="openSupportTicket" />

        <div className="grid grid-cols-1 gap-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Subject</label>
              <input
                type="text"
                placeholder="Briefly describe the inquiry"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Department</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none">
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Sales</option>
                  <option value="security">Security & Abuse</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Priority</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none">
                  <option value="low">Standard</option>
                  <option value="medium">Elevated</option>
                  <option value="high">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea
                rows={6}
                placeholder="Provide as much detail as possible..."
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
              ></textarea>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4">
            <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-sm">
              DISCARD
            </button>
            <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xl shadow-amber-600/20 transition-all active:scale-95 text-sm uppercase">
              <Send size={18} />
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
