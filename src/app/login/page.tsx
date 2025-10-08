'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof loginSchema>;

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const fromUrl = searchParams.get('from') || '/';


  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSuccessfulLogin = async (user: User) => {
    if (!firestore) return;

    if (user.email === SUPER_ADMIN_EMAIL) {
        router.push('/admin');
        return;
    }

    const employerRef = doc(firestore, 'employers', user.uid);
    const employerSnap = await getDoc(employerRef);
    if (employerSnap.exists()) {
      router.push(fromUrl !== '/' ? fromUrl : '/employer');
      return;
    }
    
    const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
    const jobSeekerSnap = await getDoc(jobSeekerRef);
    if (jobSeekerSnap.exists()) {
      router.push(fromUrl !== '/' ? fromUrl : '/job-seeker');
      return;
    }
    
    // This case handles users who signed up with Google but haven't selected a role yet.
    setGoogleUser(user);
    setIsRoleSelectionOpen(true);
  };


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (!userCredential.user.emailVerified) {
        toast({
          variant: 'destructive',
          title: 'Email Not Verified',
          description: 'Please verify your email before logging in. Check your inbox for the verification link.',
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      await handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred.';
      if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
            default:
                errorMessage = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }
      const result = await signInWithPopup(auth, provider);
      toast({
        title: 'Login Successful',
        description: 'Welcome!',
      });
      await handleSuccessfulLogin(result.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelected = async (role: 'job-seeker' | 'employer') => {
    if (!googleUser || !firestore) return;

    setIsLoading(true);
    const [firstName, lastName] = googleUser.displayName?.split(' ') || ['New', 'User'];
    const userData = {
        id: googleUser.uid,
        email: googleUser.email,
        firstName,
        lastName,
    };

    try {
        if (role === 'job-seeker') {
            await setDoc(doc(firestore, 'jobSeekers', googleUser.uid), userData, { merge: true });
            router.push('/job-seeker');
        } else {
            await setDoc(doc(firestore, 'employers', googleUser.uid), { ...userData, companyName: `${firstName}'s Company` }, { merge: true });
            router.push('/employer');
        }
        toast({
            title: 'Profile Created',
            description: `Welcome to Hiring Dekho!`,
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Profile Creation Failed',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
        setIsRoleSelectionOpen(false);
    }
  };


  return (
    <>
      <RoleSelectionDialog 
        isOpen={isRoleSelectionOpen}
        onOpenChange={setIsRoleSelectionOpen}
        onRoleSelect={handleRoleSelected}
      />
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <Link href="/" className="mb-4 inline-block">
              <Logo />
            </Link>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
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
                        <Input type="email" placeholder="m@example.com" {...field} />
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
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gradient-saffron" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </Form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              Login with Google
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
