'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateBlogPost } from '@/ai/flows/generate-blog-post-flow';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  keywords: z.string().min(1, 'Keywords are required.'),
  author: z.string().min(1, 'Author is required.'),
});

type BlogFormData = z.infer<typeof blogSchema>;

export function AIBlogGenerator() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      keywords: '',
      author: 'Hiring Dekho Team',
    },
  });

  async function onSubmit(values: BlogFormData) {
    if (!firestore) return;

    setIsGenerating(true);
    try {
      // 1. Generate content with AI
      const { content } = await generateBlogPost({ title: values.title, keywords: values.keywords });

      // 2. Save the generated post to Firestore
      const collectionRef = collection(firestore, 'blogs');
      await addDoc(collectionRef, {
        title: values.title,
        author: values.author,
        content: content,
        publicationDate: serverTimestamp(),
      });

      toast({
        title: 'Blog Post Generated & Published!',
        description: 'Your new AI-written post is now live on the blog.',
      });
      form.reset({ title: '', keywords: '', author: 'Hiring Dekho Team' });
    } catch (error: any) {
      console.error('Error generating or saving blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'Could not generate or save the blog post.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Blog Post Generator</CardTitle>
        <CardDescription>
          Provide a title and some keywords, and our AI will write a complete blog post for you and publish it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5 Tips to Ace Your Next Interview" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., interview tips, resume, career advice" {...field} />
                  </FormControl>
                   <FormDescription>
                    Comma-separated keywords that the AI should focus on.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isGenerating} className="gradient-professional">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate & Publish Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
