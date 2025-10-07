'use client';

import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { CandidateSearch } from '@/components/employer/CandidateSearch';
import { useUserRole } from '@/hooks/useUserRole';
import { HeroSection } from './HeroSection';
import { Testimonials } from './Testimonials';
import { CtaSection } from './CtaSection';
import { HowItWorks } from './HowItWorks';
import { WhyChooseHiringDekho } from './WhyChooseHiringDekho';

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
      <WhyChooseHiringDekho />
      <HowItWorks />
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

export function HomePageClient() {
  const { user, isUserLoading } = useFirebase();
  const { userRole, isRoleLoading } = useUserRole();

  if (isUserLoading || isRoleLoading) {
    return <LoadingSpinner />;
  }
  
  switch (userRole) {
    case 'employer':
      return <EmployerHomePage />;
    case 'job-seeker':
    case 'none':
    default:
      return <DefaultHomePage />;
  }
}
