export const Navbar = () => {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-10 shadow-sm">
      <div className="text-zinc-400 font-medium text-sm">
        Welcome back, <span className="text-zinc-900 font-bold">Admin</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-zinc-500 hover:text-zinc-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-100">
            AD
          </div>
          <span className="text-sm font-semibold text-zinc-700">Administrator</span>
        </div>
      </div>
    </header>
  );
};
