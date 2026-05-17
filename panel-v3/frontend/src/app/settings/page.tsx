"use client";

import React, { useState } from 'react';
import { Settings, Image, Save, Globe, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  const [general, setGeneral] = useState({
    panelName: '',
    logoUrl: '',
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setGeneral({
          panelName: data.panel_name || 'KS PANEL v3',
          logoUrl: data.logo_url || '/logo.png',
        });
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-white/50">Global configuration and panel customization</p>
      </div>

      <div className="space-y-8">
        <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-neon-blue" /> General Configuration
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 uppercase ml-1">Panel Name</label>
              <input
                type="text"
                className="w-full neon-input"
                value={general.panelName}
                onChange={e => setGeneral(p => ({ ...p, panelName: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/40 uppercase ml-1">Logo URL</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  className="flex-1 neon-input"
                  value={general.logoUrl}
                  onChange={e => setGeneral(p => ({ ...p, logoUrl: e.target.value }))}
                />
                <button className="px-4 py-3 sm:py-2 glass hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                  <Image className="w-4 h-4" /> Browse
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={async () => {
                const res = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    panel_name: general.panelName,
                    logo_url: general.logoUrl
                  })
                });
                if (res.ok) alert('Settings saved');
              }}
              className="neon-button flex items-center gap-2 px-6"
            >
              <Save className="w-4 h-4" /> Save General Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold">Security</h3>
            <p className="text-sm text-white/50">Configure 2FA, password requirements, and session limits.</p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/5">Manage Security</button>
          </div>

          <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold">Database</h3>
            <p className="text-sm text-white/50">Backup maintenance, optimization, and raw data export.</p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/5">DB Tools</button>
          </div>
        </div>
      </div>
    </div>
  );
}
