'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
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

export function SeoJobManagement() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<JobPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobPosts'), orderBy('postDate', 'desc'));
  }, [firestore]);

  const { data: jobPosts, isLoading } = useCollection<JobPost>(jobsQuery);

  const handleEdit = (post: JobPost) => {
    setEditingPost(post);
  };

  const handleSave = async () => {
    if (!firestore || !editingPost) return;
    setIsSaving(true);
    const postRef = doc(firestore, 'jobPosts', editingPost.id);
    try {
      await updateDoc(postRef, {
        seoTitle: editingPost.seoTitle || '',
        seoDescription: editingPost.seoDescription || '',
        seoKeywords: editingPost.seoKeywords || '',
      });
      // Also update the employer-specific post if it exists
      if (editingPost.employerId && editingPost.employerId !== 'SUPER_ADMIN') {
        const employerPostRef = doc(firestore, `employers/${editingPost.employerId}/jobPosts`, editingPost.id);
        await updateDoc(employerPostRef, {
            seoTitle: editingPost.seoTitle || '',
            seoDescription: editingPost.seoDescription || '',
            seoKeywords: editingPost.seoKeywords || '',
        });
      }
      toast({ title: 'SEO Updated', description: 'Job post SEO data has been saved.' });
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
          <CardTitle>Job Posts SEO</CardTitle>
          <CardDescription>Manage the SEO title, description, and keywords for each job listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>SEO Title</TableHead>
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
              ) : jobPosts && jobPosts.length > 0 ? (
                jobPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.companyName}</TableCell>
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
                  <TableCell colSpan={4} className="h-24 text-center">No job posts found.</TableCell>
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
            <DialogDescription>Optimize this job post for search engines.</DialogDescription>
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
