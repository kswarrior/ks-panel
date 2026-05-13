import Link from 'next/link';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-zinc-900 text-white h-screen fixed left-0 top-0 overflow-y-auto border-r border-zinc-800">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-blue-500 tracking-tight">KS Panel</h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium uppercase tracking-widest">Next Gen</p>
      </div>
      <nav className="mt-4 px-4">
        <div className="mb-8">
          <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dashboard</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <span>Overview</span>
          </Link>
          <Link href="/instances" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <span>Instances</span>
          </Link>
        </div>

        <div>
          <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Admin</div>
          <Link href="/admin/nodes" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <span>Nodes</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <span>Users</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};
