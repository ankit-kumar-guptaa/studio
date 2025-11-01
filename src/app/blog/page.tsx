'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import Image from 'next/image';


export default function BlogPage() {
  const { firestore } = useFirebase();

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogs'), orderBy('publicationDate', 'desc'));
  }, [firestore]);

  const { data: blogPosts, isLoading } = useCollection<Blog>(blogsQuery);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Career Advice Blog"
          description="Insights and tips to help you advance in your career journey."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            </div>
          ) : blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => {
                const postDate = post.publicationDate && typeof (post.publicationDate as any).toDate === 'function' 
                    ? (post.publicationDate as any).toDate()
                    : new Date(post.publicationDate as string);
                
                // Fallback for old posts without a slug
                const href = `/blog/${post.slug || post.id}`;

                return (
                  <Card key={post.id} className="flex flex-col overflow-hidden">
                    <Link href={href} className="block aspect-video relative">
                      <Image 
                          src={post.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'} 
                          alt={post.title} 
                          fill
                          className="object-cover"
                          data-ai-hint={post.imageHint || 'abstract'}
                      />
                    </Link>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        <Link href={href}>
                         {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>{format(postDate, 'PPP')} by {post.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }} />
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="link" className="p-0">
                        <Link href={href}>
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
                <h3 className="text-xl font-semibold">No Blog Posts Yet</h3>
                <p>Check back later for career advice and industry insights.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
