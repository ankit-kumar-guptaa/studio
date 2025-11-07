'use client';

import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { CandidateSearch } from '@/components/employer/CandidateSearch';
import { useAuth } from '@/hooks/useAuth';
import { HeroSection } from './HeroSection';
import { Testimonials } from './Testimonials';
import { CtaSection } from './CtaSection';
import { HowItWorks } from './HowItWorks';
import { WhyChooseHiringDekho } from './WhyChooseHiringDekho';
import { JobSearch } from '../job-seeker/JobSearch';

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
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

function JobSeekerHomePage() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Find Your Dream Job
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Search and filter from thousands of job openings to find your perfect match.
                </p>
            </div>
            <JobSearch />
        </div>
    )
}

export function HomePageClient() {
  const { isUserLoading } = useFirebase();
  const { userRole, isAuthLoading } = useAuth();

  if (isUserLoading || isAuthLoading) {
    return <LoadingSpinner />;
  }
  
  switch (userRole) {
    case 'admin':
        // Admin will be redirected to /admin, but as a fallback:
        return <DefaultHomePage />;
    case 'employer':
      return <EmployerHomePage />;
    case 'job-seeker':
    case 'none':
    default:
      return <DefaultHomePage />;
  }
}
