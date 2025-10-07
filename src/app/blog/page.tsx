import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '@/lib/data';
import { format } from 'date-fns';

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
                  <CardDescription>{format(new Date(post.publicationDate), 'PPP')} by {post.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }} />
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="p-0">
                    <Link href={`/blog/${post.id}`}>
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
