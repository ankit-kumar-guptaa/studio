
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from 'lucide-react';
import { EmployerDashboard } from '@/components/employer/EmployerDashboard';
import { useUserRole } from '@/hooks/useUserRole';

export default function EmployerPage() {
  const { isUserLoading } = useFirebase();
  const { userRole, isRoleLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !isRoleLoading) {
      if (userRole !== 'employer') {
        router.push('/login');
      }
    }
  }, [isUserLoading, isRoleLoading, userRole, router]);

  if (isUserLoading || isRoleLoading) {
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
