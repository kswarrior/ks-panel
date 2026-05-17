import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (res.ok) navigate('/instances');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="glass-dark p-12 rounded-3xl border border-white/5 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">KS PANEL</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="admin or admin@kspanel.com"
            className="w-full neon-input py-4 px-6"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          />
          <input
            type="password"
            placeholder="••••••••"
            className="w-full neon-input py-4 px-6"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full neon-button py-4 font-bold text-lg">Sign In</button>
        </form>
      </div>
    </div>
  );
}
