import React, { useState, useEffect } from 'react';
import { Menu, User, Bell, MessageSquare, Clock, Info, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  user: any;
  settings?: any;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, settings, onMenuClick }) => {
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
          <div className="w-8 h-8 bg-neon-blue rounded-lg shadow-neon flex items-center justify-center overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black font-bold text-xl">K</span>
            )}
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            {settings?.panel_name || 'KS PANEL'}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/tickets" className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/70 hover:text-white">
          <MessageSquare className="w-5 h-5" />
        </Link>
        <div className="relative group/notif">
          <button className="p-2 hover:bg-white/10 rounded-md transition-colors relative text-white/70 hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-neon"></span>
          </button>

          {/* Notifications Dropdown */}
          <div className="absolute right-0 mt-2 w-80 glass-dark border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/notif:opacity-100 group-hover/notif:translate-y-0 group-hover/notif:pointer-events-auto transition-all z-[100] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-sm">Notifications</h3>
              <Link href="/notifications" className="text-[10px] text-neon-blue hover:underline uppercase font-black">View All</Link>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <NotificationList limit={5} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.display_name || user?.username || 'Loading...'}</p>
            <p className="text-xs text-white/50">{user?.role_id === 1 ? 'Owner' : (user?.role_id === 2 ? 'Administrator' : 'User')}</p>
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

const NotificationList: React.FC<{ limit?: number }> = ({ limit }) => {
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifs(limit ? data.slice(0, limit) : data))
      .catch(() => {});
  }, []);

  if (notifs.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
        <p className="text-xs text-white/30">No notifications</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {notifs.map(n => (
        <div key={n.id} className="p-4 hover:bg-white/5 transition-colors cursor-default">
          <div className="flex gap-3">
            <div className={`mt-1 ${n.type === 'success' ? 'text-green-500' : n.type === 'warning' ? 'text-yellow-500' : 'text-neon-blue'}`}>
              {n.type === 'success' ? <CheckCircle className="w-3 h-3" /> : n.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{n.title}</p>
              <p className="text-[10px] text-white/50 line-clamp-2 mt-0.5">{n.message}</p>
              <p className="text-[9px] text-white/20 mt-1 flex items-center gap-1 uppercase font-bold"><Clock className="w-2 h-2" /> {n.created_at}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Header;
