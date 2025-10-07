import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, StarHalf } from 'lucide-react';
import { format } from 'date-fns';
import { findImage } from '@/lib/placeholder-images';
import Image from 'next/image';

const dummyReviews = [
  {
    id: 'rev1',
    companyName: 'InnovateTech',
    companyLogo: 'company-logo-1',
    jobSeekerName: 'Priya S.',
    rating: 4.5,
    comment: 'Great work culture and learning opportunities. Management is supportive, but the work-life balance can be challenging at times during project deadlines.',
    reviewDate: new Date('2024-07-15'),
  },
  {
    id: 'rev2',
    companyName: 'BharatSolutions',
    companyLogo: 'company-logo-2',
    jobSeekerName: 'Amit K.',
    rating: 5,
    comment: 'Excellent company with a clear vision. The team is highly motivated and the projects are very interesting. Highly recommended for growth.',
    reviewDate: new Date('2024-06-20'),
  },
  {
    id: 'rev3',
    companyName: 'DesiDesigns',
    companyLogo: 'company-logo-3',
    jobSeekerName: 'Sneha M.',
    rating: 3,
    comment: 'Creative environment, but processes are a bit chaotic. Good for people who like startups, but can be stressful. Salary is average for the industry.',
    reviewDate: new Date('2024-05-30'),
  },
    {
    id: 'rev4',
    companyName: 'Digital India Corp',
    companyLogo: 'company-logo-4',
    jobSeekerName: 'Rajat G.',
    rating: 4,
    comment: 'Large scale projects and good job security. However, career progression can be slow and there is a lot of bureaucracy to deal with.',
    reviewDate: new Date('2024-07-01'),
  },
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-5 w-5 fill-primary text-primary" />)}
      {halfStar && <StarHalf className="h-5 w-5 fill-primary text-primary" />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-5 w-5 text-muted" />)}
    </div>
  )
}

export default function CompanyReviewsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Company Reviews"
          description="Honest insights from real employees to help you make better career decisions."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
                {dummyReviews.map((review) => {
                    const logo = findImage(review.companyLogo);
                    return (
                        <Card key={review.id}>
                            <CardHeader className="flex flex-row items-start gap-4">
                                {logo && <Image src={logo.imageUrl} alt={review.companyName} width={48} height={48} className="h-12 w-12 rounded-lg border object-contain"/>}
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{review.companyName}</CardTitle>
                                    <div className="mt-1">{renderStars(review.rating)}</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                <p>Reviewed by <strong>{review.jobSeekerName}</strong> on {format(review.reviewDate, 'PPP')}</p>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
            {/* Write a Review Card */}
            <div className="md:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Share Your Experience</CardTitle>
                        <CardDescription>Help others by anonymously reviewing your current or past employer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full gradient-indigo">Write a Review</Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
