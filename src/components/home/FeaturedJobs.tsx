// This component is not currently used, but kept for potential future use.
// It uses dummy data to avoid server-side build issues.
import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JobPost } from '@/lib/types';
import { featuredJobs as dummyJobs } from '@/lib/data';

async function getFeaturedJobs(): Promise<(JobPost & { id: string })[]> {
  // Using dummy data to resolve server-side auth issues in development.
  const jobs = dummyJobs.map(job => ({
    ...job,
    id: job.id || `dummy-${Math.random()}`,
    postDate: job.postDate.toDate(),
  }));
  
  return jobs
    .sort((a, b) => b.postDate.getTime() - a.postDate.getTime())
    .slice(0, 6)
    .map(job => ({...job, postDate: job.postDate.toISOString()}));
}

export async function FeaturedJobs() {
  const jobs = await getFeaturedJobs();

  return (
    <section id="featured-jobs" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Job Openings
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore a selection of top jobs from leading companies in India.
          </p>
        </div>
        {jobs && jobs.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
               <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-muted-foreground">
            <p>No featured jobs available at the moment. Please check back later.</p>
          </div>
        )}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gradient-indigo">
            <Link href="/find-jobs">
              Explore All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
