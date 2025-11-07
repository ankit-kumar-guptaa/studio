'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, query, getDocs } from 'firebase/firestore';
import type { SEOManager } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { v4 as uuidv4 } from 'uuid';
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
import { useAuth } from '@/hooks/useAuth';


const seoManagerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SeoManagerFormData = z.infer<typeof seoManagerSchema>;

export function SeoManagementDashboard() {
  const { firestore } = useFirebase();
  const { isAdmin, isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [seoManagers, setSeoManagers] = useState<SEOManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if the auth state is resolved and the user is an admin.
    if (!isAuthLoading && isAdmin && firestore) {
      const fetchManagers = async () => {
        setIsLoading(true);
        try {
          const seoManagersQuery = query(collection(firestore, 'seoManagers'));
          const snapshot = await getDocs(seoManagersQuery);
          const managers = snapshot.docs.map(doc => doc.data() as SEOManager);
          setSeoManagers(managers);
        } catch (error: any) {
          console.error("Error fetching SEO managers:", error);
          toast({ variant: 'destructive', title: 'Fetch Failed', description: error.message });
        } finally {
          setIsLoading(false);
        }
      };
      fetchManagers();
    } else if (!isAuthLoading) {
      // If auth is resolved but user is not admin, stop loading.
      setIsLoading(false);
    }
  }, [isAdmin, isAuthLoading, firestore, toast]);
  

  const form = useForm<SeoManagerFormData>({
    resolver: zodResolver(seoManagerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SeoManagerFormData) {
    if (!firestore) return;
    setIsCreating(true);

    const newId = uuidv4();
    const managerData: SEOManager = {
        id: newId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
    };

    try {
      await setDoc(doc(firestore, 'seoManagers', newId), managerData);
      toast({
        title: 'SEO Manager Created',
        description: 'The new SEO manager account has been created.',
      });
      form.reset();
      setSeoManagers(prev => [...prev, managerData]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  }

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

  const displayLoading = isLoading || isAuthLoading;

  return (
    <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Create SEO Manager Account</CardTitle>
                <CardDescription>Create a new user account with access to SEO tools.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Create Account
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Existing SEO Managers</CardTitle>
                <CardDescription>List of all users with SEO manager access.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {displayLoading ? (
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
    </div>
  );
}
