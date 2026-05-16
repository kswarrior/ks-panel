import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] glass z-50 px-4 flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon-blue rounded-lg shadow-neon flex items-center justify-center">
            <span className="text-black font-bold text-xl">K</span>
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">KS PANEL</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-md transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-neon"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-white/50">Administrator</p>
          </div>
          <Link
            href="/account"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden hover:border-neon-blue/50 transition-colors group"
          >
            <User className="w-6 h-6 group-hover:text-neon-blue transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
