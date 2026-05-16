"use client";

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === '/auth' || pathname === '/auth.html';

  if (!mounted) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-[#050505] text-white`}>
          {children}
        </body>
      </html>
    );
  }

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-[#050505] text-white`}>
          <main className="min-h-screen flex items-center justify-center p-4">
            {children}
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white overflow-x-hidden`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="pt-24 min-h-screen transition-all duration-300 lg:pl-64">
          <div className="container mx-auto px-4 pb-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
