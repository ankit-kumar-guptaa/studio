
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { JobSeeker } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, FileText, IndianRupee, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

function ApplicantProfilePage() {
    const { firestore } = useFirebase();
    const { isAuthLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const applicantId = params.applicantId as string;
    const [applicant, setApplicant] = useState<JobSeeker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplicantData = async () => {
            if (!firestore || !applicantId) {
                setIsLoading(false);
                return;
            };

            setIsLoading(true);
            try {
                // First, try to get from jobSeekers collection
                let docRef = doc(firestore, 'jobSeekers', applicantId);
                let docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setApplicant({ ...docSnap.data() as JobSeeker, id: docSnap.id });
                } else {
                    // If not found, try to get from employers collection (for admin view of employer profile)
                    docRef = doc(firestore, 'employers', applicantId);
                    docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // Adapt employer data to look like a JobSeeker for display
                        const employerData = docSnap.data();
                        setApplicant({
                            id: docSnap.id,
                            firstName: employerData.companyName,
                            lastName: '(Employer)',
                            email: employerData.email,
                            profilePictureUrl: employerData.companyLogoUrl,
                            summary: employerData.companyDescription,
                            phone: employerData.phone,
                            location: 'N/A'
                        });
                    } else {
                        setApplicant(null);
                    }
                }

            } catch (error) {
                console.error("Error fetching applicant data:", error);
                setApplicant(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading) {
            fetchApplicantData();
        }

    }, [firestore, applicantId, isAuthLoading]);


    if (isLoading || isAuthLoading) {
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

    const getInitials = (firstName: string, lastName: string) => {
        if (lastName === '(Employer)') return `${firstName?.[0] || ''}${firstName?.[1] || ''}`.toUpperCase();
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <div className="flex min-h-screen flex-col bg-secondary">
            <Header />
            <main className="flex-1 py-8 sm:py-12">
                <div className="container mx-auto max-w-4xl px-4">
                    <Card>
                        <CardHeader className="flex flex-col items-center justify-center space-y-4 text-center border-b p-8">
                             <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={applicant.profilePictureUrl} /> 
                                <AvatarFallback className="text-3xl">{getInitials(applicant.firstName, applicant.lastName)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <CardTitle className="text-3xl">{applicant.firstName} {applicant.lastName}</CardTitle>
                                {applicant.experienceLevel && <CardDescription className="text-base text-muted-foreground capitalize flex items-center gap-2">
                                   <Briefcase className="h-4 w-4" /> {applicant.experienceLevel || 'Experience not specified'}
                                </CardDescription>}
                                {applicant.location && <CardDescription className="text-base text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {applicant.location || 'Location not specified'}
                                </CardDescription>}
                            </div>
                             <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                <a href={`mailto:${applicant.email}`} className="inline-flex items-center text-sm gap-2 text-muted-foreground hover:text-primary"><Mail className="h-4 w-4" /> {applicant.email}</a>
                                {applicant.phone && <span className="inline-flex items-center text-sm gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {applicant.phone}</span>}
                                {applicant.resumeUrl && <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm gap-2 text-primary hover:underline"><FileText className="h-4 w-4" /> View Resume</a>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                            
                            {applicant.summary && (
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Professional Summary</h3>
                                    <p className="text-muted-foreground">{applicant.summary}</p>
                                </div>
                            )}

                             {applicant.experienceLevel === 'experienced' && (
                                <>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary"/> Current Salary</h3>
                                    <p className="text-lg text-muted-foreground">{applicant.currentSalary || 'Not specified'}</p>
                                </div>
                                 <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Building className="h-5 w-5 text-primary"/> Current Company</h3>
                                    <p className="text-lg text-muted-foreground">{applicant.currentCompany || 'Not specified'}</p>
                                </div>
                                </>
                             )}


                            {applicant.skills && applicant.skills.length > 0 && (
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-primary"/> Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.skills.map((skill, index) => <Badge key={`skill-${skill.value}-${index}`} variant="secondary">{skill.value}</Badge>)}
                                    </div>
                                </div>
                            )}

                             {applicant.workExperience && applicant.workExperience.length > 0 && (
                                <div className="md:col-span-2">
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
                                <div className="md:col-span-2">
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
