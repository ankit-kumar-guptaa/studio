'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { useAuth } from '@/hooks/useAuth';
import { createUser } from '@/ai/flows/create-user-flow';


const createManagerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormData = z.infer<typeof createManagerSchema>;

export default function CreateSeoManagerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthLoading } = useFirebase();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!isAdmin) {
      toast({ variant: 'destructive', title: 'Unauthorized', description: 'Only a Super Admin can create SEO Managers.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'seo-manager',
      });

      if (result.success) {
        toast({
          title: 'SEO Manager Created!',
          description: `Account for ${data.email} has been created successfully.`,
        });
        router.push('/admin?tab=management'); // Redirect to admin dashboard
      } else {
        throw new Error(result.error || 'Unknown error occurred.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-secondary">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  if (!isAdmin) {
     return (
         <div className="flex min-h-screen items-center justify-center bg-secondary">
            <Card className="mx-auto w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild><Link href="/login">Go to Login</Link></Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/admin" className="mb-4 inline-block">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">Create New SEO Manager</CardTitle>
          <CardDescription>
            This will create a new user with SEO Manager permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/admin?tab=management')}>Cancel</Button>
                <Button type="submit" className="gradient-professional" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Manager
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
