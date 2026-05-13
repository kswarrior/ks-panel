'use client';

import { useEffect, useState } from 'react';
import { Instance } from '@/types';

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/instances')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInstances(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch instances:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Your Instances</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Deploy New
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Node</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Address</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Loading instances...
                </td>
              </tr>
            ) : instances.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  You don't have any instances yet.
                </td>
              </tr>
            ) : (
              instances.map(instance => (
                <tr key={instance.Id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{instance.Name}</td>
                  <td className="px-6 py-4 text-zinc-600">{instance.Node.name}</td>
                  <td className="px-6 py-4 text-zinc-600">{instance.Allocation.IP}:{instance.Allocation.Port}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      {instance.InternalState}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Manage</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
