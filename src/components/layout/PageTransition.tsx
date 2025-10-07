'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageLoader } from '@/components/shared/PageLoader';

function PageTransitionInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // This effect hides the loader when the new page is fully rendered.
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // This effect sets up a global click listener to show the loader *immediately* on navigation.
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement;
      // Traverse up the DOM to find the nearest link tag
      while (target && target.tagName !== 'A') {
        target = target.parentElement as HTMLElement;
      }

      if (target && target.tagName === 'A') {
        const link = target as HTMLAnchorElement;
        const href = link.getAttribute('href');

        // Check if it's an internal navigation link
        if (href && href.startsWith('/') && href !== pathname) {
           // Check if the link has a target="_blank" attribute
           if (link.target !== '_blank') {
               setIsLoading(true);
           }
        }
      }
    };

    // Listen for clicks on the entire body
    document.body.addEventListener('click', handleLinkClick);

    // Cleanup the event listener on component unmount
    return () => {
      document.body.removeEventListener('click', handleLinkClick);
    };
    // We only want to set this up once.
    // The `pathname` dependency is to re-evaluate the check for internal links correctly.
  }, [pathname]);


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
