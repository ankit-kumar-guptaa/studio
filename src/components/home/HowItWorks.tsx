import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FileText, Briefcase, Building, UserCheck, Search } from "lucide-react";

const seekerSteps = [
    {
        icon: <UserPlus className="h-10 w-10 text-primary" />,
        title: "Create Account",
        description: "Sign up for free and build your professional profile in minutes."
    },
    {
        icon: <Search className="h-10 w-10 text-primary" />,
        title: "Search & Apply",
        description: "Browse thousands of jobs and apply with a single click."
    },
    {
        icon: <UserCheck className="h-10 w-10 text-primary" />,
        title: "Get Hired",
        description: "Connect with top employers and land your dream job."
    }
];

const employerSteps = [
    {
        icon: <Building className="h-10 w-10 text-accent" />,
        title: "Post a Job",
        description: "Create a job listing with our simple form to reach thousands of candidates."
    },
    {
        icon: <FileText className="h-10 w-10 text-accent" />,
        title: "Review Applicants",
        description: "Manage and review applications from qualified candidates in one place."
    },
    {
        icon: <Briefcase className="h-10 w-10 text-accent" />,
        title: "Hire the Best",
        description: "Find the perfect match for your team and grow your business."
    }
];


export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple path to your next career move or your next great hire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
                <h3 className="text-2xl font-bold text-center mb-8 text-primary">For Job Seekers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {seekerSteps.map(step => (
                        <Card key={step.title} className="text-center">
                            <CardHeader>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                    {step.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg mb-2">{step.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-center mb-8 text-accent">For Employers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {employerSteps.map(step => (
                        <Card key={step.title} className="text-center">
                            <CardHeader>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                                    {step.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg mb-2">{step.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
