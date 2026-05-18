import React from 'react';
export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const ExtensionSlot: React.FC<{ id: string }> = () => null;
