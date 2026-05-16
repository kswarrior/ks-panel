"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Server, Activity, Cpu, HardDrive } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';

interface Instance {
  id: number;
  name: string;
  status: string;
  cpu?: string;
  ram?: string;
  disk?: string;
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instances');
      const data = await res.json();
      setInstances(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Instances</h1>
          <p className="text-white/50">Manage your virtual environments and nodes</p>
        </div>
        <button className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Create Instance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)
        ) : instances.length === 0 ? (
          <div className="col-span-full glass-dark p-12 rounded-2xl text-center border border-white/5">
            <Server className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No instances found</h3>
            <p className="text-white/40">You haven't created any instances yet.</p>
          </div>
        ) : (
          instances.map((instance) => (
            <div key={instance.id} className="glass-dark hover:border-neon-blue/40 transition-all duration-300 rounded-2xl p-6 group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:neon-border transition-all">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{instance.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${instance.status === 'Running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                      <span className="text-xs text-white/50 uppercase tracking-widest font-bold">{instance.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-white/50 uppercase">
                    <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Usage</div>
                    <span>{instance.cpu || '0%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-blue shadow-neon transition-all duration-500"
                      style={{ width: instance.cpu || '0%' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Activity className="w-4 h-4 text-neon-blue" />
                    <span>{instance.ram || '0GB / 0GB'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <HardDrive className="w-4 h-4 text-neon-blue" />
                    <span>{instance.disk || '0GB / 0GB'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/instances/view?id=${instance.id}`}
                className="w-full py-2 bg-white/5 hover:bg-neon-blue hover:text-white border border-white/10 hover:border-neon-blue rounded-lg font-bold transition-all duration-300 flex items-center justify-center"
              >
                Manage
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
