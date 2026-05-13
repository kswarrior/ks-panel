'use client';

export const Navbar = ({ toggleMobile, toggleDesktop, isCollapsed }: { toggleMobile: () => void, toggleDesktop: () => void, isCollapsed: boolean }) => {
  return (
    <header className={`h-16 glass border-b border-white/5 fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={toggleMobile}
          aria-label="Toggle Menu"
          className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Desktop Toggle */}
        <button
          onClick={toggleDesktop}
          aria-label="Toggle Sidebar"
          className="hidden lg:flex p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-white tracking-tight hidden sm:block">Dashboard Overview</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors relative group">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a] group-hover:scale-110 transition-transform"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Administrator</span>
            <span className="text-xs font-bold text-white">Admin</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/20">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
