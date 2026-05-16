"use client";

import React, { useState, useEffect } from 'react';
import { Server, Activity, Plus, Signal, Cpu, MemoryStick as Memory, RefreshCw } from 'lucide-react';

interface Node {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  cpu_usage: string;
  ram_usage: string;
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      setNodes(data || []);
    } catch (err) {
      console.error("Failed to fetch nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nodes</h1>
          <p className="text-white/50">Infrastructure overview and edge servers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNodes}
            className="p-2 glass hover:bg-white/10 rounded-md transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            Add Node
          </button>
        </div>
      </div>

      {nodes.length === 0 && !loading ? (
        <div className="glass-dark p-12 rounded-2xl border border-white/5 text-center">
          <Server className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No nodes found</h3>
          <p className="text-white/50 mb-6">Start by adding your first edge node to the panel.</p>
          <button className="neon-button">Add First Node</button>
        </div>
      ) : (
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
                    <p className="text-xs text-white/40 font-mono tracking-wider">{node.ip_address}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  node.status === 'Online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {node.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                    <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</div>
                    <span>{node.cpu_usage}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-blue shadow-neon transition-all duration-500"
                      style={{ width: node.cpu_usage }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                    <div className="flex items-center gap-1"><Memory className="w-3 h-3" /> RAM</div>
                    <span>{node.ram_usage.split(' / ')[0]}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue/60 shadow-neon" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Status</p>
                    <p className={`font-bold text-sm ${node.status === 'Online' ? 'text-green-500' : 'text-red-500'}`}>{node.status}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
