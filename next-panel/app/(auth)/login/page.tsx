'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-10 rounded-2xl border border-zinc-800 shadow-2xl">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-white tracking-tight">KS Panel</h2>
          <p className="mt-2 text-center text-sm text-zinc-500 font-medium uppercase tracking-widest">Secure Access</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm font-bold text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Username or Email</label>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 placeholder-zinc-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 mt-1 bg-zinc-800 border border-zinc-700 placeholder-zinc-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
