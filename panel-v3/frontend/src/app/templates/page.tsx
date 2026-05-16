"use client";

import React, { useState, useEffect } from 'react';
import { Box, Code, Cpu, Database, Layout, Search, Plus, X, Layers, Save, Settings as SettingsIcon } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface Template {
  id: number;
  name: string;
  description: string;
  image: string;
  config?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    category: 'Games',
    type: 'Docker',
    instance_type: 'docker',
    limits: { memory: 1024, cpu: 100, disk: 5120 },
    ports: [] as any[],
    mounts: [] as any[],
    variables: [] as any[],
    steps: [] as any[]
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-white/50">Browse and deploy pre-configured environments</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-blue transition-colors" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-neon-blue/50 focus:shadow-neon transition-all"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="neon-button flex items-center gap-2 font-bold"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)
        ) : templates.length === 0 ? (
          <div className="col-span-full glass-dark p-12 rounded-2xl text-center border border-white/5">
            <Box className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No templates found</h3>
            <p className="text-white/40">Start by creating your first environment template.</p>
          </div>
        ) : (
          templates.map((tpl) => (
            <div key={tpl.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-neon-blue/30 transition-all duration-300 group cursor-pointer">
              <div className="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20 mb-4 group-hover:shadow-neon transition-all">
                <Box className="w-6 h-6 text-neon-blue" />
              </div>
              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg group-hover:text-neon-blue transition-colors">{tpl.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tpl.image}</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed line-clamp-3">
                {tpl.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <button className="text-xs font-bold text-neon-blue hover:underline">View details</button>
                <button className="neon-button text-[10px] py-1 px-3 uppercase tracking-tighter">Deploy</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="glass-dark w-full max-w-5xl rounded-3xl p-0 relative z-10 flex flex-col h-full max-h-[90vh] overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-blue/20 rounded-xl flex items-center justify-center border border-neon-blue/30">
                  <Layers className="w-5 h-5 text-neon-blue" />
                </div>
                <h2 className="text-2xl font-bold">Create Power Template</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <div className="flex lg:flex-col lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 p-2 lg:p-4 space-x-2 lg:space-x-0 lg:space-y-2 bg-black/20 overflow-x-auto no-scrollbar">
                {[
                  { id: 'general', name: 'General', icon: Box },
                  { id: 'infra', name: 'Infrastructure', icon: Cpu },
                  { id: 'vars', name: 'Variables', icon: Code },
                  { id: 'workflow', name: 'Workflow', icon: Layers },
                  { id: 'ui', name: 'Advanced UI', icon: Layout },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                      activeTab === tab.id ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-neon' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-black/40">
                <div className="max-w-2xl mx-auto space-y-6">
                  {activeTab === 'general' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase ml-1">Template Name</label>
                          <input type="text" className="w-full neon-input" placeholder="Minecraft Vanilla" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase ml-1">Infrastructure Type</label>
                          <select
                            className="w-full neon-input bg-black/40"
                            value={form.instance_type}
                            onChange={e => setForm({...form, instance_type: e.target.value})}
                          >
                            <option value="docker">Docker (Containers)</option>
                            <option value="multipass">Multipass (Ubuntu VMs)</option>
                            <option value="kvm">KVM (General VMs)</option>
                            <option value="lxd">LXD (System Containers)</option>
                            <option value="proxmox">Proxmox (LXC/VM)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/40 uppercase ml-1">Default Image / ISO</label>
                        <input type="text" className="w-full neon-input font-mono" placeholder="ghcr.io/parkervcp/yolks:debian" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/40 uppercase ml-1">Description</label>
                        <textarea className="w-full neon-input h-32 resize-none" placeholder="Environment description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                      </div>
                    </div>
                  )}
                  {activeTab === 'infra' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase ml-1">Memory (MB)</label>
                          <input type="number" className="w-full neon-input" value={form.limits.memory} onChange={e => setForm({...form, limits: {...form.limits, memory: parseInt(e.target.value)}})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase ml-1">CPU Limit (%)</label>
                          <input type="number" className="w-full neon-input" value={form.limits.cpu} onChange={e => setForm({...form, limits: {...form.limits, cpu: parseInt(e.target.value)}})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/40 uppercase ml-1">Disk Space (MB)</label>
                          <input type="number" className="w-full neon-input" value={form.limits.disk} onChange={e => setForm({...form, limits: {...form.limits, disk: parseInt(e.target.value)}})} />
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Network Mapping</h4>
                          <button
                            onClick={() => setForm({...form, ports: [...form.ports, {host: '', guest: '', protocol: 'tcp'}]})}
                            className="text-[10px] font-bold text-neon-blue uppercase border border-neon-blue/20 px-2 py-1 rounded-lg hover:bg-neon-blue/10"
                          >+ Add Rule</button>
                        </div>
                        <div className="space-y-2">
                          {form.ports.map((p, i) => (
                            <div key={i} className="flex gap-4 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                              <input type="number" className="flex-1 neon-input text-xs py-1" placeholder="Host Port" value={p.host} onChange={e => {
                                const newPorts = [...form.ports];
                                newPorts[i].host = e.target.value;
                                setForm({...form, ports: newPorts});
                              }} />
                              <span className="text-white/20">:</span>
                              <input type="number" className="flex-1 neon-input text-xs py-1" placeholder="Guest Port" value={p.guest} onChange={e => {
                                const newPorts = [...form.ports];
                                newPorts[i].guest = e.target.value;
                                setForm({...form, ports: newPorts});
                              }} />
                              <select className="w-20 neon-input text-xs py-1 bg-black/40" value={p.protocol} onChange={e => {
                                const newPorts = [...form.ports];
                                newPorts[i].protocol = e.target.value;
                                setForm({...form, ports: newPorts});
                              }}>
                                <option value="tcp">TCP</option>
                                <option value="udp">UDP</option>
                              </select>
                              <X className="w-4 h-4 text-white/20 cursor-pointer" onClick={() => {
                                const newPorts = [...form.ports];
                                newPorts.splice(i, 1);
                                setForm({...form, ports: newPorts});
                              }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Volumes / Mounts</h4>
                          <button
                            onClick={() => setForm({...form, mounts: [...form.mounts, {source: '', target: '', mode: 'rw'}]})}
                            className="text-[10px] font-bold text-neon-blue uppercase border border-neon-blue/20 px-2 py-1 rounded-lg hover:bg-neon-blue/10"
                          >+ Add Mount</button>
                        </div>
                        <div className="space-y-2">
                          {form.mounts.map((m, i) => (
                            <div key={i} className="flex gap-4 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                              <input type="text" className="flex-1 neon-input text-xs py-1" placeholder="/path/on/host" value={m.source} onChange={e => {
                                const newMounts = [...form.mounts];
                                newMounts[i].source = e.target.value;
                                setForm({...form, mounts: newMounts});
                              }} />
                              <span className="text-white/20">→</span>
                              <input type="text" className="flex-1 neon-input text-xs py-1" placeholder="/path/in/container" value={m.target} onChange={e => {
                                const newMounts = [...form.mounts];
                                newMounts[i].target = e.target.value;
                                setForm({...form, mounts: newMounts});
                              }} />
                              <select className="w-20 neon-input text-xs py-1 bg-black/40" value={m.mode} onChange={e => {
                                const newMounts = [...form.mounts];
                                newMounts[i].mode = e.target.value;
                                setForm({...form, mounts: newMounts});
                              }}>
                                <option value="rw">R/W</option>
                                <option value="ro">R/O</option>
                              </select>
                              <X className="w-4 h-4 text-white/20 cursor-pointer" onClick={() => {
                                const newMounts = [...form.mounts];
                                newMounts.splice(i, 1);
                                setForm({...form, mounts: newMounts});
                              }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'workflow' && (
                    <div className="space-y-6">
                      <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white/70 uppercase tracking-widest">Installation Workflow</h4>
                          <button
                            onClick={() => setForm({...form, steps: [...form.steps, {type: 'Download', target: '', source: ''}]})}
                            className="text-[10px] font-bold text-neon-blue uppercase border border-neon-blue/20 px-2 py-1 rounded-lg hover:bg-neon-blue/10"
                          >+ Add Step</button>
                        </div>
                        <div className="space-y-3">
                          {form.steps.map((step, i) => (
                            <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group hover:border-neon-blue/30 transition-all">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/40">{i+1}</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                                  <select className="neon-input text-xs py-1 bg-black/40" value={step.type} onChange={e => {
                                    const newSteps = [...form.steps];
                                    newSteps[i].type = e.target.value;
                                    setForm({...form, steps: newSteps});
                                  }}>
                                    <option>Download</option>
                                    <option>Extract</option>
                                    <option>Command</option>
                                    <option>Write</option>
                                  </select>
                                  <input type="text" className="neon-input text-xs py-1" placeholder="Target/Filename" value={step.target} onChange={e => {
                                    const newSteps = [...form.steps];
                                    newSteps[i].target = e.target.value;
                                    setForm({...form, steps: newSteps});
                                  }} />
                                  <input type="text" className="neon-input text-xs py-1 md:col-span-1" placeholder="Source/URL/Command" value={step.source} onChange={e => {
                                    const newSteps = [...form.steps];
                                    newSteps[i].source = e.target.value;
                                    setForm({...form, steps: newSteps});
                                  }} />
                                </div>
                              </div>
                              <X className="w-4 h-4 text-white/10 group-hover:text-red-400 cursor-pointer transition-colors ml-4" onClick={() => {
                                const newSteps = [...form.steps];
                                newSteps.splice(i, 1);
                                setForm({...form, steps: newSteps});
                              }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'vars' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white/70 uppercase tracking-widest">Environment Variables</h4>
                        <button
                          onClick={() => setForm({...form, variables: [...form.variables, {name: '', label: '', default: '', viewable: true, editable: true}]})}
                          className="text-[10px] font-bold text-neon-blue uppercase border border-neon-blue/20 px-2 py-1 rounded-lg hover:bg-neon-blue/10"
                        >+ Add Variable</button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {form.variables.map((v, i) => (
                          <div key={i} className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4 relative">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Variable Name</label>
                                <input type="text" className="w-full neon-input text-sm" placeholder="SERVER_PORT" value={v.name} onChange={e => {
                                  const newVars = [...form.variables];
                                  newVars[i].name = e.target.value;
                                  setForm({...form, variables: newVars});
                                }} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Display Name</label>
                                <input type="text" className="w-full neon-input text-sm" placeholder="Server Port" value={v.label} onChange={e => {
                                  const newVars = [...form.variables];
                                  newVars[i].label = e.target.value;
                                  setForm({...form, variables: newVars});
                                }} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-white/30 uppercase ml-1">Default Value</label>
                              <input type="text" className="w-full neon-input text-sm" value={v.default} onChange={e => {
                                const newVars = [...form.variables];
                                newVars[i].default = e.target.value;
                                setForm({...form, variables: newVars});
                              }} />
                            </div>
                            <div className="flex gap-6 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 accent-neon-blue" checked={v.viewable} onChange={e => {
                                  const newVars = [...form.variables];
                                  newVars[i].viewable = e.target.checked;
                                  setForm({...form, variables: newVars});
                                }} />
                                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">User Viewable</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 accent-neon-blue" checked={v.editable} onChange={e => {
                                  const newVars = [...form.variables];
                                  newVars[i].editable = e.target.checked;
                                  setForm({...form, variables: newVars});
                                }} />
                                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">User Editable</span>
                              </label>
                            </div>
                            <button className="absolute top-4 right-4 text-white/10 hover:text-red-400 transition-colors" onClick={() => {
                              const newVars = [...form.variables];
                              newVars.splice(i, 1);
                              setForm({...form, variables: newVars});
                            }}>
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ui' && (
                    <div className="space-y-6">
                      <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white/70 uppercase tracking-widest">Available Features</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {['Console', 'File Manager', 'Databases', 'Backups', 'Network', 'Schedules', 'Users', 'Settings', 'Startup'].map(f => (
                            <label key={f} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-blue/20 cursor-pointer transition-all group">
                              <input type="checkbox" className="w-4 h-4 accent-neon-blue" defaultChecked />
                              <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{f}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white/70 uppercase tracking-widest">Custom Pages</h4>
                          <button className="text-[10px] font-bold text-neon-blue uppercase border border-neon-blue/20 px-3 py-1 rounded-lg hover:bg-neon-blue/10">+ Add Page</button>
                        </div>
                        <p className="text-xs text-white/30 italic text-center py-8 border-2 border-dashed border-white/5 rounded-xl">No custom pages defined for this template.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-black/40">
              <button onClick={() => setShowCreate(false)} className="px-8 py-2 glass hover:bg-white/10 rounded-xl font-bold">Cancel</button>
              <button
                onClick={async () => {
                  const payload = {
                    ...form,
                    config: JSON.stringify({
                      instance_type: form.instance_type,
                      limits: form.limits,
                      ports: form.ports,
                      mounts: form.mounts,
                      variables: form.variables,
                      steps: form.steps
                    })
                  };
                  const res = await fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (res.ok) {
                    setShowCreate(false);
                    fetchTemplates();
                  }
                }}
                className="neon-button flex items-center gap-2 px-10"
              >
                <Save className="w-4 h-4" /> Publish Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
