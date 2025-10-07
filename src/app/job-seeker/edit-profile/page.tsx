'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function EditProfilePageContent() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-4">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>Keep your information up-to-date to attract the best opportunities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                        <p>The profile form is temporarily unavailable. We are working on fixing it.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function EditProfilePage() {
    return (
        <Suspense>
            <EditProfilePageContent />
        </Suspense>
    )
}
