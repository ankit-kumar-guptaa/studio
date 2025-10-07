import { JobCard } from '@/components/shared/JobCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { JobPost } from '@/lib/types';
import { collectionGroup, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';

async function getFeaturedJobs() {
  const fetchedJobs: (JobPost & { employerId: string })[] = [];
  try {
    const jobPostsQuery = query(
      collectionGroup(adminDb, 'jobPosts'),
      orderBy('postDate', 'desc'),
      limit(6)
    );

    const querySnapshot = await getDocs(jobPostsQuery);
    
    querySnapshot.forEach((doc) => {
      const employerId = doc.ref.parent.parent?.id;
      if (employerId) {
        // Firestore admin SDK returns Timestamps, which need to be converted
        const data = doc.data();
        const jobPost: JobPost = {
          ...data,
          id: doc.id,
          postDate: data.postDate.toDate(), // Convert Timestamp to Date
        } as JobPost;

        fetchedJobs.push({ ...jobPost, id: doc.id, employerId });
      }
    });
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    // Return empty array on error
  }
  return fetchedJobs;
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
