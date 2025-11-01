'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { CreateBlogForm } from './CreateBlogForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export function BlogManagement() {
  const { firestore } = useFirebase();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Blog | null>(null);
  const { toast } = useToast();

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogs'), orderBy('publicationDate', 'desc'));
  }, [firestore]);

  const { data: blogPosts, isLoading, setData: setBlogPosts } = useCollection<Blog>(blogsQuery);
  
  const handleEditClick = (post: Blog) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };
  
  const handleCreateClick = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'blogs', postId));
        toast({ title: 'Blog Post Deleted', description: 'The post has been successfully removed.' });
        setBlogPosts(prev => prev?.filter(p => p.id !== postId) || null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Blog Management</CardTitle>
          <CardDescription>Create, edit, and manage all blog posts on the platform.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick}><PlusCircle className="mr-2 h-4 w-4"/> Create New Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            </DialogHeader>
            <CreateBlogForm existingPost={editingPost} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : blogPosts && blogPosts.length > 0 ? (
              blogPosts.map((post) => {
                const postDate = typeof post.publicationDate === 'string'
                    ? new Date(post.publicationDate)
                    : (post.publicationDate as any).toDate();

                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{format(postDate, 'PPP')}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(post)}>
                            <Edit className="mr-2 h-4 w-4"/> Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete this blog post. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No blog posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
