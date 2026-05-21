import React from 'react';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function InstanceEdit({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Edit Instance: {params.id}</h1>
      <p className="text-neutral-400 mt-2">Configuration and management for this instance.</p>
    </div>
  );
}
