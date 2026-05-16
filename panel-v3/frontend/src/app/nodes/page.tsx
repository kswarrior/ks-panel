"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Server, Activity, Plus, Signal, Cpu, MemoryStick as Memory, RefreshCw, X, HardDrive, MoreVertical, Info, Link as LinkIcon } from 'lucide-react';

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
            <NodeCard key={node.id} node={node} onRefresh={fetchNodes} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeCard({ node, onRefresh }: { node: Node, onRefresh: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as any)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock uptime data (segments) - 40 bars for a denser look
  const uptimeSegments = Array.from({ length: 40 }, (_, i) => i !== 28);

  return (
    <div className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-neon-blue/30 transition-all duration-300 group relative">
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
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            node.status === 'Online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {node.status}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Node Resources</p>
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/70">
                    <Cpu className="w-4 h-4 text-neon-blue" />
                    <span>CPU: {node.cpu_usage}</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/70">
                    <Memory className="w-4 h-4 text-neon-blue" />
                    <span>RAM: {node.ram_usage}</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/70">
                    <HardDrive className="w-4 h-4 text-neon-blue" />
                    <span>Disk: {node.disk_usage}</span>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/70">
                    <LinkIcon className="w-4 h-4 text-white/30" />
                    <span className="truncate">{node.ip_address}</span>
                  </div>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                    <span>Delete Node</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Uptime Bar */}
      <div className="mt-8 space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Overall Uptime</p>
            <p className="text-2xl font-black text-white leading-none">99.8<span className="text-sm text-white/30">%</span></p>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-black uppercase">Stable</span>
          </div>
        </div>

        <div className="flex gap-1 h-8 items-center">
          {uptimeSegments.map((ok, i) => (
            <div
              key={i}
              className={`flex-1 h-5 rounded-full transition-all duration-500 hover:h-8 cursor-help ${
                ok ? 'bg-green-500/30 hover:bg-green-400' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
              }`}
              title={ok ? 'Operational' : 'Downtime Detected'}
            />
          ))}
        </div>
        <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-tighter">
          <span>30 Days ago</span>
          <span>Today</span>
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
  );
}
