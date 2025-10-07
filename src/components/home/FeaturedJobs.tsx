import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { featuredJobs } from '@/lib/data';
import type { JobPost } from '@/lib/types';


// Using local dummy data to avoid Firestore fetching issues on the home page.
// The component is kept async to allow for easy re-integration of server-side fetching later if needed.
async function getFeaturedJobs(): Promise<(JobPost & { employerId: string })[]> {
  // Sorting the local data to show the latest jobs first
  const sortedJobs = [...featuredJobs].sort((a, b) => {
      const dateA = a.postDate instanceof Date ? a.postDate.getTime() : a.postDate.toMillis();
      const dateB = b.postDate instanceof Date ? b.postDate.getTime() : b.postDate.toMillis();
      return dateB - dateA;
  });
  
  // Adding a dummy employerId, as it's expected by the JobCard component.
  // In a real scenario, this would come from the database structure.
  return sortedJobs.map((job, index) => ({
    ...job,
    employerId: `employer-${index + 1}`
  }));
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
              <JobCard key={`${job.id}-${job.employerId}`} job={job} employerId={job.employerId} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-muted-foreground">
            <p>No featured jobs available at the moment. Please check back later.</p>
          </div>
        )}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gradient-indigo">
            <Link href="/job-seeker?tab=search">
              Explore All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
