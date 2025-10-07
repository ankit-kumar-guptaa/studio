"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "../shared/JobCard";
import { Card } from "../ui/card";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { indianStatesAndCities } from "@/lib/locations";
import { useState, useEffect } from "react";
import { useFirebase } from "@/firebase";
import type { JobPost } from "@/lib/types";
import { collectionGroup, getDocs, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location.toLowerCase(),
    label: location,
}));

export function JobSearch() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const [allJobs, setAllJobs] = useState<(JobPost & { employerId: string })[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<(JobPost & { employerId: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [keywords, setKeywords] = useState(searchParams.get('q') || "");
  const [location, setLocation] = useState(searchParams.get('loc') || "");
  const [category, setCategory] = useState("");

  const fetchAllJobs = async () => {
    if (!firestore) return;
    setIsLoading(true);
    const jobs: (JobPost & { employerId: string })[] = [];
    const jobPostsQuery = query(collectionGroup(firestore, 'jobPosts'));
    const querySnapshot = await getDocs(jobPostsQuery);
    querySnapshot.forEach((doc) => {
      const employerId = doc.ref.parent.parent?.id;
      if(employerId) {
        jobs.push({ ...(doc.data() as JobPost), id: doc.id, employerId });
      }
    });
    setAllJobs(jobs);
    return jobs;
  };

  const handleSearch = (jobsToFilter: (JobPost & { employerId: string })[]) => {
    setIsLoading(true);
    let filtered = [...jobsToFilter];

    if (keywords) {
        const lowerKeywords = keywords.toLowerCase();
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(lowerKeywords) ||
            job.description.toLowerCase().includes(lowerKeywords) ||
            job.companyName?.toLowerCase().includes(lowerKeywords)
        );
    }

    if (location) {
        filtered = filtered.filter(job => 
            job.location.toLowerCase().includes(location)
        );
    }

    if (category) {
        filtered = filtered.filter(job =>
            job.category.toLowerCase() === category.toLowerCase()
        );
    }

    setFilteredJobs(filtered);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchAllJobs().then(jobs => {
      if(searchParams.get('q') || searchParams.get('loc')) {
        handleSearch(jobs);
      } else {
        setFilteredJobs(jobs);
        setIsLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);


  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(allJobs);
  }
  
  return (
    <div className="space-y-8">
      <Card className="p-4">
        <form onSubmit={onSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input 
            placeholder="Keywords..." 
            className="lg:col-span-2"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Combobox
            options={locationOptions}
            value={location}
            onChange={setLocation}
            placeholder="Select Location..."
            searchPlaceholder="Search location..."
            emptyPlaceholder="Location not found."
           />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full gradient-saffron">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Job Listings ({filteredJobs.length})</h3>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredJobs.map((job) => (
                    <JobCard key={`${job.id}-${job.employerId}`} job={job} employerId={job.employerId} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>No jobs found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search filters.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
