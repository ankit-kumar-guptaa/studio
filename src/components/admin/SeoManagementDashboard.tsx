'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, doc, deleteDoc, query, getDocs } from 'firebase/firestore';
import type { SEOManager } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export function SeoManagementDashboard() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [seoManagers, setSeoManagers] = useState<SEOManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (firestore) {
      const fetchManagers = async () => {
        setIsLoading(true);
        try {
          const seoManagersQuery = query(collection(firestore, 'seoManagers'));
          const snapshot = await getDocs(seoManagersQuery);
          const managers = snapshot.docs.map(doc => doc.data() as SEOManager);
          setSeoManagers(managers);
        } catch (error: any) {
          console.error("Error fetching SEO managers:", error);
          toast({
            variant: "destructive",
            title: "Failed to load managers",
            description: error.message
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchManagers();
    }
  }, [firestore, toast]);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'seoManagers', id));
      toast({ title: 'SEO Manager Deleted' });
      setSeoManagers(prev => prev.filter(m => m.id !== id));
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    }
  };


  return (
    <Card>
        <CardHeader>
            <CardTitle>Existing SEO Managers</CardTitle>
            <CardDescription>
                List of all users with SEO manager access. New managers should be created directly in the Firebase Console.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                    ) : seoManagers && seoManagers.length > 0 ? (
                        seoManagers.map(manager => (
                            <TableRow key={manager.id}>
                                <TableCell>{manager.firstName} {manager.lastName}</TableCell>
                                <TableCell>{manager.email}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this SEO Manager account.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(manager.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={3} className="text-center h-24">No SEO Managers found.</TableCell></TableRow>
                    )}
                </TableBody>
             </Table>
        </CardContent>
    </Card>
  );
}