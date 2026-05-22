import React from 'react';
import InstanceEditClient from '../InstanceEditClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function EditInstance() {
  return <InstanceEditClient />;
}
