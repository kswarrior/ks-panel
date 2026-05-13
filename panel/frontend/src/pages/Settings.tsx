import React, { useState, useEffect } from "react";

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API fetch as requested
    const fetchSettings = async () => {
      try {
        // In a real app: const res = await fetch('/api/settings');
        // setSettings(await res.json());
        setTimeout(() => {
          setSettings({
            panelName: "KS Panel",
            footer: "Modernized by Jules",
            theme: "Cyberpunk"
          });
          setLoading(false);
        }, 500);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <div className="text-center p-10 neon-text-blue">Syncing System Data...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
        <span className="w-2 h-8 bg-cyber-pink rounded-full shadow-[0_0_15px_rgba(255,0,255,0.5)]" />
        System Settings
      </h2>

      <div className="glass p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Panel Name</label>
            <input
              type="text"
              value={settings.panelName}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyber-blue/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Footer Text</label>
            <textarea
              value={settings.footer}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white h-24 focus:outline-none focus:border-cyber-blue/50 transition-all"
            ></textarea>
          </div>
          <button className="px-8 py-3 bg-cyber-blue text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-cyber-blue/80 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
