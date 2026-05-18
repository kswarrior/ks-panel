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

  // Handle CSS variable themes (Comprehensive mapping)
  useEffect(() => {
     fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        const active = data.find((t: any) => t.is_active);
        if (active) {
          try {
            const config = JSON.parse(active.config);
            const mapping: Record<string, string> = {
              '--background': config.backgroundColor,
              '--neon-blue': config.primaryColor,
              '--surface': config.surfaceColor,
              '--text': config.textColor,
              '--accent': config.accentColor,
              '--glass-blur': config.glassBlur,
              '--glass-opacity': config.glassOpacity,
              '--radius': config.borderRadius,
              '--border-opacity': config.borderOpacity,
              '--header-height': config.headerHeight,
              '--sidebar-width': config.sidebarWidth,
              '--sidebar-pos': config.sidebarPosition === 'right' ? 'row-reverse' : 'row',
              '--font-size': config.fontSizeBase,
              '--font-family': config.fontFamily,
              '--bg-image': config.backgroundImage ? `url(${config.backgroundImage})` : 'none',
              '--bg-blur': config.backgroundBlur,
              '--bg-opacity': config.backgroundOpacity,
              '--bg-gradient': config.backgroundGradient,
              '--btn-glow': config.buttonGlow,
              '--btn-radius': config.buttonRadius
            };

            Object.entries(mapping).forEach(([key, value]) => {
              if (value) document.documentElement.style.setProperty(key, value);
            });

            // Handle custom CSS injection
            if (config.customCss) {
               const styleId = 'theme-custom-css';
               let styleTag = document.getElementById(styleId);
               if (!styleTag) {
                  styleTag = document.createElement('style');
                  styleTag.id = styleId;
                  document.head.appendChild(styleTag);
               }
               styleTag.innerHTML = config.customCss;
            }
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
      <div className="min-h-screen-dvh bg-[var(--background,#050505)] text-white overflow-x-hidden relative">
        {/* Background Layer */}
        <div
           className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-700"
           style={{
              backgroundImage: 'var(--bg-image)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 'var(--bg-opacity, 1)',
              filter: 'blur(var(--bg-blur, 0px))',
              background: 'var(--bg-gradient)'
           }}
        />

        <Header
          user={user}
          settings={settings}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex" style={{ flexDirection: 'var(--sidebar-pos, row)' as any }}>
           <Sidebar
             isOpen={isSidebarOpen}
             onClose={() => setIsSidebarOpen(false)}
           />

           {/* Main Content Region - This is the only part that swaps during navigation */}
           <main
              className="flex-1 lg:ml-[var(--sidebar-width,256px)] pt-[calc(var(--header-height,64px)+2rem)] min-h-screen-dvh transition-all duration-300"
           >
             <div className="container mx-auto px-4 pb-12">
               <Outlet />
             </div>
           </main>
        </div>
      </div>
    </ExtensionProvider>
  );
};
