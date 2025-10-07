
import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JobPost } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';

// This function now correctly uses the Firebase Admin SDK methods
async function getFeaturedJobs(): Promise<(JobPost & { id: string })[]> {
  if (!adminDb) {
    console.log("Firebase Admin is not initialized. Cannot fetch jobs.");
    return [];
  }
  
  // Use adminDb methods: .collection(), .orderBy(), .limit(), .get()
  const jobsRef = adminDb.collection('jobPosts');
  const q = jobsRef.orderBy('postDate', 'desc').limit(6);
  
  const querySnapshot = await q.get();
  const jobs: (JobPost & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    jobs.push({ id: doc.id, ...(doc.data() as JobPost) });
  });

  return jobs;
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
            {jobs.map((job) => {
              // The data from admin SDK is already serializable.
              // We just need to handle the Timestamp object.
              const plainJob = {
                ...job,
                // @ts-ignore
                postDate: job.postDate.toDate().toISOString(),
              };
              return (
                 <JobCard key={job.id} job={plainJob} />
              )
            })}
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
