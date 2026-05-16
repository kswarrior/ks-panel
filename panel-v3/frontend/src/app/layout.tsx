"use client";

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';

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

  const [activeTheme, setActiveTheme] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();

  const isAuthPage = pathname === '/auth' || pathname === '/auth.html';

  useEffect(() => {
    if (mounted) {
      if (!isAuthPage) {
        fetch('/api/me')
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(data => {
            setUser(data);

            // Handle permission checks for current page
            const pathPerms: Record<string, string> = {
              '/nodes': 'view_nodes',
              '/templates': 'view_templates',
              '/users': 'view_users',
              '/roles': 'view_roles',
              '/themes': 'view_themes',
              '/settings': 'manage_settings',
            };

            const requiredPerm = pathPerms[pathname || ''];
            if (requiredPerm && data.permissions !== '*') {
              const userPerms = data.permissions.split(',');
              if (!userPerms.includes(requiredPerm)) {
                router.replace('/unauthorized');
              }
            }
          })
          .catch(() => router.replace('/auth'));
      }

      fetch('/api/themes')
        .then(res => res.json())
        .then(data => {
          const active = data.find((t: any) => t.is_active);
          if (active) {
            try {
              const config = JSON.parse(active.config);
              setActiveTheme(config);
            } catch (e) {}
          }
        });

      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(() => {});
    }
  }, [mounted, pathname]);

  if (!mounted) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-[#050505] text-white`}>
          {children}
        </body>
      </html>
    );
  }

  const themeStyles = activeTheme ? {
    '--background': activeTheme.backgroundColor || '#050505',
    '--neon-blue': activeTheme.primaryColor || '#0ea5e9',
    '--header-height': `${activeTheme.headerHeight || 64}px`,
    '--sidebar-width': `${activeTheme.sidebarWidth || 256}px`,
  } as React.CSSProperties : {};

  const isUnauthorizedPage = pathname === '/unauthorized';

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} text-white`} style={{ ...themeStyles, backgroundColor: 'var(--background)' }}>
          {activeTheme?.backgroundImage && (
            <div
              className="fixed inset-0 z-[-1] opacity-30 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${activeTheme.backgroundImage})` }}
            />
          )}
          <main className="min-h-screen-dvh flex items-center justify-center p-4">
            {children}
          </main>
        </body>
      </html>
    );
  }

  if (!user && !isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-[#050505] text-white`}>
          <div className="min-h-screen-dvh flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} text-white overflow-x-hidden`} style={{ ...themeStyles, backgroundColor: 'var(--background)' }}>
        {activeTheme?.backgroundImage && (
          <div
            className="fixed inset-0 z-[-1] opacity-20 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: `url(${activeTheme.backgroundImage})` }}
          />
        )}
        <Header user={user} settings={settings} onMenuClick={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="pt-[calc(var(--header-height)+2rem)] min-h-screen-dvh transition-all duration-300 lg:pl-[var(--sidebar-width)]">
          <div className="container mx-auto px-4 pb-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
