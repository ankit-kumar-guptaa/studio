'use client';

import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc, getDoc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string; // This can be a slug or an ID for old posts
  const { firestore } = useFirebase();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!firestore || !slug) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // Try fetching by slug first
        const slugQuery = query(collection(firestore, 'blogs'), where('slug', '==', slug), limit(1));
        const slugSnapshot = await getDoc(slugQuery);
        
        if (!slugSnapshot.empty) {
          setPost(slugSnapshot.docs[0].data() as Blog);
        } else {
          // If not found by slug, try fetching by ID (for backward compatibility)
          const idRef = doc(firestore, 'blogs', slug);
          const idSnapshot = await getDoc(idRef);
          if (idSnapshot.exists()) {
            setPost(idSnapshot.data() as Blog);
          } else {
            setPost(null); // Not found by slug or ID
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [firestore, slug]);


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
