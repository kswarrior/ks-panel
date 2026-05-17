import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Box, Edit2, Trash2, HardDrive, Package } from 'lucide-react';

export default function TemplatesIndex() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this deployment template?')) {
      const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) setTemplates(templates.filter((t: any) => t.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Service Blueprints</h1>
          <p className="text-white/40 max-w-lg">Manage reusable environment templates for rapid infrastructure deployment</p>
        </div>
        <button
          onClick={() => navigate('/templates/create')}
          className="neon-button px-8 py-3.5 font-bold flex items-center gap-3 self-start"
        >
          <Plus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <div key={template.id} className="glass-dark p-6 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] -mr-4 -mt-4">
               <Package className="w-24 h-24" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-neon-blue/30 transition-all">
                <Box className="w-6 h-6 text-neon-blue" />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{template.name}</h3>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{template.image}</p>
              </div>
            </div>

            <p className="text-xs text-white/40 line-clamp-2 mb-6 min-h-[2rem]">
               {template.description || 'No description provided for this blueprint.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase">
                  <HardDrive className="w-3 h-3" />
                  Containerized
               </div>
               <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/templates/edit/${template.id}`)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
