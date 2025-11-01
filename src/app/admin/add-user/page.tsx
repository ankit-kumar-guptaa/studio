
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect } from 'react';

// Using discriminated union for conditional validation
const addUserSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('job-seeker'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address.'),
  }),
  z.object({
    userType: z.literal('employer'),
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().email('Please enter a valid email address.'),
  })
]);

type FormData = z.infer<typeof addUserSchema>;

export default function AddUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { userRole, isRoleLoading } = useUserRole();
  
  // Security check: redirect if not admin
  useEffect(() => {
    if (!isRoleLoading && userRole !== 'admin') {
      router.push('/super-admin/login');
    }
  }, [userRole, isRoleLoading, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userType: 'job-seeker',
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const selectedUserType = form.watch('userType');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      setIsLoading(false);
      return;
    }
    
    // Generate a new ID for the user document
    const newUserId = doc(collection(firestore, 'temp')).id;
    
    try {
      if (data.userType === 'job-seeker') {
        const { userType, ...jobSeekerData } = data;
        const userDocData = { ...jobSeekerData, id: newUserId };
        await setDoc(doc(firestore, 'jobSeekers', newUserId), userDocData);
      } else {
        const { userType, ...employerData } = data;
        const userDocData = { ...employerData, id: newUserId, firstName: data.companyName, lastName: '' };
        await setDoc(doc(firestore, 'employers', newUserId), userDocData);
      }

      toast({
        title: 'User Created',
        description: `A new ${data.userType.replace('-', ' ')} has been added to the system.`,
      });
      router.push('/admin');

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

  if (isRoleLoading || userRole !== 'admin') {
      return (
          <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Add New User"
          description="Manually add a job seeker or an employer to the platform."
        />
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Select the user type and fill in the required information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Select User Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                                field.onChange(value);
                                form.reset({
                                    userType: value as 'job-seeker' | 'employer',
                                    email: form.getValues('email') // Persist email if already entered
                                });
                            }}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="job-seeker" /></FormControl>
                              <FormLabel className="font-normal">Job Seeker</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="employer" /></FormControl>
                              <FormLabel className="font-normal">Employer</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedUserType === 'job-seeker' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First name</FormLabel><FormControl><Input placeholder="Max" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last name</FormLabel><FormControl><Input placeholder="Robinson" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </>
                  ) : (
                     <>
                        <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="InnovateTech Ltd." {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Company Email</FormLabel><FormControl><Input type="email" placeholder="contact@innovatetech.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" className="gradient-professional" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
