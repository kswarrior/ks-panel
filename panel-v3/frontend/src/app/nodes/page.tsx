"use client";

import React, { useState, useEffect } from 'react';
import { Server, Activity, Plus, Signal, Cpu, MemoryStick as Memory, RefreshCw, X, HardDrive } from 'lucide-react';

interface Node {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  cpu_usage: string;
  ram_usage: string;
  disk_usage: string;
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState({
    name: '',
    connection_type: 'IP Address',
    host: '',
    port: '4040'
  });

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
          <button
            onClick={() => setShowAddModal(true)}
            className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Node
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="glass-dark w-full max-w-lg rounded-2xl p-8 relative z-10 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Node</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70 ml-1">Node Name</label>
                <input
                  type="text"
                  value={newNode.name}
                  onChange={(e) => setNewNode({...newNode, name: e.target.value})}
                  className="w-full neon-input"
                  placeholder="My Edge Server"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70 ml-1">Connection Type</label>
                <select
                  value={newNode.connection_type}
                  onChange={(e) => setNewNode({...newNode, connection_type: e.target.value})}
                  className="w-full neon-input appearance-none bg-[#0a0a0a]"
                >
                  <option>IP Address</option>
                  <option>Tunnel</option>
                  <option>Localhost</option>
                </select>
              </div>

              {newNode.connection_type !== 'Localhost' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-1">
                    {newNode.connection_type === 'Tunnel' ? 'Tunnel Hostname' : 'IP Address'}
                  </label>
                  <input
                    type="text"
                    value={newNode.host}
                    onChange={(e) => setNewNode({...newNode, host: e.target.value})}
                    className="w-full neon-input"
                    placeholder={newNode.connection_type === 'Tunnel' ? 'node.example.com' : '192.168.1.100'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70 ml-1">Port</label>
                <input
                  type="text"
                  value={newNode.port}
                  onChange={(e) => setNewNode({...newNode, port: e.target.value})}
                  className="w-full neon-input"
                  placeholder="4040"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/nodes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newNode)
                    });
                    if (res.ok) {
                      setShowAddModal(false);
                      fetchNodes();
                    }
                  }}
                  className="flex-1 neon-button font-bold py-3"
                >
                  Create Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span>{node.ram_usage}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue/60 shadow-neon" style={{ width: node.ram_usage.includes('/') ? `${(parseFloat(node.ram_usage) / parseFloat(node.ram_usage.split('/')[1])) * 100}%` : '0%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                    <div className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> Disk</div>
                    <span>{node.disk_usage}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue/40 shadow-neon" style={{ width: node.disk_usage.includes('/') ? `${(parseFloat(node.disk_usage) / parseFloat(node.disk_usage.split('/')[1])) * 100}%` : '0%' }} />
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
