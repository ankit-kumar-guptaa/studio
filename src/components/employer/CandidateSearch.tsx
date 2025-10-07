'use client';

import { useState } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, or, and } from "firebase/firestore";
import type { JobSeeker } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateSearchResults } from "./CandidateSearchResults";
import { indianStatesAndCities } from "@/lib/locations";
import { MultiSelectCombobox, type ComboboxOption } from "../ui/MultiSelectCombobox";

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location.toLowerCase(),
    label: location,
}));

export function CandidateSearch() {
    const { firestore } = useFirebase();
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<JobSeeker[]>([]);

    const [skills, setSkills] = useState('');
    const [locations, setLocations] = useState<string[]>([]);
    const [experience, setExperience] = useState('any');
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setIsLoading(true);
        setSearchResults([]);

        const candidatesRef = collection(firestore, 'jobSeekers');
        const queryConstraints = [];

        if (locations.length > 0) {
            queryConstraints.push(where('location', 'in', locations.map(l => l.charAt(0).toUpperCase() + l.slice(1))));
        }

        if (experience !== 'any') {
            if(experience === 'fresher') {
                queryConstraints.push(where('experienceLevel', '==', 'fresher'));
            } else {
                 queryConstraints.push(where('experienceLevel', '==', 'experienced'));
                 const [min, max] = experience.split('-').map(Number);
                 if (min >= 0) {
                    queryConstraints.push(where('experienceYears', '>=', min));
                 }
                 if (max) {
                    queryConstraints.push(where('experienceYears', '<=', max));
                 }
            }
        }
        
        let finalQuery;
        if (queryConstraints.length > 0) {
             finalQuery = query(candidatesRef, ...queryConstraints);
        } else {
            finalQuery = query(candidatesRef);
        }

        try {
            const querySnapshot = await getDocs(finalQuery);
            let candidates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as JobSeeker }));

            // Local filtering for skills, as Firestore doesn't support array-contains-any with multiple different fields
            if (skills) {
                const skillKeywords = skills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
                if (skillKeywords.length > 0) {
                    candidates = candidates.filter(c => 
                        c.skills?.some(s => skillKeywords.some(kw => s.value.toLowerCase().includes(kw)))
                    );
                }
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
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                     <Input 
                        placeholder="Skills (e.g., React, Java)" 
                        className="lg:col-span-1"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                    <MultiSelectCombobox
                        options={locationOptions}
                        selected={locations}
                        onChange={setLocations}
                        placeholder="Select locations..."
                        searchPlaceholder="Search location..."
                        emptyPlaceholder="Location not found."
                        className="lg:col-span-1"
                    />
                    <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                        <SelectValue placeholder="Experience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any Experience</SelectItem>
                            <SelectItem value="fresher">Fresher</SelectItem>
                            <SelectItem value="0-2">0-2 years (Exp.)</SelectItem>
                            <SelectItem value="2-5">2-5 years (Exp.)</SelectItem>
                            <SelectItem value="5-10">5-10 years (Exp.)</SelectItem>
                            <SelectItem value="10-100">10+ years (Exp.)</SelectItem>
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
