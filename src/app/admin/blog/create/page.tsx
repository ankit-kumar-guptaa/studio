'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, Suspense, useRef } from 'react';
import { Loader2, ArrowLeft, Sparkles, Upload } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateBlogPost } from '@/ai/flows/generate-blog-post-flow';
import Image from 'next/image';
import { slugify } from '@/lib/utils';

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 4; // in MB

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  keywords: z.string().min(1, 'Keywords are required to generate content.'),
  author: z.string().min(1, 'Author is required.'),
  content: z.string().min(50, 'Content should be at least 50 characters long.'),
  imageUrl: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

function CreateBlogPageContent() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      keywords: '',
      author: 'Hiring Dekho Team',
      content: '',
      imageUrl: '',
    },
  });

  const imageUrl = form.watch("imageUrl");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: `Please select an image smaller than ${MAX_IMAGE_SIZE}MB.`,
      });
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
       toast({
        variant: "destructive",
        title: "Invalid image type",
        description: "Please select a JPG, PNG, or WebP image.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('imageUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  async function handleGenerateContent() {
    const { title, keywords } = form.getValues();
    if (!title || !keywords) {
      toast({
        variant: 'destructive',
        title: 'Input Missing',
        description: 'Please provide a Title and Keywords to generate content.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const { content } = await generateBlogPost({ title, keywords });
      form.setValue('content', content, { shouldValidate: true });
      toast({
        title: 'Content Generated!',
        description: 'AI has written the blog content for you. Review and publish.',
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
    if (!firestore) return;

    setIsSaving(true);
    try {
      const collectionRef = collection(firestore, 'blogs');
      const docRef = doc(collectionRef); // Create a reference with a new ID
      
      const slug = slugify(values.title);

      await setDoc(docRef, {
        ...values,
        id: docRef.id, // Store the document ID
        slug: slug,
        publicationDate: serverTimestamp(),
      });
      toast({ title: 'Blog Post Published!', description: 'Your new post is now live.' });
      router.push('/admin?tab=blog-management');
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save the blog post.',
      });
    } finally {
      setIsSaving(false);
    }
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
              <CardTitle>Create New Blog Post</CardTitle>
              <CardDescription>Use AI to assist in writing engaging content for your audience.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., 5 Tips to Ace Your Next Interview" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="keywords" render={({ field }) => ( <FormItem><FormLabel>Keywords</FormLabel><FormControl><Input placeholder="e.g., interview tips, resume" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <FormField control={form.control} name="author" render={({ field }) => ( <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  
                  <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                     <FormControl>
                        <Input type="file" className="hidden" ref={imageInputRef} onChange={handleImageUpload} accept={ACCEPTED_IMAGE_TYPES.join(',')} />
                    </FormControl>
                    <div className="border border-dashed rounded-lg p-6 text-center">
                      {imageUrl ? (
                        <div className="relative aspect-video">
                           <Image src={imageUrl} alt="Uploaded preview" fill className="object-contain rounded-md"/>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                            <p>No image uploaded</p>
                             <p className="text-xs">Max {MAX_IMAGE_SIZE}MB, PNG, JPG, WebP</p>
                        </div>
                      )}
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => imageInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {imageUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </div>
                  </FormItem>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel>Content (HTML)</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateContent} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Content with AI
                        </Button>
                    </div>
                    <FormField control={form.control} name="content" render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea placeholder="Generate content with AI or write your own here..." {...field} rows={15} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                     <Button type="button" variant="outline" onClick={() => router.push('/admin?tab=blog-management')}>Cancel</Button>
                    <Button type="submit" disabled={isSaving || isGenerating}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Post
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


export default function CreateBlogPage() {
    return (
        <Suspense>
            <CreateBlogPageContent />
        </Suspense>
    )
}
