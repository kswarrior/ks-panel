'use client';

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  const toggleMobile = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDesktop = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleMobile={toggleMobile}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Navbar
        toggleMobile={toggleMobile}
        toggleDesktop={toggleDesktop}
        isCollapsed={isSidebarCollapsed}
      />

      <main className={`transition-all duration-300 pt-20 min-h-screen ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto animate-content">
          {children}
        </div>
      </main>
    </div>
  );
}
