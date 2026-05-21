import React from 'react';
import NodeEditClient from '../NodeEditClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function EditNode() {
  return <NodeEditClient />;
}
