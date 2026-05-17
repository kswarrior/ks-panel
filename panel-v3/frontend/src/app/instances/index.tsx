import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Server, Activity, Settings,
  Terminal, HardDrive, Cpu, Zap
} from 'lucide-react';

export default function InstancesIndex() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/instances')
      .then(res => res.json())
      .then(data => {
        setInstances(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Cloud Infrastructure</h1>
          <p className="text-white/40 max-w-lg">Monitor and manage your distributed virtual instances across global nodes</p>
        </div>
        <button
          onClick={() => navigate('/instances/create')}
          className="neon-button px-8 py-3.5 font-bold flex items-center gap-3 self-start"
        >
          <Plus className="w-5 h-5" />
          Deploy Instance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance: any) => (
          <div key={instance.id} className="glass-dark p-6 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
                <Server className="w-6 h-6 text-neon-blue" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1" />
                 {instance.status}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{instance.name}</h3>
            <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest mb-6">
               <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> 2 vCores</span>
               <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> 40GB NVMe</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
               <button
                onClick={() => navigate(`/instances/edit/${instance.id}`)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5"
               >
                  <Settings className="w-3.5 h-3.5 opacity-50" />
                  Manage
               </button>
               <button className="flex items-center justify-center gap-2 py-2.5 bg-neon-blue/10 hover:bg-neon-blue/20 rounded-xl text-xs font-bold text-neon-blue transition-all border border-neon-blue/10">
                  <Terminal className="w-3.5 h-3.5" />
                  Console
               </button>
            </div>
          </div>
        ))}
      </div>

      {instances.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center justify-center glass-dark rounded-[3rem] border border-dashed border-white/10">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-white/10" />
           </div>
           <h2 className="text-xl font-bold mb-2">No Instances Detected</h2>
           <p className="text-white/30 text-sm mb-8">Deploy your first environment to begin operations</p>
           <button
             onClick={() => navigate('/instances/create')}
             className="neon-button px-10 py-3 font-bold"
           >
             Start Deployment
           </button>
        </div>
      )}
    </div>
  );
}
