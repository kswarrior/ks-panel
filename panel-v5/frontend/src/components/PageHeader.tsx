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
    <div className="mb-2 shrink-0">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        {displayTitle}
      </h1>
    </div>
  );
}
