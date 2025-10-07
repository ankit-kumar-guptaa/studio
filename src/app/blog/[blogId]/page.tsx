import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { blogPosts } from '@/lib/data';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

type BlogDetailPageProps = {
  params: {
    blogId: string;
  };
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { blogId } = params;
  const post = blogPosts.find((p) => p.id === blogId);

  if (!post) {
    notFound();
  }

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
                        Posted by {post.author} on {format(new Date(post.publicationDate), 'PPP')}
                        </p>
                    </div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border mb-8">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            width={1200}
                            height={600}
                            className="h-full w-full object-cover"
                            data-ai-hint={post.imageHint}
                        />
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
