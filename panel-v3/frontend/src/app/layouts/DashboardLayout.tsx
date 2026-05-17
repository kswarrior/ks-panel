import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ExtensionProvider } from '@/components/ExtensionFramework';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          if (location.pathname !== '/auth') navigate('/auth');
          return;
        }
        const data = await res.json();
        setUser(data);

        const sRes = await fetch('/api/settings');
        const sData = await sRes.json();
        setSettings(sData);
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate, location.pathname]);

  // Handle CSS variable themes (from previous implementation)
  useEffect(() => {
     fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        const active = data.find((t: any) => t.is_active);
        if (active) {
          try {
            const config = JSON.parse(active.config);
            document.documentElement.style.setProperty('--background', config.backgroundColor || '#050505');
            document.documentElement.style.setProperty('--neon-blue', config.primaryColor || '#0ea5e9');
          } catch (e) {}
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen-dvh flex items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ExtensionProvider>
      <div className="min-h-screen-dvh bg-[var(--background,#050505)] text-white overflow-x-hidden">
        <Header
          user={user}
          settings={settings}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Region - This is the only part that swaps during navigation */}
        <main className="pt-[calc(var(--header-height,64px)+2rem)] min-h-screen-dvh transition-all duration-300 lg:pl-[var(--sidebar-width,256px)]">
          <div className="container mx-auto px-4 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </ExtensionProvider>
  );
};
