'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageLoader } from '@/components/shared/PageLoader';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hide loader on initial load or when navigation completes
    setIsLoading(false);
  }, [pathname, searchParams]);

  // This effect is for triggering the loader. We use a separate state `isTransitioning`
  // and a link capture mechanism to show the loader *before* the navigation starts.
  // This approach is more complex and requires capturing link clicks.
  // A simpler approach is to show a loader based on a timeout, but that can feel sluggish.
  // For this implementation, we will rely on Suspense boundaries to show loading states
  // for page content, and this loader will act as a fallback and transition visual.

  // The logic to show loader on navigation start can be implemented by intercepting
  // link clicks or using a global state. For simplicity, we can use a small delay
  // before hiding the loader to smooth out fast transitions, but let's first
  // build the loader component.

  // Let's create a simplified version: any navigation will trigger the loading state.
  // In Next.js App router, the layout doesn't re-render on navigation, but the children do.
  // We can use a combination of Suspense and this state.
  // A simple way is to use a key on the children to force re-mounting, which is not ideal.
  
  // A better approach using Next.js 13+ App Router:
  // The layout itself doesn't re-render. We can use the router events if available,
  // but they are not directly exposed as hooks. `usePathname` is the simplest trigger.
  
  // Let's simulate a loading state on route change.
  // Note: This is a simplified implementation. A robust solution might use `next/router` events in a wrapper.
  const [lastPath, setLastPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== lastPath) {
      setIsLoading(true);
      setLastPath(pathname);
    }
  }, [pathname, lastPath]);


  return (
    <>
      <PageLoader isLoading={isLoading} />
      {children}
    </>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<PageLoader isLoading={true} />}>
            <PageTransitionInner>{children}</PageTransitionInner>
        </Suspense>
    )
}
