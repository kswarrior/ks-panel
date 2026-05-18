import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2,
  Settings, Box, Layers, Cpu,
  HardDrive, Database, Globe,
  Terminal, Download, FileText,
  Layout, Fingerprint, Activity,
  ChevronRight, Upload, Download as DownloadIcon
} from 'lucide-react';

export default function TemplatesCreate() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState<any>({
    meta: { id: '', name: '', category: 'Game Servers', type: 'Container' },
    environment: {
      instance_type: 'docker',
      image: 'ghcr.io/parkervcp/yolks:debian',
      distribution: '22.04',
      limits: { memory: 1024, cpu: 100, disk: 5120, swap: 0 },
      feature_limits: { databases: 0, backups: 0, allocations: 1 },
      ports: [{ host: 25565, guest: 25565, protocol: 'tcp' }],
      mounts: []
    },
    variables: [],
    install_steps: [
      { type: 'shell', command: 'apt update && apt install -y curl' }
    ],
    pages: [],
    features: {
      console: true,
      files: true,
      users: false,
      network: true,
      db: false,
      settings: true
    }
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) navigate('/templates');
    } catch (err) {
      console.error(err);
    }
  };

  const updateMeta = (field: string, value: any) => {
    setFormData({ ...formData, meta: { ...formData.meta, [field]: value } });
  };

  const updateEnv = (field: string, value: any) => {
    setFormData({ ...formData, environment: { ...formData.environment, [field]: value } });
  };

  const updateLimits = (field: string, value: any) => {
    setFormData({
      ...formData,
      environment: {
        ...formData.environment,
        limits: { ...formData.environment.limits, [field]: parseInt(value) || 0 }
      }
    });
  };

  const addPort = () => {
    updateEnv('ports', [...formData.environment.ports, { host: 0, guest: 0, protocol: 'tcp' }]);
  };

  const removePort = (index: number) => {
    updateEnv('ports', formData.environment.ports.filter((_: any, i: number) => i !== index));
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, {
        id: 'NEW_VAR',
        name: 'New Variable',
        description: '',
        default_value: '',
        user_viewable: true,
        user_editable: true,
        required: true
      }]
    });
  };

  const addInstallStep = (type: string) => {
    setFormData({
      ...formData,
      install_steps: [...formData.install_steps, { type, command: '', url: '', output: '', path: '', content: '' }]
    });
  };

  const sections = [
    { id: 'general', name: 'Identity', icon: Fingerprint },
    { id: 'infra', name: 'Infrastructure', icon: Cpu },
    { id: 'variables', name: 'Variables', icon: Layers },
    { id: 'install', name: 'Workflow', icon: Activity },
    { id: 'ui', name: 'Interface', icon: Layout },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link
            to="/templates"
            className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 hover:text-neon-blue transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Templates
          </Link>
          <h1 className="text-4xl font-black tracking-tighter">Create Power Template</h1>
        </div>

        <div className="flex items-center gap-3">
           <button
             onClick={() => handleSubmit()}
             className="neon-button px-8 py-3.5 font-bold flex items-center gap-3"
           >
             <Save className="w-5 h-5" />
             Publish Template
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-64 shrink-0 space-y-1">
           {sections.map(s => (
             <button
               key={s.id}
               onClick={() => setActiveSection(s.id)}
               className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all border ${
                 activeSection === s.id
                 ? 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue font-bold'
                 : 'text-white/40 border-transparent hover:bg-white/5'
               }`}
             >
               <div className="flex items-center gap-4">
                 <s.icon className="w-5 h-5" />
                 <span className="text-sm">{s.name}</span>
               </div>
               <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === s.id ? 'rotate-90' : ''}`} />
             </button>
           ))}

           <div className="mt-8 p-6 glass-dark rounded-3xl border border-white/5 space-y-4">
              <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Quick Actions</p>
              <button className="w-full flex items-center gap-3 text-xs text-white/40 hover:text-white transition-all">
                 <Upload className="w-4 h-4" /> Import JSON
              </button>
              <button className="w-full flex items-center gap-3 text-xs text-white/40 hover:text-white transition-all">
                 <DownloadIcon className="w-4 h-4" /> Export Draft
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-dark rounded-[2.5rem] border border-white/5 p-8 lg:p-12 min-h-[600px]">
           {activeSection === 'general' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Unique Template ID</label>
                      <input
                        type="text"
                        className="w-full neon-input py-4 px-6 font-mono text-sm"
                        placeholder="minecraft-java-paper"
                        value={formData.meta.id}
                        onChange={e => updateMeta('id', e.target.value)}
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Display Name</label>
                      <input
                        type="text"
                        className="w-full neon-input py-4 px-6"
                        placeholder="Minecraft (Paper)"
                        value={formData.meta.name}
                        onChange={e => updateMeta('name', e.target.value)}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Category</label>
                      <select
                        className="w-full neon-input py-4 px-6"
                        value={formData.meta.category}
                        onChange={e => updateMeta('category', e.target.value)}
                      >
                         <option>Game Servers</option>
                         <option>Web Apps</option>
                         <option>Databases</option>
                         <option>Utilities</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Template Engine</label>
                      <select
                        className="w-full neon-input py-4 px-6"
                        value={formData.meta.type}
                        onChange={e => updateMeta('type', e.target.value)}
                      >
                         <option>Container</option>
                         <option>Virtual Machine</option>
                         <option>Native Script</option>
                      </select>
                   </div>
                </div>
             </div>
           )}

           {activeSection === 'infra' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Box className="w-5 h-5 text-neon-blue" />
                      <h3 className="font-bold text-lg">Runtime Environment</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">Architecture</label>
                        <select className="w-full neon-input py-3 px-4" value={formData.environment.instance_type} onChange={e => updateEnv('instance_type', e.target.value)}>
                           <option value="docker">Docker</option>
                           <option value="kvm">KVM (Proxmox)</option>
                           <option value="lxd">LXD</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">Base Image / ISO</label>
                        <input className="w-full neon-input py-3 px-4 font-mono text-sm" value={formData.environment.image} onChange={e => updateEnv('image', e.target.value)} />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Cpu className="w-5 h-5 text-neon-blue" />
                      <h3 className="font-bold text-lg">Resource Baseline</h3>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">Memory (MB)</label>
                        <input type="number" className="w-full neon-input py-3 px-4" value={formData.environment.limits.memory} onChange={e => updateLimits('memory', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">CPU (%)</label>
                        <input type="number" className="w-full neon-input py-3 px-4" value={formData.environment.limits.cpu} onChange={e => updateLimits('cpu', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">Disk (MB)</label>
                        <input type="number" className="w-full neon-input py-3 px-4" value={formData.environment.limits.disk} onChange={e => updateLimits('disk', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30">Swap (MB)</label>
                        <input type="number" className="w-full neon-input py-3 px-4" value={formData.environment.limits.swap} onChange={e => updateLimits('swap', e.target.value)} />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Globe className="w-5 h-5 text-neon-blue" />
                         <h3 className="font-bold text-lg">Network Map</h3>
                      </div>
                      <button onClick={addPort} className="text-[10px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-all">+ Add Rule</button>
                   </div>
                   <div className="space-y-3">
                      {formData.environment.ports.map((p: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-center animate-in zoom-in-95 duration-200">
                           <input type="number" className="flex-1 neon-input py-3 px-4" placeholder="Host" value={p.host} onChange={e => {
                              const newPorts = [...formData.environment.ports];
                              newPorts[idx].host = parseInt(e.target.value);
                              updateEnv('ports', newPorts);
                           }} />
                           <div className="text-white/20">:</div>
                           <input type="number" className="flex-1 neon-input py-3 px-4" placeholder="Guest" value={p.guest} onChange={e => {
                              const newPorts = [...formData.environment.ports];
                              newPorts[idx].guest = parseInt(e.target.value);
                              updateEnv('ports', newPorts);
                           }} />
                           <select className="w-32 neon-input py-3 px-4" value={p.protocol} onChange={e => {
                              const newPorts = [...formData.environment.ports];
                              newPorts[idx].protocol = e.target.value;
                              updateEnv('ports', newPorts);
                           }}>
                              <option>tcp</option>
                              <option>udp</option>
                           </select>
                           <button onClick={() => removePort(idx)} className="p-3 text-red-500/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {activeSection === 'variables' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Environment Variables</h3>
                    <p className="text-white/40 text-xs">Define dynamic variables users can configure during setup.</p>
                  </div>
                  <button onClick={addVariable} className="neon-button px-6 py-2 text-xs font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Variable
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   {formData.variables.map((v: any, idx: number) => (
                     <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/5 relative group">
                        <button onClick={() => {
                          const newVars = formData.variables.filter((_: any, i: number) => i !== idx);
                          setFormData({ ...formData, variables: newVars });
                        }} className="absolute top-6 right-6 text-white/20 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-white/30">Env Variable (ID)</label>
                              <input className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm" value={v.id} onChange={e => {
                                 const newVars = [...formData.variables];
                                 newVars[idx].id = e.target.value;
                                 setFormData({ ...formData, variables: newVars });
                              }} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-white/30">Display Label</label>
                              <input className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4" value={v.name} onChange={e => {
                                 const newVars = [...formData.variables];
                                 newVars[idx].name = e.target.value;
                                 setFormData({ ...formData, variables: newVars });
                              }} />
                           </div>
                        </div>

                        <div className="flex gap-6">
                           <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={v.required} onChange={e => {
                                 const newVars = [...formData.variables];
                                 newVars[idx].required = e.target.checked;
                                 setFormData({ ...formData, variables: newVars });
                              }} className="w-4 h-4 rounded border-white/10 bg-white/5 text-neon-blue focus:ring-neon-blue" />
                              <span className="text-xs text-white/40">Required</span>
                           </label>
                           <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={v.user_editable} onChange={e => {
                                 const newVars = [...formData.variables];
                                 newVars[idx].user_editable = e.target.checked;
                                 setFormData({ ...formData, variables: newVars });
                              }} className="w-4 h-4 rounded border-white/10 bg-white/5 text-neon-blue focus:ring-neon-blue" />
                              <span className="text-xs text-white/40">User Editable</span>
                           </label>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeSection === 'install' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-lg">Deployment Sequence</h3>
                   <div className="flex gap-2">
                      <button onClick={() => addInstallStep('shell')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Add Script</button>
                      <button onClick={() => addInstallStep('download')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Add Download</button>
                   </div>
                </div>

                <div className="space-y-6">
                   {formData.install_steps.map((s: any, idx: number) => (
                     <div key={idx} className="flex gap-6">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-10 h-10 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-black text-xs">
                              {idx + 1}
                           </div>
                           {idx < formData.install_steps.length - 1 && <div className="flex-1 w-px bg-white/10" />}
                        </div>
                        <div className="flex-1 glass-dark p-6 rounded-3xl border border-white/5 relative group">
                           <button onClick={() => {
                             const newSteps = formData.install_steps.filter((_: any, i: number) => i !== idx);
                             setFormData({ ...formData, install_steps: newSteps });
                           }} className="absolute top-6 right-6 text-white/20 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>

                           {s.type === 'shell' ? (
                             <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                   <Terminal className="w-3 h-3" /> Execute Script
                                </div>
                                <textarea
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-sm min-h-[100px]"
                                  placeholder="yum install -y nodejs..."
                                  value={s.command}
                                  onChange={e => {
                                     const newSteps = [...formData.install_steps];
                                     newSteps[idx].command = e.target.value;
                                     setFormData({ ...formData, install_steps: newSteps });
                                  }}
                                />
                             </div>
                           ) : (
                             <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                   <Download className="w-3 h-3" /> External Asset
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <input className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs" placeholder="https://..." value={s.url} onChange={e => {
                                      const newSteps = [...formData.install_steps];
                                      newSteps[idx].url = e.target.value;
                                      setFormData({ ...formData, install_steps: newSteps });
                                   }} />
                                   <input className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs" placeholder="output-file.zip" value={s.output} onChange={e => {
                                      const newSteps = [...formData.install_steps];
                                      newSteps[idx].output = e.target.value;
                                      setFormData({ ...formData, install_steps: newSteps });
                                   }} />
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeSection === 'ui' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                   {['console', 'files', 'network', 'db', 'users', 'settings'].map(f => (
                     <button
                       key={f}
                       onClick={() => {
                          setFormData({
                            ...formData,
                            features: { ...formData.features, [f]: !formData.features[f] }
                          });
                       }}
                       className={`p-6 rounded-3xl border transition-all text-left space-y-4 group ${
                         formData.features[f]
                         ? 'bg-neon-blue/10 border-neon-blue/20 text-white'
                         : 'bg-white/5 border-white/5 text-white/20'
                       }`}
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                          formData.features[f] ? 'bg-neon-blue/20 border-neon-blue/30 text-neon-blue' : 'bg-white/5 border-white/5 text-white/10'
                        }`}>
                           {f === 'console' && <Terminal className="w-5 h-5" />}
                           {f === 'files' && <FileText className="w-5 h-5" />}
                           {f === 'network' && <Globe className="w-5 h-5" />}
                           {f === 'db' && <Database className="w-5 h-5" />}
                           {f === 'users' && <Layers className="w-5 h-5" />}
                           {f === 'settings' && <Settings className="w-5 h-5" />}
                        </div>
                        <div>
                           <h4 className="font-bold text-sm uppercase tracking-tight">{f}</h4>
                           <p className="text-[10px] font-black tracking-widest opacity-40">{formData.features[f] ? 'ENABLED' : 'DISABLED'}</p>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
