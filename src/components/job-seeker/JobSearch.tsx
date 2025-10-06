"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { featuredJobs } from "@/lib/data";
import { JobCard } from "../shared/JobCard";
import { Card } from "../ui/card";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { indianStatesAndCities } from "@/lib/locations";
import { useState } from "react";

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location.toLowerCase(),
    label: location,
}));

export function JobSearch() {
  const [location, setLocation] = useState("");
  
  return (
    <div className="space-y-8">
      <Card className="p-4">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="Keywords..." className="lg:col-span-2" />
          <Combobox
            options={locationOptions}
            value={location}
            onChange={setLocation}
            placeholder="Select Location..."
            searchPlaceholder="Search location..."
            emptyPlaceholder="Location not found."
           />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full gradient-saffron">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Search Results (4)</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
      </div>
    </div>
  );
}
