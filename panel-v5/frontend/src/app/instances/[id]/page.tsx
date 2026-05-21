import React from 'react';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function InstanceDetails({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Instance Details: {params.id}</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-neutral-400 uppercase text-xs tracking-widest">Status</h3>
          <p className="text-xl font-black mt-1 text-emerald-400">ONLINE</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-neutral-400 uppercase text-xs tracking-widest">Address</h3>
          <p className="text-xl font-black mt-1">127.0.0.1:25565</p>
        </div>
      </div>
    </div>
  );
}
