'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  t: (key: string) => string;
  lang: string;
  setLang: (lang: string) => void;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [lang, setLangState] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial language from cookies if possible, or fallback to 'en'
    const match = document.cookie.match(new RegExp('(^| )lang=([^;]+)'));
    const initialLang = match ? match[2] : 'en';
    setLangState(initialLang);
  }, []);

  useEffect(() => {
    async function fetchTranslations() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/translations/${lang}`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to fetch translations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTranslations();
  }, [lang]);

  const setLang = (newLang: string) => {
    document.cookie = `lang=${newLang}; path=/; max-age=${30 * 24 * 60 * 60}`;
    setLangState(newLang);
  };

  const t = (key: string) => {
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, lang, setLang, loading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
