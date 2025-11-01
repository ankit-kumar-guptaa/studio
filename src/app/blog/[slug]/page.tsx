'use client';

import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { firestore } = useFirebase();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const blogQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    // Query by slug
    return query(collection(firestore, 'blogs'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);
  
  const { data: posts, isLoading: isQueryLoading } = useCollection<Blog>(blogQuery);

  useEffect(() => {
    if (!isQueryLoading) {
      if (posts && posts.length > 0) {
        setPost(posts[0]);
      } else {
        setPost(null); // Explicitly set to null if not found
      }
      setIsLoading(false);
    }
  }, [posts, isQueryLoading]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    // This will be triggered after the query finishes and finds no matching post
    notFound();
  }

  const postDate = post.publicationDate && typeof (post.publicationDate as any).toDate === 'function' 
    ? (post.publicationDate as any).toDate()
    : new Date(post.publicationDate as string);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="py-16 sm:py-24 bg-secondary">
        <div className="container mx-auto max-w-4xl px-4">
            <Card>
                {post.imageUrl && (
                    <div className="relative aspect-[16/9] w-full">
                        <Image 
                            src={post.imageUrl} 
                            alt={post.title} 
                            fill 
                            className="object-cover rounded-t-lg"
                            data-ai-hint={post.imageHint || "abstract"}
                            priority
                        />
                    </div>
                )}
                <article className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        {post.title}
                        </h1>
                        <p className="mt-3 text-sm text-muted-foreground">
                        Posted by {post.author} on {format(postDate, 'PPP')}
                        </p>
                    </div>
                    <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
