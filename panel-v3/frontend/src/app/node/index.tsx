import React, { useState, useEffect } from 'react';
import { Server, Signal, MoreVertical, Plus, RefreshCw, SignalHigh } from 'lucide-react';
import { SkeletonGrid } from '../components/SkeletonLoader';

interface Node {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  cpu_usage: string;
  ram_usage: string;
}

const NodeIndex: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      setNodes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      // Artificial delay to demonstrate skeleton fluidity
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nodes</h1>
          <p className="text-white/50">Infrastructure overview and edge telemetry</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchNodes}
            className="p-2 glass-dark hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="neon-button flex items-center justify-center gap-2 font-bold">
            <Plus className="w-5 h-5" />
            Add Node
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : nodes.length === 0 ? (
        <div className="glass-dark p-12 rounded-3xl border border-white/5 text-center">
          <Server className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold">No nodes operational</h3>
          <p className="text-white/40 mb-6">Connect your first edge node to start deploying instances.</p>
          <button className="neon-button py-3 px-8">Deploy First Node</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <div key={node.id} className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-neon-blue/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:neon-border transition-all">
                    <SignalHigh className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{node.name}</h3>
                    <p className="text-xs text-white/40 font-mono">{node.ip_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    node.status === 'Online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {node.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-xs font-bold text-white/30 uppercase tracking-tighter">
                   <span>Resources</span>
                   <span className="text-white/60">{node.cpu_usage} CPU / {node.ram_usage} RAM</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue shadow-neon transition-all w-1/3" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeIndex;
