import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageSquare, User, Search, Menu,
  LogOut, Settings as SettingsIcon, Shield
} from 'lucide-react';
import { ExtensionSlot } from './ExtensionFramework';

export default function Header({ user, settings, onMenuClick }: any) {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height,64px)] glass-dark border-b border-white/5 z-[80] flex items-center px-6 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-white/60 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-blue rounded-lg shadow-neon flex items-center justify-center">
            <span className="text-black font-black text-lg">K</span>
          </div>
          <span className="text-xl font-black tracking-tighter hidden sm:block">
            {settings?.panel_name || 'KS PANEL'}
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-12 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-blue transition-all" />
          <input
            type="text"
            placeholder="Search instances, nodes, or users..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-neon-blue/40 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-neon" />
        </button>
        <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-white/5 mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-tight">{user?.display_name || user?.username}</p>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{user?.role_name || 'User'}</p>
            </div>
            <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 font-bold uppercase overflow-hidden">
               {user?.display_name?.substring(0,2) || user?.username?.substring(0,2)}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 glass-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-4 border-b border-white/5">
                  <p className="text-sm font-bold">{user?.display_name || user?.username}</p>
                  <p className="text-xs text-white/30 truncate">{user?.email}</p>
               </div>
               <div className="p-2 space-y-1">
                  <button
                    onClick={() => { navigate('/account'); setShowProfile(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:bg-white/5 rounded-lg transition-all text-left"
                  >
                     <Shield className="w-4 h-4 text-white/30" />
                     Account Security
                  </button>
                  <button
                    onClick={() => { navigate('/account'); setShowProfile(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:bg-white/5 rounded-lg transition-all text-left"
                  >
                     <SettingsIcon className="w-4 h-4 text-white/30" />
                     Profile Settings
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={() => {
                      fetch('/api/logout', { method: 'POST' }).then(() => window.location.href = '/auth');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                     <LogOut className="w-4 h-4" />
                     Logout Session
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
