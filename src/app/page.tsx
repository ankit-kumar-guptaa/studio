import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedJobs } from '@/components/home/FeaturedJobs';
import { TopCompanies } from '@/components/home/TopCompanies';
import { Testimonials } from '@/components/home/Testimonials';
import { CtaSection } from '@/components/home/CtaSection';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedJobs />
        <TopCompanies />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
