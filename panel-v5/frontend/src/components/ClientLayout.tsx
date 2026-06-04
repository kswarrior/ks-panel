'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { TranslationProvider } from './TranslationProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/2fa';

  return (
    <TranslationProvider>
    <div className="relative flex h-screen w-full overflow-hidden bg-[#0a0a0c] text-white">
      {/* Global Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none animate-bg-slide"
        style={{
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(12px) brightness(0.55)',
          transform: 'scale(1.1)'
        }}
      />

      {/* Cyberpunk overlays */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />

      {!isAuthPage && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className={`relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-500 ${!isAuthPage ? 'lg:ml-[280px]' : ''}`}>
        {!isAuthPage && (
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-0">
          {children}
        </main>
      </div>
    </div>
    </TranslationProvider>
  );
}
