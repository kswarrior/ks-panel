"use client";

import React from 'react';
import { Plus, Server, Activity, Cpu, HardDrive } from 'lucide-react';

const instances = [
  { id: 1, name: 'Main Web Server', status: 'Running', cpu: '12%', ram: '1.2GB / 4GB', disk: '25GB / 100GB' },
  { id: 2, name: 'Database Node 01', status: 'Running', cpu: '45%', ram: '3.8GB / 8GB', disk: '120GB / 500GB' },
  { id: 3, name: 'Cache Proxy', status: 'Stopped', cpu: '0%', ram: '0GB / 2GB', disk: '5GB / 20GB' },
  { id: 4, name: 'Development Bot', status: 'Running', cpu: '5%', ram: '0.4GB / 1GB', disk: '2GB / 10GB' },
];

export default function InstancesPage() {
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
        {instances.map((instance) => (
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
                  <span>{instance.cpu}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-blue shadow-neon transition-all duration-500"
                    style={{ width: instance.cpu }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <Activity className="w-4 h-4 text-neon-blue" />
                  <span>{instance.ram}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <HardDrive className="w-4 h-4 text-neon-blue" />
                  <span>{instance.disk}</span>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-white/5 hover:bg-neon-blue hover:text-white border border-white/10 hover:border-neon-blue rounded-lg font-bold transition-all duration-300">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
