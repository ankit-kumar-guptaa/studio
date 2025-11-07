
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from 'lucide-react';
import { EmployerDashboard } from '@/components/employer/EmployerDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function EmployerPage() {
  const { userRole, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (userRole !== 'employer') {
        router.push('/login');
      }
    }
  }, [isAuthLoading, userRole, router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'employer') {
    // This state is temporary while redirecting
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
        <EmployerDashboard />
      </main>
      <Footer />
    </div>
  );
}
