export default function AdminNodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Manage Nodes</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Add Node
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Address</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Usage</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                No nodes configured.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
