
import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JobPost } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';


async function getFeaturedJobs(): Promise<(JobPost & { id: string })[]> {
  if (!adminDb) {
    console.log("Firebase Admin is not initialized. Cannot fetch jobs.");
    return [];
  }
  const jobsRef = collection(adminDb, 'jobPosts');
  const q = query(jobsRef, orderBy('postDate', 'desc'), limit(6));
  
  const querySnapshot = await getDocs(q);
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
              const plainJob = {
                ...job,
                // Convert Timestamp/Date to a serializable string
                postDate: job.postDate instanceof Date 
                  ? job.postDate.toISOString() 
                  // @ts-ignore
                  : new Date(job.postDate.seconds * 1000).toISOString(),
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
