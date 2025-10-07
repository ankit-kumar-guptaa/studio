
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { JobSearch } from '@/components/job-seeker/JobSearch';
import { Loader2 } from 'lucide-react';

function FindJobsPageContent() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-16">
            <JobSearch />
        </div>
    );
}


export default function FindJobsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Find Your Dream Job"
          description="Search and filter from thousands of job openings to find your perfect match."
        />
        <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <FindJobsPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
