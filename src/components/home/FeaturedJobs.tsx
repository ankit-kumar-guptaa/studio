import { featuredJobs } from '@/lib/data';
import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedJobs() {
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
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} employerId="placeholder-employer-id" />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gradient-indigo">
            <Link href="/job-seeker">
              Explore All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
