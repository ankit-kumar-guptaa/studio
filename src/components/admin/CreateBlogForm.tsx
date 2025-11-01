'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { DialogFooter, DialogClose } from '../ui/dialog';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  author: z.string().min(1, 'Author is required.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  imageHint: z.string().optional(),
  content: z.string().min(50, 'Content should be at least 50 characters long.'),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface CreateBlogFormProps {
  existingPost?: Blog | null;
  onSuccess: () => void;
}

export function CreateBlogForm({ existingPost, onSuccess }: CreateBlogFormProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      author: 'Hiring Dekho Team',
      imageUrl: '',
      imageHint: '',
      content: '<p>Start writing your blog post here...</p>',
    },
  });

  useEffect(() => {
    if (existingPost) {
      form.reset(existingPost);
    } else {
        form.reset({
            title: '',
            author: 'Hiring Dekho Team',
            imageUrl: '',
            imageHint: '',
            content: '<p>Start writing your blog post here...</p>',
        });
    }
  }, [existingPost, form]);

  async function onSubmit(values: BlogFormData) {
    if (!firestore) return;

    setIsSaving(true);
    try {
      if (existingPost) {
        // Update existing post
        const postRef = doc(firestore, 'blogs', existingPost.id);
        await updateDoc(postRef, values);
        toast({ title: 'Blog Post Updated', description: 'Your changes have been saved.' });
      } else {
        // Create new post
        const collectionRef = collection(firestore, 'blogs');
        await addDoc(collectionRef, {
          ...values,
          publicationDate: serverTimestamp(),
        });
        toast({ title: 'Blog Post Created', description: 'Your new post is now live.' });
      }
      onSuccess();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Blog Post Title" {...field} /></FormControl><FormMessage /></FormItem> )}/>
          <FormField control={form.control} name="author" render={({ field }) => ( <FormItem><FormLabel>Author</FormLabel><FormControl><Input placeholder="Author's Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
          <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://picsum.photos/1200/600" {...field} /></FormControl><FormMessage /></FormItem> )}/>
          <FormField control={form.control} name="imageHint" render={({ field }) => ( <FormItem><FormLabel>Image Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g. 'office work'" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your blog content here. You can use HTML tags like <p> and <h3>." {...field} rows={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingPost ? 'Save Changes' : 'Publish Post'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
