"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Terminal, Shield, ShieldAlert, Cpu, Activity, Play, Square, RefreshCw, X, Search, Lock, Bug, Scan, ChevronRight, Folder, File, Trash2, ArrowUp, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Skeleton from '@/components/Skeleton';

function InstanceControlContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('console');
  const [status, setStatus] = useState('Running');
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    if (activeTab === 'security') {
      const interval = setInterval(() => {
        setRadarAngle(prev => (prev + 2) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="glass-dark p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20">
            <Cpu className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Main Web Server</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="text-xs text-white/40 uppercase font-black tracking-widest">{status}</span>
              <span className="text-[10px] text-white/20 font-mono ml-2">ID: {id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none px-6 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Play className="w-4 h-4 fill-current" /> Start
          </button>
          <button className="flex-1 md:flex-none px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Square className="w-4 h-4 fill-current" /> Stop
          </button>
          <button className="flex-1 md:flex-none px-6 py-2 glass hover:bg-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'console', name: 'Terminal Console', icon: Terminal },
            { id: 'security', name: 'Security & DDoS', icon: Shield },
            { id: 'files', name: 'File Manager', icon: Activity },
            { id: 'backup', name: 'Backup Vault', icon: Lock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-neon' : 'glass-dark border-white/5 text-white/40 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 min-h-[60vh]">
          {activeTab === 'console' && <TerminalPanel />}
          {activeTab === 'security' && <SecurityPanel angle={radarAngle} />}
          {activeTab === 'files' && <FileManagerPanel />}
        </div>
      </div>
    </div>
  );
}

export default function InstanceControlPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      </div>
    }>
      <InstanceControlContent />
    </Suspense>
  );
}

function TerminalPanel() {
  const [history, setMessages] = useState<string[]>(['[SYSTEM] Establishing connection...', '[SYSTEM] Connection secure. Welcome to kspanel terminal.']);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}/api/terminal`);

    ws.current.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws.current) return;
    setMessages(prev => [...prev, `> ${input}`]);
    ws.current.send(input);
    setInput('');
  };

  return (
    <div className="glass-dark rounded-3xl border border-white/10 h-full flex flex-col overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-500/20" />
        </div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Instance-Console-v3</span>
      </div>
      <div ref={scrollRef} className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-1 custom-scrollbar bg-black/40">
        {history.map((msg, i) => (
          <div key={i} className={msg.startsWith('>') ? 'text-neon-blue' : 'text-white/80'}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-black/60 border-t border-white/5 flex gap-4">
        <div className="flex items-center text-neon-blue font-bold px-2">$</div>
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
}

function SecurityPanel({ angle }: { angle: number }) {
  const [scanning, setScanning] = useState(false);
  const [threats, setThreats] = useState<any[]>([]);

  const runScan = async () => {
    setScanning(true);
    setThreats([]);
    try {
      const res = await fetch('/api/instances/scan', { method: 'POST' });
      const data = await res.json();
      setThreats(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Scanner */}
        <div className="glass-dark p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--neon-blue)_0%,_transparent_70%)]" />
          </div>

          <div className="relative w-48 h-48 rounded-full border-2 border-neon-blue/20 flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.1)]">
            <div className="absolute inset-0 rounded-full border border-neon-blue/10 scale-75" />
            <div className="absolute inset-0 rounded-full border border-neon-blue/10 scale-50" />
            <div className="absolute inset-0 rounded-full border border-neon-blue/10 scale-125" />

            {/* Radar Line */}
            <div
              className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-transparent to-neon-blue origin-left"
              style={{ transform: `rotate(${angle-90}deg)` }}
            />
            {/* Radar Sweep Effect */}
            <div
              className="absolute top-1/2 left-1/2 w-[50%] h-[40%] bg-neon-blue/10 origin-top-left rounded-[0_100%_0_0]"
              style={{ transform: `rotate(${angle-90}deg)`, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
            />

            <Shield className={`w-12 h-12 ${scanning ? 'text-neon-blue animate-pulse' : 'text-white/20'}`} />
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-bold">DDoS Protection</h3>
            <p className="text-xs text-white/40 max-w-[200px]">Real-time traffic analysis and heuristic threat detection.</p>
          </div>

          <button
            onClick={runScan}
            disabled={scanning}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              scanning ? 'bg-white/5 text-white/20' : 'neon-button'
            }`}
          >
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Initialize Deep Scan'}
          </button>
        </div>

        {/* Threat Log */}
        <div className="glass-dark rounded-3xl border border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" /> Security Intelligence
            </h3>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {threats.length === 0 && !scanning && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <ShieldCheckIcon className="w-12 h-12 mb-2" />
                <p className="text-sm font-bold">System Secure</p>
                <p className="text-[10px]">No active threats detected</p>
              </div>
            )}
            {scanning && (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {threats.map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2 group hover:bg-red-500/10 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-red-400">{t.level} Threat</span>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-[10px] text-white/40 leading-relaxed">{t.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Port Scanner', desc: 'Verify external attack surface', icon: Search },
          { name: 'Traffic Graph', desc: 'Identify spike patterns', icon: Activity },
          { name: 'Firewall', desc: 'Dynamic rule management', icon: Lock },
        ].map(tool => (
          <div key={tool.name} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:neon-border transition-all">
                <tool.icon className="w-5 h-5 text-white/40 group-hover:text-neon-blue" />
              </div>
              <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-neon-blue" />
            </div>
            <h4 className="font-bold text-sm">{tool.name}</h4>
            <p className="text-[10px] text-white/30">{tool.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileManagerPanel() {
  const [files, setFiles] = useState<any[]>([]);
  const [path, setPath] = useState('.');
  const [loading, setLoading] = useState(true);

  const fetchFiles = async (currentPath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/instances/files?path=${encodeURIComponent(currentPath)}`);
      const data = await res.json();
      setFiles(data || []);
      setPath(currentPath);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles('.');
  }, []);

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;
    try {
      const fullPath = path === '.' ? fileName : `${path}/${fileName}`;
      await fetch(`/api/instances/files?path=${encodeURIComponent(fullPath)}`, { method: 'DELETE' });
      fetchFiles(path);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-dark rounded-3xl border border-white/5 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-mono text-white/40">
          <Folder className="w-4 h-4" />
          <span>{path}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchFiles(path.includes('/') ? path.substring(0, path.lastIndexOf('/')) || '.' : '.')} className="p-2 glass hover:bg-white/10 rounded-lg">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 neon-button text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Download className="w-3 h-3" /> Upload
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {files.map((file, i) => (
              <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => file.isDir && fetchFiles(path === '.' ? file.name : `${path}/${file.name}`)}
                >
                  <div className={`p-2 rounded-lg ${file.isDir ? 'bg-yellow-500/10 text-yellow-500' : 'bg-neon-blue/10 text-neon-blue'}`}>
                    {file.isDir ? <Folder className="w-5 h-5" /> : <File className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{file.isDir ? 'Directory' : `${(file.size / 1024).toFixed(1)} KB`} • {file.time}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(file.name)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="p-12 text-center text-white/20 italic">Empty directory</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
