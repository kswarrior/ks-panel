import { SubNav } from "@/components/SubNav";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-neutral-500 font-medium">Real-time insights into your panel performance.</p>
        </div>
        <SubNav />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="glass p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] group">
          <div className="flex justify-between items-start">
            <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Active Instances</h3>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter">0</p>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-green-500 text-xs font-black">↑ 0%</span>
            <span className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">since last month</span>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] group">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">RAM Allocation</h3>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter">0 <span className="text-2xl text-neutral-600 uppercase">MB</span></p>
          <div className="mt-6">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 w-0 transition-all duration-1000"></div>
            </div>
            <p className="mt-3 text-neutral-600 text-[10px] font-bold uppercase tracking-widest text-right">0% OF 8GB USED</p>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] group">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Global Nodes</h3>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter">0</p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">All nodes are healthy</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-lg text-white">Recent Activity</h2>
          <button className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all cursor-pointer">View Full Logs</button>
        </div>
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 group hover:rotate-0 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="text-neutral-500 font-medium max-w-xs mx-auto text-sm">No activity has been recorded yet. Your system is currently silent.</p>
        </div>
      </div>
    </div>
  );
}
