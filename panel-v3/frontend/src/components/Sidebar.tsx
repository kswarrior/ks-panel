import React from 'react';
export default function Sidebar({ isOpen, onClose }: any) {
  return (
    <aside className={`fixed left-0 top-[var(--header-height,64px)] bottom-0 w-[var(--sidebar-width,256px)] glass-dark border-r border-white/5 z-[70] transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
       <nav className="p-6 space-y-4">
          <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Navigation</div>
          <div className="text-white/60 hover:text-white cursor-pointer transition-all">Overview</div>
       </nav>
    </aside>
  );
}
