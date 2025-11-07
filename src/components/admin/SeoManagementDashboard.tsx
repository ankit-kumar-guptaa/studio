'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, doc, deleteDoc, query, getDocs } from 'firebase/firestore';
import type { SEOManager } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
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
import { createSeoManager } from '@/ai/flows/create-seo-manager-flow';

export function SeoManagementDashboard() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [seoManagers, setSeoManagers] = useState<SEOManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchManagers = async () => {
    if (!firestore) return;
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

  useEffect(() => {
    fetchManagers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const handleCreateManager = async () => {
    setIsCreating(true);
    try {
      const managerCount = seoManagers.length + 1;
      const newManagerData = {
        email: `seo${managerCount}@hiringdekho.com`,
        password: `password${managerCount}`,
        firstName: `SEO`,
        lastName: `Manager ${managerCount}`,
      };
      
      const result = await createSeoManager(newManagerData);

      if (result.success) {
        toast({
          title: "SEO Manager Created",
          description: `Successfully created account for ${result.email}.`,
        });
        await fetchManagers(); // Refresh the list
      } else {
        throw new Error("Flow did not return success.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || 'Could not create SEO Manager.',
      });
    } finally {
      setIsCreating(false);
    }
  };


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
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SEO Manager Accounts</CardTitle>
              <CardDescription>
                  Create and manage users with SEO manager access.
              </CardDescription>
            </div>
             <Button onClick={handleCreateManager} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create New SEO Manager
            </Button>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Password</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                    ) : seoManagers && seoManagers.length > 0 ? (
                        seoManagers.map(manager => (
                            <TableRow key={manager.id}>
                                <TableCell>{manager.firstName} {manager.lastName}</TableCell>
                                <TableCell>{manager.email}</TableCell>
                                <TableCell className="font-mono">{manager.password}</TableCell>
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
                        <TableRow><TableCell colSpan={4} className="text-center h-24">No SEO Managers found. Click button above to create one.</TableCell></TableRow>
                    )}
                </TableBody>
             </Table>
        </CardContent>
    </Card>
  );
}
