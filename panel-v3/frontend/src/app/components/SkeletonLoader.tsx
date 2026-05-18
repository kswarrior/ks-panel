import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect'
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/5 border border-white/5",
        variant === 'circle' ? "rounded-full" : "rounded-xl",
        variant === 'text' ? "h-4 w-3/4" : "",
        className
      )}
    />
  );
};

export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} className="h-48" />
      ))}
    </div>
  );
};
