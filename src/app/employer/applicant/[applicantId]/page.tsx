
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobSeeker } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function ApplicantProfilePage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const router = useRouter();
    const params = useParams();
    const applicantId = params.applicantId as string;

    const applicantRef = useMemoFirebase(() => {
        if (!firestore || !applicantId) return null;
        return doc(firestore, 'jobSeekers', applicantId);
    }, [firestore, applicantId]);

    const { data: applicant, isLoading: isApplicantLoading } = useDoc<JobSeeker>(applicantRef);

    if (isUserLoading || isApplicantLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!applicant) {
        return (
             <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center bg-secondary">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Applicant Not Found</h1>
                        <p className="text-muted-foreground">The requested applicant profile does not exist.</p>
                        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name[0];
    };

    return (
        <div className="flex min-h-screen flex-col bg-secondary">
            <Header />
            <main className="flex-1 py-8 sm:py-12">
                <div className="container mx-auto max-w-4xl px-4">
                    <Card>
                        <CardHeader className="flex flex-col items-center justify-center space-y-4 text-center border-b p-8">
                             <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={undefined} /> 
                                <AvatarFallback className="text-3xl">{getInitials(`${applicant.firstName} ${applicant.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <CardTitle className="text-3xl">{applicant.firstName} {applicant.lastName}</CardTitle>
                                <CardDescription className="text-base text-muted-foreground">{applicant.location || 'Location not specified'}</CardDescription>
                            </div>
                             <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                <a href={`mailto:${applicant.email}`} className="inline-flex items-center text-sm gap-2 text-muted-foreground hover:text-primary"><Mail className="h-4 w-4" /> {applicant.email}</a>
                                {applicant.phone && <span className="inline-flex items-center text-sm gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {applicant.phone}</span>}
                                {applicant.resumeUrl && <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm gap-2 text-primary hover:underline"><FileText className="h-4 w-4" /> View Resume</a>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            
                            {applicant.summary && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Professional Summary</h3>
                                    <p className="text-muted-foreground">{applicant.summary}</p>
                                </div>
                            )}

                            {applicant.skills && applicant.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-primary"/> Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.skills.map(skill => <Badge key={skill.value} variant="secondary">{skill.value}</Badge>)}
                                    </div>
                                </div>
                            )}

                             {applicant.workExperience && applicant.workExperience.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Work Experience</h3>
                                    <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:h-full before:w-0.5 before:bg-border">
                                        {applicant.workExperience.map((exp, index) => (
                                            <div key={index} className="relative pl-4">
                                                <div className="absolute -left-7 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-secondary"></div>
                                                <p className="font-semibold text-lg">{exp.title}</p>
                                                <p className="text-primary">{exp.company}</p>
                                                <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</p>
                                                <p className="mt-2 text-sm text-foreground/80">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {applicant.education && applicant.education.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary"/> Education</h3>
                                    <div className="space-y-4">
                                        {applicant.education.map((edu, index) => (
                                            <div key={index}>
                                                <p className="font-semibold">{edu.degree}</p>
                                                <p className="text-muted-foreground">{edu.institution}</p>
                                                <p className="text-sm text-muted-foreground">Graduated: {edu.graduationYear}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ApplicantProfilePage;
