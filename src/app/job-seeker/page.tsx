

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JobSeekerDashboard } from "@/components/job-seeker/JobSeekerDashboard";
import { Loader2 } from 'lucide-react';

function JobSeekerPageContent() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <JobSeekerDashboard />
      </main>
      <Footer />
    </div>
  );
}

export default function JobSeekerPage() {
  return (
    <Suspense>
      <JobSeekerPageContent />
    </Suspense>
  );
}
