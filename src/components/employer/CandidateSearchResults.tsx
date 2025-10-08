'use client';

import type { JobSeeker } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";

interface CandidateSearchResultsProps {
    results: JobSeeker[];
    hasSearched: boolean;
}

export function CandidateSearchResults({ results, hasSearched }: CandidateSearchResultsProps) {

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name[0] || 'U';
    };


    if (results.length === 0 && hasSearched) {
        return (
             <div className="text-center py-16 text-muted-foreground rounded-lg bg-secondary">
                <p className="font-semibold text-lg">No candidates found.</p>
                <p className="text-sm">Try adjusting your search filters to find the perfect hire.</p>
            </div>
        )
    }

     if (!hasSearched) {
        return (
             <div className="text-center py-16 text-muted-foreground rounded-lg bg-secondary">
                <p className="font-semibold text-lg">Find talent now.</p>
                <p className="text-sm">Use the filters above to start searching for candidates.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(candidate => (
                <Link href={`/employer/applicant/${candidate.id}`} key={candidate.id} className="block">
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar className="h-14 w-14 border">
                                <AvatarImage src={candidate.profilePictureUrl} />
                                <AvatarFallback className="text-xl">{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{candidate.firstName} {candidate.lastName}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    <MapPin className="h-4 w-4"/> {candidate.location || 'Not specified'}
                                </CardDescription>
                                <CardDescription className="flex items-center gap-1.5 mt-1">
                                    <Briefcase className="h-4 w-4"/> {candidate.experienceLevel || 'Not specified'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-wrap gap-2">
                                {candidate.skills?.slice(0, 5).map(skill => (
                                    <Badge key={skill.value} variant="secondary">{skill.value}</Badge>
                                ))}
                                 {candidate.skills && candidate.skills.length > 5 && (
                                    <Badge variant="outline">+{candidate.skills.length - 5} more</Badge>
                                 )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
