export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900">System Settings</h1>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 max-w-2xl">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Panel Name</label>
            <input type="text" className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="KS Panel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Logo URL</label>
            <input type="text" className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="/assets/logo.webp" />
          </div>
          <div className="pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
