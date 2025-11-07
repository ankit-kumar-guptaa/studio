'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit, Save, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function SeoBlogManagement() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<Blog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const blogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogs'), orderBy('publicationDate', 'desc'));
  }, [firestore]);

  const { data: blogPosts, isLoading } = useCollection<Blog>(blogsQuery);

  const handleEdit = (post: Blog) => {
    setEditingPost(post);
  };

  const handleSave = async () => {
    if (!firestore || !editingPost) return;
    setIsSaving(true);
    const postRef = doc(firestore, 'blogs', editingPost.id);
    try {
      await updateDoc(postRef, {
        seoTitle: editingPost.seoTitle || '',
        seoDescription: editingPost.seoDescription || '',
        seoKeywords: editingPost.seoKeywords || '',
      });
      toast({ title: 'SEO Updated', description: 'Blog post SEO data has been saved.' });
      setEditingPost(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts SEO</CardTitle>
          <CardDescription>Manage the SEO title, description, and keywords for each blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>SEO Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : blogPosts && blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground">{post.seoTitle || 'Not set'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit SEO
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">No blog posts found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SEO for: {editingPost?.title}</DialogTitle>
            <DialogDescription>Optimize this post for search engines.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <label htmlFor="seoTitle">SEO Title</label>
                <Input id="seoTitle" value={editingPost?.seoTitle || ''} onChange={(e) => setEditingPost(p => p ? {...p, seoTitle: e.target.value} : null)} />
            </div>
             <div className="space-y-2">
                <label htmlFor="seoDescription">SEO Description</label>
                <Textarea id="seoDescription" value={editingPost?.seoDescription || ''} onChange={(e) => setEditingPost(p => p ? {...p, seoDescription: e.target.value} : null)} />
            </div>
             <div className="space-y-2">
                <label htmlFor="seoKeywords">SEO Keywords (comma-separated)</label>
                <Input id="seoKeywords" value={editingPost?.seoKeywords || ''} onChange={(e) => setEditingPost(p => p ? {...p, seoKeywords: e.target.value} : null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}><X className="mr-2 h-4 w-4"/> Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
