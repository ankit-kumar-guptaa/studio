import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: '5 Tips for a Standout Resume',
    description: 'Learn how to craft a resume that grabs the attention of recruiters and lands you more interviews.',
    imageUrl: 'https://picsum.photos/seed/resume/600/400',
    imageHint: 'resume document',
    date: 'July 26, 2024',
    author: 'Hiring Dekho Team',
  },
  {
    id: 2,
    title: 'How to Ace Your Next Remote Interview',
    description: 'Remote interviews are the new norm. Discover key strategies to impress your future employer from home.',
    imageUrl: 'https://picsum.photos/seed/interview/600/400',
    imageHint: 'video conference',
    date: 'July 24, 2024',
    author: 'Priya Desai',
  },
  {
    id: 3,
    title: 'Navigating the Indian Job Market in 2024',
    description: 'An overview of the trending industries and in-demand skills in India right now.',
    imageUrl: 'https://picsum.photos/seed/market/600/400',
    imageHint: 'city skyline',
    date: 'July 22, 2024',
    author: 'Aditya Verma',
  },
];

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Career Advice Blog"
          description="Insights and tips to help you advance in your career journey."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="h-48 w-full object-cover"
                  data-ai-hint={post.imageHint}
                />
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.date} by {post.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{post.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="p-0">
                    <Link href="#">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
