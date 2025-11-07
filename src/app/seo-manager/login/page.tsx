'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Logo } from '@/components/icons/Logo';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { SEOManager } from '@/lib/types';


const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof loginSchema>;

export default function SeoManagerLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isSeoManager, loginAsSeoManager, isAuthLoading } = useAuth();
  const { firestore } = useFirebase();

  useEffect(() => {
    if (!isAuthLoading && isSeoManager) {
      router.push('/seo-manager');
    }
  }, [isSeoManager, isAuthLoading, router]);


  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
        setIsLoading(false);
        return;
    }

    try {
        const q = query(collection(firestore, 'seoManagers'), where('email', '==', data.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'No account found with this email.' });
            setIsLoading(false);
            return;
        }

        const seoManagerDoc = querySnapshot.docs[0];
        const seoManagerData = seoManagerDoc.data() as SEOManager;

        if (seoManagerData.password === data.password) {
            loginAsSeoManager(seoManagerData);
            toast({ title: 'Login Successful', description: 'Welcome, SEO Manager!' });
            router.push('/seo-manager');
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password.' });
        }
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'An Error Occurred', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isAuthLoading || isSeoManager) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-block">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">SEO Manager Login</CardTitle>
          <CardDescription>
            Access the SEO dashboard to manage content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gradient-professional" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
