import React from 'react';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function NodeEdit({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Edit Node: {params.id}</h1>
      <p className="text-neutral-400 mt-2">Node configuration and health monitoring.</p>
    </div>
  );
}
