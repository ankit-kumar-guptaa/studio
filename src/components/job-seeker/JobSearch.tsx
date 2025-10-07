
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BellPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "../shared/JobCard";
import { Card } from "../ui/card";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { indianStatesAndCities } from "@/lib/locations";
import { useState, useEffect } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import type { JobPost } from "@/lib/types";
import { collection, query, doc, updateDoc, arrayUnion, orderBy, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location.toLowerCase(),
    label: location,
}));

export function JobSearch() {
  const { firestore, user, isUserLoading } = useFirebase();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [allJobs, setAllJobs] = useState<JobPost[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  const [keywords, setKeywords] = useState(searchParams.get('q') || "");
  const [location, setLocation] = useState(searchParams.get('loc') || "");
  const [category, setCategory] = useState(searchParams.get('cat') || "all");

  const jobsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobPosts'), orderBy('postDate', 'desc'));
  }, [firestore]);
  
  const { data: jobsData, isLoading: isLoadingJobs } = useCollection<JobPost>(jobsCollectionRef);

  useEffect(() => {
    if (!isLoadingJobs && jobsData) {
      setAllJobs(jobsData);
      // Initial search based on URL params or show all jobs
      handleSearch(jobsData, true);
    }
    if(!isLoadingJobs && !jobsData) {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsData, isLoadingJobs]);

  const handleSearch = (jobsToFilter: JobPost[], isInitialLoad = false) => {
    setIsLoading(true);
    let filtered = [...jobsToFilter];
    
    const currentKeywords = isInitialLoad ? searchParams.get('q') || "" : keywords;
    const currentLocation = isInitialLoad ? searchParams.get('loc') || "" : location;
    const currentCategory = isInitialLoad ? searchParams.get('cat') || "all" : category;

    if (currentKeywords) {
        const lowerKeywords = currentKeywords.toLowerCase();
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(lowerKeywords) ||
            job.description.toLowerCase().includes(lowerKeywords) ||
            job.companyName?.toLowerCase().includes(lowerKeywords)
        );
    }

    if (currentLocation) {
        filtered = filtered.filter(job => 
            job.location.toLowerCase().includes(currentLocation)
        );
    }

    if (currentCategory && currentCategory !== 'all') {
        filtered = filtered.filter(job =>
            job.category.toLowerCase() === currentCategory.toLowerCase()
        );
    }

    setFilteredJobs(filtered);
    setIsLoading(false);
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(allJobs);
  }

  const handleCreateAlert = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to create a job alert.",
      });
      return;
    }

    if (!keywords && !location) {
      toast({
        variant: "destructive",
        title: "Set Filters First",
        description: "Please enter keywords or select a location to create an alert.",
      });
      return;
    }

    setIsCreatingAlert(true);
    const userDocRef = doc(firestore!, 'jobSeekers', user.uid);
    try {
      await updateDoc(userDocRef, {
        jobAlerts: arrayUnion({ keywords, location }),
      });
      toast({
        title: "Job Alert Created!",
        description: "We'll notify you when new jobs match your criteria.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not create job alert.",
      });
    } finally {
      setIsCreatingAlert(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Card className="p-4 md:p-6 sticky top-20 z-40 bg-background/80 backdrop-blur-sm">
        <form onSubmit={onSearchSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full gradient-saffron lg:col-span-1">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button type="button" onClick={handleCreateAlert} variant="outline" className="w-full lg:col-span-1" disabled={isCreatingAlert || isUserLoading}>
            {isCreatingAlert ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BellPlus className="mr-2 h-4 w-4" />}
            Create Alert
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Job Listings ({filteredJobs.length})</h3>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job) => {
                   const plainJob = {
                      ...job,
                      postDate: job.postDate instanceof Date ? job.postDate.toISOString() : (job.postDate as any).toDate().toISOString(),
                    };
                  return (
                    <JobCard key={job.id} job={plainJob} />
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground rounded-lg bg-secondary">
                <p className="font-semibold text-lg">No jobs found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search filters or check back later.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
