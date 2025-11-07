'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: <Users className="h-8 w-8 text-primary" />, end: 50000, label: "Job Seekers Hired", suffix: "+" },
  { icon: <Briefcase className="h-8 w-8 text-accent" />, end: 10000, label: "Companies Registered", suffix: "+" },
  { icon: <TrendingUp className="h-8 w-8 text-green-500" />, end: 95, label: "Success Rate", suffix: "%" },
  { icon: <Award className="h-8 w-8 text-yellow-500" />, end: 25, label: "Cities Covered", suffix: "+" }
];

const successStories = [
  {
    name: "Rajesh Kumar",
    role: "Senior Software Engineer",
    company: "Tech Mahindra",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    story: "Got placed in my dream company within 2 weeks of using Hiring Dekho. The AI recommendations were spot on!"
  },
  {
    name: "Priya Sharma",
    role: "Marketing Manager",
    company: "HDFC Bank",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    story: "The single-click apply feature saved me hours. Landed 3 interviews in the first week itself!"
  },
  {
    name: "Amit Singh",
    role: "HR Director",
    company: "Infosys",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    story: "Found the perfect candidates for our tech team. The quality of applicants through Hiring Dekho is exceptional."
  }
];

function AnimatedCounter({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <span className="text-4xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function SuccessStories() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 to-secondary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success Stories That Inspire
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands who have found their dream jobs and perfect candidates through Hiring Dekho
          </p>
        </div>

        {/* Animated Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {stat.icon}
                </div>
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stories Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story, index) => (
            <Card key={index} className="text-center p-6 border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-0">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">{story.name}</h3>
                <p className="text-sm text-primary font-medium mb-1">{story.role}</p>
                <p className="text-xs text-muted-foreground mb-4">{story.company}</p>
                <p className="text-sm text-foreground italic">"{story.story}"</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-primary/30">
            Share Your Success Story
          </button>
        </div> */}
      </div>
    </section>
  );
}