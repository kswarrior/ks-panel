import React, { useState, useEffect } from 'react';

export default function DatabasePage() {
  const [dbUrl, setDbUrl] = useState('');

  useEffect(() => {
    // Construct URL based on current host but port 7070
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    setDbUrl(`${protocol}//${host}:7070`);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-var(--header-height,64px)-4rem)] glass-dark rounded-3xl border border-white/5 overflow-hidden">
      {dbUrl ? (
        <iframe
          src={dbUrl}
          className="w-full h-full border-none"
          title="Database Web UI"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
           <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
