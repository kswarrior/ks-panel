"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Extension {
  id: string;
  name: string;
  frontend: {
    routes: Array<{ path: string; component: string; title: string }>;
    slots: Array<{ target: string; component: string }>;
  };
}

type ComponentRegistry = Record<string, React.FC<any>>;

interface ExtensionContextType {
  extensions: Extension[];
  loading: boolean;
  registerComponent: (name: string, component: React.FC<any>) => void;
  getComponent: (name: string) => React.FC<any> | null;
}

const ExtensionContext = createContext<ExtensionContextType>({
  extensions: [],
  loading: true,
  registerComponent: () => {},
  getComponent: () => null
});

export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [registry, setRegistry] = useState<ComponentRegistry>({});

  const registerComponent = (name: string, component: React.FC<any>) => {
    setRegistry(prev => ({ ...prev, [name]: component }));
  };

  const getComponent = (name: string) => registry[name] || null;

  useEffect(() => {
    fetch('/api/extensions')
      .then(res => res.json())
      .then(data => setExtensions(data || []))
      .catch(() => setExtensions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ExtensionContext.Provider value={{ extensions, loading, registerComponent, getComponent }}>
      {children}
    </ExtensionContext.Provider>
  );
};

export const useExtensions = () => useContext(ExtensionContext);

export const ExtensionSlot: React.FC<{ id: string; props?: any }> = ({ id, props }) => {
  const { extensions, getComponent } = useExtensions();

  const injectedComponents = extensions
    .flatMap(ext => ext.frontend.slots
      .filter(slot => slot.target === id)
      .map(slot => {
        const Component = getComponent(`${ext.id}:${slot.component}`);
        if (!Component) {
          return (
            <div key={`${ext.id}-${slot.component}`} className="text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-1 rounded-md border border-neon-blue/30 inline-block">
              {ext.name}: {slot.component}
            </div>
          );
        }
        return <Component key={`${ext.id}-${slot.component}`} {...props} />;
      })
    );

  return <>{injectedComponents}</>;
};
