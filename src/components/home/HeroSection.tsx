'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { indianStatesAndCities } from '@/lib/locations';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location.toLowerCase(),
    label: location,
}));


export function HeroSection() {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keywords) {
      params.set('q', keywords);
    }
    if (location) {
      params.set('loc', location);
    }
    router.push(`/find-jobs?${params.toString()}`);
  };


  return (
    <section className="relative overflow-hidden bg-secondary py-20 md:py-32">
       <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
      ></div>
      <div className="container relative z-10 mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Find Your Next Big Opportunity
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary md:text-xl font-bold font-headline">
          Rozgaar ka Sahi Rasta – Hiring Dekho
        </p>
        <div className="mx-auto mt-10 max-w-4xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 shadow-2xl sm:grid-cols-2 md:grid-cols-3 md:p-6">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                className="w-full pl-10"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <Combobox
              options={locationOptions}
              value={location}
              onChange={setLocation}
              placeholder="City, state, or remote"
              searchPlaceholder="Search location..."
              emptyPlaceholder="Location not found."
            />
            <Button type="submit" className="w-full gradient-saffron shadow-lg hover:shadow-primary/50 md:col-span-1 sm:col-span-2">
              <Search className="mr-2 h-5 w-5" />
              Search Jobs
            </Button>
          </form>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Trending Searches:</span>
          <span>Software Engineer,</span>
          <span>Marketing,</span>
          <span>Remote,</span>
          <span>Bangalore</span>
        </div>
      </div>
    </section>
  );
}
