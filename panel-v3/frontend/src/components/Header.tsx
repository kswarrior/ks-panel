import React from 'react';
export default function Header({ user, settings, onMenuClick }: any) {
  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height,64px)] glass-dark border-b border-white/5 z-[80] flex items-center px-6">
       <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/5 rounded-md mr-4">Menu</button>
       <div className="text-xl font-bold tracking-tight">KS PANEL</div>
       <div className="ml-auto flex items-center gap-4 text-sm text-white/50">{user?.username}</div>
    </header>
  );
}
