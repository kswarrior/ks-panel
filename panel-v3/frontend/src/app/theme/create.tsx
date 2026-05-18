import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette, ArrowLeft, Save, Download, Upload,
  Layout, Type, Image as ImageIcon, Eye, RefreshCw,
  Terminal, Monitor, Settings
} from 'lucide-react';

const defaultConfig = {
  primaryColor: '#0ea5e9',
  backgroundColor: '#050505',
  surfaceColor: '#0a0a0a',
  textColor: '#ffffff',
  accentColor: '#ef4444',
  glassBlur: '12px',
  glassOpacity: '0.05',
  borderRadius: '1.5rem',
  borderOpacity: '0.1',
  headerHeight: '64px',
  sidebarWidth: '256px',
  sidebarPosition: 'left',
  fontSizeBase: '16px',
  fontFamily: 'Inter, sans-serif',
  logoUrl: '/logo.png',
  backgroundImage: '',
  backgroundBlur: '0px',
  backgroundOpacity: '1',
  backgroundGradient: 'linear-gradient(180deg, rgba(5,5,5,1) 0%, rgba(10,10,10,1) 100%)',
  buttonGlow: '0 0 15px rgba(14,165,233,0.3)',
  buttonRadius: '1rem',
  customCss: ''
};

export default function ThemeCreate() {
  const [formData, setFormData] = useState({
    name: '',
    config: defaultConfig
  });
  const navigate = useNavigate();

  const updateConfig = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          config: JSON.stringify(formData.config)
        })
      });
      if (res.ok) navigate('/theme');
    } catch (err) {
      console.error(err);
    }
  };

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
              onClick={() => {
                const blob = new Blob([JSON.stringify(formData.config, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formData.name || 'theme'}-config.json`;
                a.click();
              }}
              className="px-4 py-2 glass-dark rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-white/10"
           >
              <Download className="w-4 h-4" />
              Export
           </button>
           <button
              onClick={handleSave}
              className="neon-button px-8 py-2 font-black"
           >
              Save Theme
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
                  placeholder="Theme Name (e.g. Cyberpunk Blue)"
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
                             value={formData.config[c.key as keyof typeof defaultConfig]}
                             onChange={e => updateConfig(c.key, e.target.value)}
                          />
                          <input
                             type="text"
                             className="flex-1 neon-input px-3 font-mono text-sm"
                             value={formData.config[c.key as keyof typeof defaultConfig]}
                             onChange={e => updateConfig(c.key, e.target.value)}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Layout className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Glassmorphism</h2>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Glass Blur</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.glassBlur} onChange={e => updateConfig('glassBlur', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Surface Opacity</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.glassOpacity} onChange={e => updateConfig('glassOpacity', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Border Radius</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.borderRadius} onChange={e => updateConfig('borderRadius', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Border Opacity</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.borderOpacity} onChange={e => updateConfig('borderOpacity', e.target.value)} />
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Monitor className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Layout & Branding</h2>
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
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Logo URL</label>
                  <input type="text" className="w-full neon-input px-4" value={formData.config.logoUrl} onChange={e => updateConfig('logoUrl', e.target.value)} />
               </div>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <ImageIcon className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Background Designer</h2>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Background Image URL</label>
                     <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundImage} onChange={e => updateConfig('backgroundImage', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">BG Blur</label>
                        <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundBlur} onChange={e => updateConfig('backgroundBlur', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">BG Opacity</label>
                        <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundOpacity} onChange={e => updateConfig('backgroundOpacity', e.target.value)} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">CSS Background / Gradient</label>
                     <input type="text" className="w-full neon-input px-4 font-mono text-[10px]" value={formData.config.backgroundGradient} onChange={e => updateConfig('backgroundGradient', e.target.value)} />
                  </div>
               </div>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <Terminal className="w-5 h-5 text-neon-blue" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Raw CSS Injection</h2>
               </div>
               <textarea
                  className="w-full neon-input px-4 py-3 h-32 font-mono text-xs"
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
