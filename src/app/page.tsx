'use client';

import { Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedJobs } from '@/components/home/FeaturedJobs';
import { TopCompanies } from '@/components/home/TopCompanies';
import { Testimonials } from '@/components/home/Testimonials';
import { CtaSection } from '@/components/home/CtaSection';
import { Loader2 } from 'lucide-react';
import { HowItWorks } from '@/components/home/HowItWorks';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CandidateSearch } from '@/components/employer/CandidateSearch';

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

function DefaultHomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedJobs />
      </Suspense>
      <HowItWorks />
      <Suspense fallback={<LoadingSpinner />}>
        <TopCompanies />
      </Suspense>
      <Testimonials />
      <CtaSection />
    </>
  );
}

function EmployerHomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find Your Next Great Hire
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Search our database of talented job seekers to find the perfect match for your team.
        </p>
      </div>
      <CandidateSearch />
    </div>
  )
}

export default function Home() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [userRole, setUserRole] = useState<'job-seeker' | 'employer' | 'loading' | 'none'>('loading');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isUserLoading) {
        setUserRole('loading');
        return;
      }
      if (user && firestore) {
        const employerRef = doc(firestore, 'employers', user.uid);
        const employerSnap = await getDoc(employerRef);
        if (employerSnap.exists()) {
          setUserRole('employer');
        } else {
          setUserRole('job-seeker');
        }
      } else {
        setUserRole('none');
      }
    };
    fetchUserRole();
  }, [user, firestore, isUserLoading]);
  
  const renderHomePage = () => {
    switch (userRole) {
      case 'loading':
        return <LoadingSpinner />;
      case 'employer':
        return <EmployerHomePage />;
      case 'job-seeker':
      case 'none':
      default:
        return <DefaultHomePage />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {renderHomePage()}
      </main>
      <Footer />
    </div>
  );
}
