'use client';

import { useState } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { JobSeeker } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateSearchResults } from "./CandidateSearchResults";

export function CandidateSearch() {
    const { firestore } = useFirebase();
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<JobSeeker[]>([]);

    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('any');
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setIsLoading(true);
        setSearchResults([]);

        let q = query(collection(firestore, 'jobSeekers'));

        // Since Firestore doesn't support array-contains-any for sub-properties or partial string matches in arrays,
        // we will fetch based on broader criteria and filter locally. This is not ideal for large datasets but works for this scope.
        if (experienceLevel !== 'any') {
            q = query(q, where('experienceLevel', '==', experienceLevel));
        }

        try {
            const querySnapshot = await getDocs(q);
            let candidates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as JobSeeker }));

            // Local filtering for skills and location
            if (skills) {
                const skillKeywords = skills.toLowerCase().split(',').map(s => s.trim());
                candidates = candidates.filter(c => 
                    c.skills?.some(s => skillKeywords.some(kw => s.value.toLowerCase().includes(kw)))
                );
            }
            
            if (location) {
                const lowerLocation = location.toLowerCase();
                 candidates = candidates.filter(c => 
                    c.location?.toLowerCase().includes(lowerLocation)
                );
            }

            setSearchResults(candidates);
        } catch (error) {
            console.error("Error searching candidates:", error);
        } finally {
            setIsLoading(false);
        }

    }


    return (
        <div className="space-y-8">
             <Card className="p-4 md:p-6 sticky top-20 z-40 bg-background/80 backdrop-blur-sm">
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                     <Input 
                        placeholder="Skills (e.g., React, Java)" 
                        className="lg:col-span-1"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                    <Input 
                        placeholder="Location" 
                        className="lg:col-span-1"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger>
                        <SelectValue placeholder="Experience Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any Experience</SelectItem>
                            <SelectItem value="fresher">Fresher</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" className="w-full gradient-saffron">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search Candidates
                    </Button>
                </form>
             </Card>

             {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
             ) : (
                <CandidateSearchResults results={searchResults} />
             )}
        </div>
    )

}
