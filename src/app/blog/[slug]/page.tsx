'use client';

import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { collection, query, where, limit, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BlogDetailPage() {
  const params = useParams();
  const slugOrId = params.slug as string;
  const { firestore } = useFirebase();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!firestore || !slugOrId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // Try fetching by slug first
        const blogsRef = collection(firestore, 'blogs');
        const q = query(blogsRef, where('slug', '==', slugOrId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as Blog);
        } else {
          // If not found by slug, try fetching by ID (for backward compatibility)
          const idRef = doc(firestore, 'blogs', slugOrId);
          const idSnapshot = await getDoc(idRef);
          if (idSnapshot.exists()) {
            setPost({ id: idSnapshot.id, ...idSnapshot.data() } as Blog);
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
  }, [firestore, slugOrId]);


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
