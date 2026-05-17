import React, { useState, useEffect } from 'react';
import {
  Palette, Plus, Trash2, CheckCircle, Save, Download, Upload,
  Layout, Type, Image as ImageIcon, Eye, RefreshCw, X, Edit,
  Terminal, Monitor, Settings
} from 'lucide-react';
import { SkeletonGrid } from '../components/SkeletonLoader';

interface Theme {
  id: number;
  name: string;
  config: string;
  is_active: boolean;
}

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
  sidebarPosition: 'left', // left | right

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

const ThemeIndex: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    config: defaultConfig
  });

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      setThemes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleSave = async () => {
    if (!formData.name) return;
    const method = editingTheme ? 'PUT' : 'POST';
    const payload = {
      id: editingTheme?.id,
      name: formData.name,
      config: JSON.stringify(formData.config)
    };

    try {
      const res = await fetch('/api/themes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowEditor(false);
        fetchThemes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (theme: Theme) => {
    try {
      await fetch('/api/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: theme.id, apply: true })
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      await fetch(`/api/themes/${id}`, { method: 'DELETE' });
      fetchThemes();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditor = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        name: theme.name,
        config: JSON.parse(theme.config)
      });
    } else {
      setEditingTheme(null);
      setFormData({ name: '', config: defaultConfig });
    }
    setShowEditor(true);
  };

  const updateConfig = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Designer</h1>
          <p className="text-white/50">Custom aesthetic control and brand management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openEditor()}
            className="neon-button flex items-center justify-center gap-2 font-bold"
          >
            <Plus className="w-5 h-5" />
            Create Theme
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={`glass-dark p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                theme.is_active ? 'border-neon-blue shadow-neon' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-2">
                    <button onClick={() => openEditor(theme)} className="p-2 glass-dark rounded-xl hover:bg-white/10"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(theme.id)} className="p-2 glass-dark rounded-xl hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                 </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                 <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: JSON.parse(theme.config).backgroundColor,
                      borderColor: JSON.parse(theme.config).primaryColor + '40',
                      boxShadow: `0 0 15px ${JSON.parse(theme.config).primaryColor}20`
                    }}
                 >
                    <Palette className="w-6 h-6" style={{ color: JSON.parse(theme.config).primaryColor }} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">{theme.name}</h3>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-black">
                       {theme.is_active ? 'Currently Active' : 'Inactive'}
                    </p>
                 </div>
              </div>

              <div className="flex gap-2 mb-6">
                 {['primaryColor', 'backgroundColor', 'accentColor'].map(k => (
                   <div key={k} className="w-6 h-6 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: JSON.parse(theme.config)[k] }} />
                 ))}
              </div>

              {!theme.is_active && (
                <button
                  onClick={() => handleApply(theme)}
                  className="w-full py-3 glass-dark hover:bg-neon-blue hover:text-white rounded-xl font-bold transition-all border border-white/5 hover:border-neon-blue group"
                >
                  Apply Aesthetic
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEditor(false)} />
          <div className="glass-dark w-full max-w-4xl rounded-[2.5rem] p-10 relative z-10 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center text-neon-blue border border-neon-blue/20">
                   <Settings className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">{editingTheme ? 'Refine Aesthetic' : 'Forge New Theme'}</h2>
              </div>
              <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Left Side: General & Colors */}
               <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Identity</label>
                     <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full neon-input py-4 px-5 text-lg"
                        placeholder="Theme Name (e.g. Cyberpunk Blue)"
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <Palette className="w-4 h-4 text-neon-blue" />
                        <span>Chromatics</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Primary', key: 'primaryColor' },
                          { label: 'Background', key: 'backgroundColor' },
                          { label: 'Surface', key: 'surfaceColor' },
                          { label: 'Accent', key: 'accentColor' },
                          { label: 'Text', key: 'textColor' }
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

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <Layout className="w-4 h-4 text-neon-blue" />
                        <span>UI & Glassmorphism</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Glass Blur</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.glassBlur} onChange={e => updateConfig('glassBlur', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Opacity</label>
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

               {/* Right Side: Layout, Typography, Branding */}
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <Monitor className="w-4 h-4 text-neon-blue" />
                        <span>Layout & Dimensions</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Header Height</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.headerHeight} onChange={e => updateConfig('headerHeight', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sidebar Width</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.sidebarWidth} onChange={e => updateConfig('sidebarWidth', e.target.value)} />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Sidebar Position</label>
                           <select
                              className="w-full neon-input px-4 py-2 bg-black/40"
                              value={formData.config.sidebarPosition}
                              onChange={e => updateConfig('sidebarPosition', e.target.value)}
                           >
                              <option value="left">Left Alignment (Standard)</option>
                              <option value="right">Right Alignment (Reversed)</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <Type className="w-4 h-4 text-neon-blue" />
                        <span>Typography</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Base Size</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.fontSizeBase} onChange={e => updateConfig('fontSizeBase', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Font Family</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.fontFamily} onChange={e => updateConfig('fontFamily', e.target.value)} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <ImageIcon className="w-4 h-4 text-neon-blue" />
                        <span>Branding & Background</span>
                     </div>
                     <div className="space-y-3">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Logo URL</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.logoUrl} onChange={e => updateConfig('logoUrl', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Background Image URL</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundImage} onChange={e => updateConfig('backgroundImage', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">BG Blur</label>
                              <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundBlur} onChange={e => updateConfig('backgroundBlur', e.target.value)} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">BG Opacity</label>
                              <input type="text" className="w-full neon-input px-4" value={formData.config.backgroundOpacity} onChange={e => updateConfig('backgroundOpacity', e.target.value)} />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Background Gradient</label>
                           <input type="text" className="w-full neon-input px-4 font-mono text-[10px]" value={formData.config.backgroundGradient} onChange={e => updateConfig('backgroundGradient', e.target.value)} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <RefreshCw className="w-4 h-4 text-neon-blue" />
                        <span>Interactive Components</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Button Glow</label>
                           <input type="text" className="w-full neon-input px-4 font-mono text-[10px]" value={formData.config.buttonGlow} onChange={e => updateConfig('buttonGlow', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Button Radius</label>
                           <input type="text" className="w-full neon-input px-4" value={formData.config.buttonRadius} onChange={e => updateConfig('buttonRadius', e.target.value)} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-white/70 font-bold mb-2">
                        <Terminal className="w-4 h-4 text-neon-blue" />
                        <span>Custom CSS Override</span>
                     </div>
                     <textarea
                        className="w-full neon-input px-4 py-3 h-24 font-mono text-xs"
                        value={formData.config.customCss}
                        onChange={e => updateConfig('customCss', e.target.value)}
                        placeholder="/* Inject raw CSS into root */"
                     />
                  </div>
               </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
               <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(formData.config, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${formData.name || 'theme'}-config.json`;
                    a.click();
                  }}
                  className="px-6 py-4 glass-dark rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/10"
               >
                  <Download className="w-5 h-5" />
                  Export JSON
               </button>
               <button
                  className="px-6 py-4 glass-dark rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/10"
                  onClick={() => {
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (re: any) => {
                           try {
                              const config = JSON.parse(re.target.result);
                              setFormData(prev => ({ ...prev, config }));
                           } catch(e) { alert('Invalid Theme JSON'); }
                        };
                        reader.readAsText(file);
                     };
                     input.click();
                  }}
               >
                  <Upload className="w-5 h-5" />
                  Import Config
               </button>
               <button
                  onClick={handleSave}
                  className="flex-1 neon-button flex items-center justify-center gap-3 font-black text-xl py-4"
               >
                  <Save className="w-6 h-6" />
                  Save Aesthetic
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeIndex;
