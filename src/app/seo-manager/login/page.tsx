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
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof loginSchema>;

export default function SeoManagerLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase Auth not available.' });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh to get latest claims

        // Check for SEO Manager claim
        if (idTokenResult.claims.isSeoManager) {
             const seoManagerData = {
                id: user.uid,
                email: user.email,
                firstName: user.displayName?.split(' ')[0] || 'SEO',
                lastName: user.displayName?.split(' ')[1] || 'Manager',
            };
            sessionStorage.setItem('seo-manager', JSON.stringify(seoManagerData));
            toast({ title: 'Login Successful', description: 'Welcome, SEO Manager!' });
            router.push('/seo-manager');
        } else {
             toast({ variant: 'destructive', title: 'Login Failed', description: 'This account does not have SEO Manager permissions.' });
        }
    } catch (error: any) {
         let errorMessage = "An unknown error occurred.";
         if (error.code) {
             switch (error.code) {
                 case 'auth/user-not-found':
                 case 'auth/invalid-email':
                    errorMessage = 'No account found with this email.';
                    break;
                 case 'auth/wrong-password':
                 case 'auth/invalid-credential':
                    errorMessage = 'Incorrect email or password. Please try again.';
                    break;
                 default:
                    errorMessage = error.message;
            }
         }
         toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

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
