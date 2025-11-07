'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { createUser } from '@/ai/flows/create-user-flow';

export default function CreateSuperAdminPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateSuperAdmin = async () => {
        setIsLoading(true);
        try {
            const result = await createUser({
                email: 'support@itsahayata.com',
                password: 'admin@123',
                firstName: 'Super',
                lastName: 'Admin',
                role: 'admin',
            });
            
            if (result.success) {
                toast({
                    title: "Super Admin Account Created!",
                    description: "You can now log in with the admin credentials."
                });
                router.push('/login');
            } else if (result.error?.includes('EMAIL_EXISTS')) {
                toast({
                    variant: "secondary",
                    title: "Admin Already Exists",
                    description: "The super admin account has already been created. You can proceed to login."
                });
            } else {
                 throw new Error(result.error || 'An unknown error occurred during creation.');
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Admin Creation Failed",
                description: error.message
            });
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
                    <CardTitle className="text-2xl">Create Super Admin</CardTitle>
                    <CardDescription>
                        This page will create the primary super administrator account for the website. This should only be done once.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                    <Button onClick={handleCreateSuperAdmin} className="w-full" variant="destructive" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Super Admin Account
                    </Button>
                    <Button asChild variant="link" className="w-full">
                        <Link href="/login">Go to Login Page</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
