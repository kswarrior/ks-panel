export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-zinc-500 font-medium">Real-time insights into your panel performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Active Instances</h3>
          <p className="text-5xl font-black text-zinc-900 mt-4 tracking-tighter">0</p>
          <div className="mt-6 text-green-600 text-sm font-bold flex items-center gap-1">
            <span>↑ 0%</span>
            <span className="text-zinc-400 font-medium ml-1">since last month</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">RAM Allocation</h3>
          <p className="text-5xl font-black text-zinc-900 mt-4 tracking-tighter">0 MB</p>
          <div className="mt-6 text-zinc-400 text-sm font-medium">
            of 8192 MB available
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Global Nodes</h3>
          <p className="text-5xl font-black text-zinc-900 mt-4 tracking-tighter">0</p>
          <div className="mt-6 text-zinc-400 text-sm font-medium">
            All nodes are healthy
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-800">Recent Activity</h2>
          <button className="text-blue-600 text-sm font-bold hover:underline transition-all">View Full Logs</button>
        </div>
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="text-zinc-500 font-medium max-w-xs mx-auto">No activity has been recorded yet. Your system is quiet.</p>
        </div>
      </div>
    </div>
  );
}
