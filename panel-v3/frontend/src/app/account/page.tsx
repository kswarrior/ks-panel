"use client";

import React, { useState } from 'react';
import { User, Mail, Lock, Save, Camera } from 'lucide-react';

export default function AccountPage() {
  const [profile, setProfile] = useState({
    displayName: 'Admin User',
    username: 'admin',
    email: 'admin@kspanel.com', // Not editable
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-white/50">Manage your profile and security credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-dark p-8 rounded-2xl border border-white/5 text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <div className="w-full h-full rounded-full bg-neon-blue/10 border-2 border-neon-blue/20 flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-neon-blue" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-neon-blue rounded-full shadow-neon text-black hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.displayName}</h2>
              <p className="text-sm text-white/40">@{profile.username}</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-neon-blue uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-neon-blue" /> Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Display Name</label>
                <input
                  type="text"
                  className="w-full neon-input"
                  value={profile.displayName}
                  onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Username</label>
                <input
                  type="text"
                  className="w-full neon-input"
                  value={profile.username}
                  onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1 opacity-60">
              <label className="text-xs font-bold text-white/40 uppercase ml-1">Email Address (Locked)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  className="w-full neon-input pl-10 cursor-not-allowed"
                  value={profile.email}
                  readOnly
                />
              </div>
            </div>

            <div className="pt-4">
              <button className="neon-button flex items-center gap-2 px-6">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-neon-blue" /> Change Password
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Current Password</label>
                <input
                  type="password"
                  className="w-full neon-input"
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">New Password</label>
                  <input
                    type="password"
                    className="w-full neon-input"
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full neon-input"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="neon-button flex items-center gap-2 px-6">
                <Save className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
