'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, Suspense } from 'react';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateBlogPost } from '@/ai/flows/generate-blog-post-flow';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  keywords: z.string().min(1, 'Keywords are required to generate content.'),
  author: z.string().min(1, 'Author is required.'),
  content: z.string().min(50, 'Content should be at least 50 characters long.'),
});

type BlogFormData = z.infer<typeof blogSchema>;

function EditBlogPageContent() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const blogId = params.blogId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const blogRef = useMemoFirebase(() => {
    if (!firestore || !blogId) return null;
    return doc(firestore, 'blogs', blogId);
  }, [firestore, blogId]);

  const { data: existingPost, isLoading: isLoadingPost } = useDoc<Blog>(blogRef);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      keywords: '',
      author: '',
      content: '',
    },
  });
  
  useEffect(() => {
    if (existingPost) {
        form.reset({
            title: existingPost.title,
            author: existingPost.author,
            content: existingPost.content,
            keywords: '', // Keywords are not saved, user must re-enter to generate
        });
    }
  }, [existingPost, form]);

  async function handleGenerateContent() {
    const { title, keywords } = form.getValues();
    if (!title || !keywords) {
      toast({
        variant: 'destructive',
        title: 'Input Missing',
        description: 'Please provide a Title and Keywords to generate new content.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const { content } = await generateBlogPost({ title, keywords });
      form.setValue('content', content, { shouldValidate: true });
      toast({
        title: 'Content Regenerated!',
        description: 'AI has written new blog content. Review and save your changes.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'Could not generate blog content.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: BlogFormData) {
    if (!firestore || !blogId) return;

    setIsSaving(true);
    try {
      const postRef = doc(firestore, 'blogs', blogId);
      // We don't want to save keywords to the document
      const { keywords, ...postData } = values;
      await updateDoc(postRef, postData);
      
      toast({ title: 'Blog Post Updated!', description: 'Your changes have been saved.' });
      router.push('/admin?tab=blog-management');
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not save the blog post.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingPost) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!existingPost) {
     return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center bg-secondary">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Blog Post Not Found</h1>
                    <Button onClick={() => router.push('/admin?tab=blog-management')} className="mt-4">Back to Dashboard</Button>
                </div>
            </main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Button variant="ghost" onClick={() => router.push('/admin?tab=blog-management')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Blog Management
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Edit Blog Post</CardTitle>
              <CardDescription>Update the details and content of your blog post.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="keywords" render={({ field }) => ( <FormItem><FormLabel>Keywords for AI Regeneration</FormLabel><FormControl><Input placeholder="e.g., career growth, salary" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <FormField control={form.control} name="author" render={({ field }) => ( <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel>Content (HTML)</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateContent} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Regenerate with AI
                        </Button>
                    </div>
                    <FormField control={form.control} name="content" render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea {...field} rows={15} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                     <Button type="button" variant="outline" onClick={() => router.push('/admin?tab=blog-management')}>Cancel</Button>
                    <Button type="submit" disabled={isSaving || isGenerating}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function EditBlogPage() {
    return (
        <Suspense>
            <EditBlogPageContent />
        </Suspense>
    )
}
