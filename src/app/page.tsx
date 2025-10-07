import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedJobs } from '@/components/home/FeaturedJobs';
import { TopCompanies } from '@/components/home/TopCompanies';
import { Testimonials } from '@/components/home/Testimonials';
import { CtaSection } from '@/components/home/CtaSection';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedJobs />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <TopCompanies />
        </Suspense>
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
