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
  const { user, isUserLoading } = useFirebase();
  const { userRole, isRoleLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isRoleLoading && userRole !== 'employer') {
        router.push('/');
    }
  }, [user, isUserLoading, router, userRole, isRoleLoading]);

  if (isUserLoading || isRoleLoading || userRole !== 'employer') {
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
