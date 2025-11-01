'use client';

import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.blogId as string;
  const { firestore } = useFirebase();

  const blogRef = useMemoFirebase(() => {
    if (!firestore || !blogId) return null;
    return doc(firestore, 'blogs', blogId);
  }, [firestore, blogId]);

  const { data: post, isLoading } = useDoc<Blog>(blogRef);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
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
