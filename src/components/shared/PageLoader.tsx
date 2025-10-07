'use client';

import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="animate-pulse">
        <Logo className="h-12 w-auto" />
      </div>
    </div>
  );
}
