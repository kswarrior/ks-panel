import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, MoreVertical, Plus, RefreshCw, Edit2, Trash2, Cpu, HardDrive, Database, Activity } from 'lucide-react';
import { SkeletonGrid } from '../components/SkeletonLoader';

interface Node {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  cpu_usage: string;
  ram_usage: string;
  disk_usage: string;
  uptime_history: string[];
}

const NodeCard: React.FC<{ node: Node, onEdit: () => void, onDelete: () => void }> = ({ node, onEdit, onDelete }) => {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="glass-dark p-6 rounded-[2rem] border border-white/5 hover:border-neon-blue/30 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:neon-border transition-all">
             <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-0.5 h-4 bg-white" />
                <div className="w-0.5 h-2 bg-white" />
                <div className="w-0.5 h-3 bg-white" />
             </div>
          </div>
          <div>
            <h3 className="font-bold text-xl tracking-tight">{node.name}</h3>
            <p className="text-xs text-white/30 font-mono">{node.ip_address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            node.status === 'Online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {node.status}
          </div>
          <div className="relative">
             <button
               onClick={() => setShowStats(!showStats)}
               className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
             >
               <MoreVertical className="w-5 h-5" />
             </button>

             {showStats && (
               <div className="absolute right-0 top-12 w-64 glass-dark border border-white/10 rounded-2xl p-4 z-20 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30">
                           <Cpu className="w-3 h-3" /> CPU Usage
                        </div>
                        <span className="text-xs font-bold">{node.cpu_usage}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue shadow-neon" style={{ width: node.cpu_usage }} />
                     </div>

                     <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30">
                           <Database className="w-3 h-3" /> RAM Memory
                        </div>
                        <span className="text-xs font-bold">{node.ram_usage}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue shadow-neon" style={{ width: '40%' }} />
                     </div>

                     <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30">
                           <HardDrive className="w-3 h-3" /> Disk Space
                        </div>
                        <span className="text-xs font-bold">{node.disk_usage}</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue shadow-neon" style={{ width: '60%' }} />
                     </div>

                     <div className="border-t border-white/5 pt-3 mt-1 flex gap-2">
                        <button onClick={onEdit} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                           <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={onDelete} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-red-500/20">
                           <Trash2 className="w-3 h-3" /> Delete
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-end justify-between">
            <div>
               <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Overall Uptime</p>
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">99.8</span>
                  <span className="text-sm font-bold text-white/30">%</span>
               </div>
            </div>
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] font-black text-green-500 uppercase">
               Stable
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between items-center h-8 gap-0.5">
               {Array.from({ length: 40 }).map((_, i) => {
                 const status = node.uptime_history?.[i] || (i % 15 === 0 ? 'Offline' : 'Online');
                 return (
                   <div
                     key={i}
                     className={`flex-1 h-full rounded-full transition-all ${
                       status === 'Online' ? 'bg-green-500/40' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                     }`}
                   />
                 );
               })}
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase text-white/20 tracking-tighter">
               <span>30 Days Ago</span>
               <span>Today</span>
            </div>
         </div>

         <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Online</span>
            </div>
            <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
               Configure
            </button>
         </div>
      </div>
    </div>
  );
};

const NodeIndex: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      setNodes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Disconnect this node? Active instances will be unreachable.')) return;
    try {
      await fetch(`/api/nodes?id=${id}`, { method: 'DELETE' });
      fetchNodes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Nodes</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchNodes}
            className="p-2 glass-dark hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/node/create')}
            className="neon-button flex items-center justify-center gap-2 font-bold px-6 py-2.5"
          >
            <Plus className="w-5 h-5" />
            Add Node
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : nodes.length === 0 ? (
        <div className="glass-dark p-12 rounded-[2rem] border border-white/5 text-center">
          <Server className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold">No nodes operational</h3>
          <p className="text-white/40 mb-6">Connect your first edge node to start deploying instances.</p>
          <button onClick={() => navigate('/node/create')} className="neon-button py-3 px-8 font-bold">Deploy First Node</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              onEdit={() => navigate(`/node/edit/${node.id}`)}
              onDelete={() => handleDelete(node.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeIndex;
