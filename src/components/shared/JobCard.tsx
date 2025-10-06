import Image from 'next/image';
import type { Job } from '@/lib/types';
import { findImage } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, IndianRupee, Clock } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const companyLogo = findImage(job.companyLogo);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4">
        {companyLogo && (
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src={companyLogo.imageUrl}
              alt={`${job.company} logo`}
              width={56}
              height={56}
              className="rounded-lg object-contain"
              data-ai-hint={companyLogo.imageHint}
            />
          </div>
        )}
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">{job.title}</CardTitle>
          <CardDescription className="font-medium text-primary">{job.company}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span>{job.salary}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{job.postedDate}</span>
        </div>
        <Button size="sm" className="gradient-saffron shadow-md hover:shadow-primary/40">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
}
