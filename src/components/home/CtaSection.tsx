import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-card p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-foreground">Are you a Job Seeker?</h3>
            <p className="mt-2 text-muted-foreground">
              Find your dream job from thousands of openings. We'll help you get there.
            </p>
            <Button asChild size="lg" className="mt-6 gradient-professional shadow-md hover:shadow-primary/40">
              <Link href="/job-seeker">
                Start Your Search <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-lg bg-card p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-foreground">Are you an Employer?</h3>
            <p className="mt-2 text-muted-foreground">
              Post a job and find the best talent for your team. It's fast and easy.
            </p>
            <Button asChild size="lg" className="mt-6 gradient-accent shadow-md hover:shadow-accent/40">
              <Link href="/employer">
                Post a Job <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
