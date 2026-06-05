'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Globe, Users, Zap, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real scenario, this would be: await fetch('/api/v1/admin/stats')
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStats([
          { label: 'Total Instances', value: '128', icon: Server, color: 'blue' },
          { label: 'Active Nodes', value: '12', icon: Globe, color: 'emerald' },
          { label: 'Platform Users', value: '1.2k', icon: Users, color: 'purple' },
          { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'amber' },
        ]);

        setActivities([
          { title: 'New Instance Provisioned', user: 'admin_phx', time: '2 minutes ago', type: 'System' },
          { title: 'Node Network Update', user: 'system', time: '15 minutes ago', type: 'Network' },
          { title: 'New User Registered', user: 'guest_99', time: '1 hour ago', type: 'User' },
          { title: 'Backup Completed', user: 'backup_bot', time: '3 hours ago', type: 'System' },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchData();
  }, []);

  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="pt-2 px-4 lg:px-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <PageHeader title="Admin Overview" translationKey="adminOverview" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass p-6 rounded-3xl border border-white/10 space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-white/5"></div>
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-white/5 rounded"></div>
                  <div className="h-8 w-24 bg-white/5 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat) => (
              <div key={stat.label} className="glass p-6 rounded-3xl border border-white/10 space-y-4 group hover:border-blue-500/30 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${colors[stat.color] || 'bg-blue-500/10 text-blue-400'}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black mt-1">{stat.value}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-tight flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  Recent Activity
                </h3>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">View All</button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-white/10"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-white/5 rounded"></div>
                          <div className="h-2 w-32 bg-white/5 rounded"></div>
                        </div>
                      </div>
                      <div className="w-12 h-4 bg-white/5 rounded"></div>
                    </div>
                  ))
                ) : (
                  activities.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="text-sm font-bold">{activity.title}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">User: {activity.user} <span className="mx-2">|</span> {activity.time}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{activity.type}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold uppercase tracking-tight flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-400" />
                Security Alerts
              </h3>
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-200">Failed Login Attempt</p>
                  <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mt-1">IP: 192.168.1.1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
