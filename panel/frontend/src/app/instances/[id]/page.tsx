import React from 'react';
import InstanceControlClient from './InstanceControlClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function InstanceControl() {
  return <InstanceControlClient />;
}
