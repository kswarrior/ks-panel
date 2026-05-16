"use client";

import React from 'react';
import { Server, Activity, Plus, Signal, Cpu, MemoryStick as Memory } from 'lucide-react';

const nodes = [
  { id: 1, name: 'North America-01', ip: '192.168.1.10', status: 'Online', cpu: '24%', ram: '16GB / 64GB' },
  { id: 2, name: 'Europe-Main', ip: '10.0.0.5', status: 'Online', cpu: '68%', ram: '42GB / 128GB' },
  { id: 3, name: 'Asia-Backup', ip: '172.16.0.2', status: 'Maintenance', cpu: '0%', ram: '0GB / 32GB' },
];

export default function NodesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nodes</h1>
          <p className="text-white/50">Infrastructure overview and edge servers</p>
        </div>
        <button className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Add Node
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <div key={node.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-neon-blue/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:neon-border transition-all">
                  <Signal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{node.name}</h3>
                  <p className="text-xs text-white/40 font-mono tracking-wider">{node.ip}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                node.status === 'Online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}>
                {node.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                  <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</div>
                  <span>{node.cpu}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-blue shadow-neon transition-all duration-500"
                    style={{ width: node.cpu }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                  <div className="flex items-center gap-1"><Memory className="w-3 h-3" /> RAM</div>
                  <span>{node.ram.split(' / ')[0]}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue/60 shadow-neon" style={{ width: '45%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold">Instances</p>
                  <p className="font-bold text-sm">12</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold">Load</p>
                  <p className="font-bold text-sm">Low</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
