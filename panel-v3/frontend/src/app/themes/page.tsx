"use client";

import React, { useState, useEffect } from 'react';
import { Palette, Plus, X, Upload, Layout, Sidebar, CreditCard, Type, Image as ImageIcon, Check, Save } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface Theme {
  id: number;
  name: string;
  is_active: boolean;
  config: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newTheme, setNewTheme] = useState({
    name: 'New Custom Theme',
    config: {
      backgroundColor: '#050505',
      primaryColor: '#0ea5e9',
      backgroundImage: '',
      headerHeight: 64,
      sidebarWidth: 256
    }
  });

  const handleCreateTheme = async () => {
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTheme.name,
          config: JSON.stringify(newTheme.config)
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchThemes();
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Themes</h1>
          <p className="text-white/50">Customize the look and feel of your panel</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neon-button flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Create Theme
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <div key={theme.id} className={`glass-dark p-6 rounded-2xl border transition-all group ${theme.is_active ? 'border-neon-blue' : 'border-white/5 hover:border-white/10'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Palette className={`w-6 h-6 ${theme.is_active ? 'text-neon-blue' : 'text-white/40'}`} />
                </div>
                {theme.is_active && (
                  <span className="px-2 py-1 rounded bg-neon-blue/20 text-neon-blue text-[10px] font-bold uppercase tracking-widest border border-neon-blue/30">Active</span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
              <p className="text-sm text-white/40 mb-6 italic">Custom theme configuration</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 glass hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-all">Edit</button>
                {!theme.is_active && (
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/themes', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: theme.id })
                      });
                      if (res.ok) fetchThemes();
                    }}
                    className="flex-1 py-2 neon-button text-xs"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Theme Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="glass-dark w-full max-w-5xl rounded-3xl p-0 relative z-10 flex flex-col h-full max-h-[95vh] lg:max-h-[90vh] overflow-hidden border border-white/10">
            <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center border border-neon-blue/30">
                  <Palette className="w-5 h-5 text-neon-blue" />
                </div>
                <h2 className="text-2xl font-bold">Theme Designer</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Sidebar Tabs - Horizontal on Mobile, Vertical on Desktop */}
              <div className="flex lg:flex-col lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-2 lg:p-4 space-x-2 lg:space-x-0 lg:space-y-2 bg-black/20 overflow-x-auto lg:overflow-x-hidden no-scrollbar">
                {[
                  { id: 'general', name: 'General', icon: Palette },
                  { id: 'header', name: 'Header', icon: Layout },
                  { id: 'sidebar', name: 'Sidebar', icon: Sidebar },
                  { id: 'cards', name: 'Cards', icon: CreditCard },
                  { id: 'text', name: 'Typography', icon: Type },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                      activeTab === tab.id ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-neon' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-black/40">
                <div className="max-w-2xl mx-auto">
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Background Settings</h4>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Theme Name</label>
                          <input
                            type="text"
                            className="w-full neon-input"
                            value={newTheme.name}
                            onChange={(e) => setNewTheme({...newTheme, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Main Background Color</label>
                          <div className="flex gap-4">
                            <input
                              type="color"
                              className="w-12 h-10 bg-transparent border-none cursor-pointer"
                              value={newTheme.config.backgroundColor}
                              onChange={(e) => setNewTheme({...newTheme, config: {...newTheme.config, backgroundColor: e.target.value}})}
                            />
                            <input
                              type="text"
                              className="flex-1 neon-input font-mono"
                              value={newTheme.config.backgroundColor}
                              onChange={(e) => setNewTheme({...newTheme, config: {...newTheme.config, backgroundColor: e.target.value}})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Upload Wallpaper (URL - gif, webp, png)</label>
                          <div className="relative group">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="text"
                              className="w-full neon-input pl-10"
                              placeholder="https://example.com/background.gif"
                              value={newTheme.config.backgroundImage}
                              onChange={(e) => setNewTheme({...newTheme, config: {...newTheme.config, backgroundImage: e.target.value}})}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Accent Colors</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/70 ml-1">Primary Neon</label>
                            <input
                              type="color"
                              className="w-full h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border border-white/10"
                              value={newTheme.config.primaryColor}
                              onChange={(e) => setNewTheme({...newTheme, config: {...newTheme.config, primaryColor: e.target.value}})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'header' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Height (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="64" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Border Radius</label>
                          <input type="number" className="w-full neon-input" defaultValue="0" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/70 ml-1">Glass Effect Opacity</label>
                        <input type="range" className="w-full accent-neon-blue" min="0" max="100" defaultValue="5" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'sidebar' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Width (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="256" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Margin (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="0" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/70 ml-1">Active Item Color</label>
                        <input type="color" className="w-full h-10 bg-transparent cursor-pointer rounded-lg border border-white/10" defaultValue="#0ea5e9" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'cards' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Border Radius (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="16" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Padding (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/70 ml-1">Hover Scale Effect</label>
                        <input type="checkbox" className="w-5 h-5 accent-neon-blue rounded" defaultChecked />
                      </div>
                    </div>
                  )}

                  {activeTab === 'text' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">H1 Size (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 ml-1">Paragraph Size (px)</label>
                          <input type="number" className="w-full neon-input" defaultValue="14" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/70 ml-1">Base Font Color</label>
                        <input type="color" className="w-full h-10 bg-transparent cursor-pointer rounded-lg border border-white/10" defaultValue="#ffffff" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <Check className="w-4 h-4 text-neon-blue" />
                <span className="text-xs text-white/40">Theme ready to be saved</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto order-1 sm:order-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 sm:flex-none px-6 py-2 glass hover:bg-white/10 rounded-xl font-bold text-sm">Discard</button>
                <button
                  onClick={handleCreateTheme}
                  className="flex-1 sm:flex-none neon-button flex items-center justify-center gap-2 px-8"
                >
                  <Save className="w-4 h-4" /> Save Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
