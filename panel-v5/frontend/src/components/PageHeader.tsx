'use client';

import React from 'react';
import { useTranslation } from '@/components/TranslationProvider';

interface PageHeaderProps {
  title: string;
  translationKey?: string;
}

export default function PageHeader({ title, translationKey }: PageHeaderProps) {
  const { t } = useTranslation();
  const displayTitle = translationKey ? t(translationKey) : title;

  return (
    <div className="mb-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_8px_#00f2ff]" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
          {displayTitle}
        </h1>
      </div>
    </div>
  );
}
