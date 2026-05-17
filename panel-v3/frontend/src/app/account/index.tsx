import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Shield, Lock, Save, ArrowLeft, Key } from 'lucide-react';

export default function AccountIndex() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFormData(prev => ({
          ...prev,
          displayName: data.display_name,
          username: data.username
        }));
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: formData.displayName,
        username: formData.username
      })
    });
    if (res.ok) setMessage('Profile updated successfully');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
       setMessage('Passwords do not match');
       return;
    }
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: formData.password
      })
    });
    if (res.ok) {
       setMessage('Security settings updated');
       setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">My Account</h1>
          <p className="text-white/40">Manage your personal identity and security credentials</p>
        </div>
      </div>

      {message && (
        <div className="glass-dark p-4 rounded-2xl border border-neon-blue/20 text-neon-blue text-sm font-bold animate-in fade-in slide-in-from-top-2">
           {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <UserIcon className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Profile Settings</h2>
              <p className="text-xs text-white/30 uppercase tracking-widest font-black">Personal Identity</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Display Name</label>
              <input
                type="text"
                className="w-full neon-input py-3 px-4"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Username</label>
              <input
                type="text"
                className="w-full neon-input py-3 px-4"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full neon-button py-3.5 font-bold flex items-center justify-center gap-2">
               <Save className="w-4 h-4" />
               Update Profile
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="glass-dark p-8 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
              <Shield className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Account Security</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Credential Management</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">New Password</label>
              <input
                type="password"
                className="w-full neon-input py-3 px-4"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full neon-input py-3 px-4"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 transition-all">
               <Key className="w-4 h-4" />
               Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Role Info Card */}
      <div className="glass-dark p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock className="w-32 h-32" />
         </div>
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
               <Fingerprint className="w-8 h-8 text-white/20" />
            </div>
            <div>
               <h3 className="text-lg font-bold uppercase tracking-tight">Assigned Rank</h3>
               <p className="text-white/40 text-sm">Your account holds specific administrative permissions</p>
            </div>
         </div>
         <div className="px-8 py-3 bg-neon-blue/10 border border-neon-blue/20 rounded-2xl">
            <span className="text-neon-blue font-black uppercase tracking-widest text-sm">
               {user?.role_name || 'Loading...'}
            </span>
         </div>
      </div>
    </div>
  );
}

// Minimal Fingerprint icon as it's used above but not imported (it's in lucide-react)
import { Fingerprint } from 'lucide-react';
