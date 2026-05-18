import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Palette, ArrowLeft, Save, Download, Layout,
  Image as ImageIcon, Terminal, Monitor, Settings
} from 'lucide-react';

export default function ThemeEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        const theme = data.find((t: any) => t.id === parseInt(id!));
        if (theme) {
          setFormData({
            name: theme.name,
            config: JSON.parse(theme.config)
          });
        }
      });
  }, [id]);

  const updateConfig = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    try {
      const res = await fetch('/api/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id!),
          name: formData.name,
          config: JSON.stringify(formData.config)
        })
      });
      if (res.ok) navigate('/theme');
    } catch (err) {
      console.error(err);
    }
  };

  if (!formData) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/theme')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Themes
        </button>
        <div className="flex gap-4">
           <button
              onClick={handleSave}
              className="neon-button px-8 py-2 font-black"
           >
              Update Aesthetic
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="space-y-8">
            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Identity</h2>
               </div>
               <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full neon-input py-4 px-5 text-lg"
               />
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Palette className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Chromatics</h2>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Primary Accent', key: 'primaryColor' },
                    { label: 'Background', key: 'backgroundColor' },
                    { label: 'Surface/Cards', key: 'surfaceColor' },
                    { label: 'Error/Accent', key: 'accentColor' },
                    { label: 'Base Text', key: 'textColor' }
                  ].map(c => (
                    <div key={c.key} className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">{c.label}</label>
                       <div className="flex gap-2">
                          <input
                             type="color"
                             className="w-10 h-10 bg-transparent border-none cursor-pointer"
                             value={formData.config[c.key]}
                             onChange={e => updateConfig(c.key, e.target.value)}
                          />
                          <input
                             type="text"
                             className="flex-1 neon-input px-3 font-mono text-sm"
                             value={formData.config[c.key]}
                             onChange={e => updateConfig(c.key, e.target.value)}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Monitor className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Layout Controls</h2>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Header Height</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.headerHeight} onChange={e => updateConfig('headerHeight', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sidebar Width</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.sidebarWidth} onChange={e => updateConfig('sidebarWidth', e.target.value)} />
                  </div>
               </div>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Terminal className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Advanced Overrides</h2>
               </div>
               <textarea
                  className="w-full neon-input px-4 py-3 h-48 font-mono text-xs"
                  value={formData.config.customCss}
                  onChange={e => updateConfig('customCss', e.target.value)}
                  placeholder="/* Root-level CSS overrides */"
               />
            </div>
         </div>
      </div>
    </div>
  );
}
