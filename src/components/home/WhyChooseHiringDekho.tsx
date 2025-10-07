import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, BrainCircuit, Search } from "lucide-react";

const features = [
    {
        icon: <Zap className="h-8 w-8 text-primary" />,
        title: "Fast & Efficient",
        description: "Apply to jobs with a single click. Get discovered by top employers looking for your skills."
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "AI-Powered Assistance",
        description: "From AI-powered resume building to personalized job recommendations, we help you stand out."
    },
    {
        icon: <Search className="h-8 w-8 text-primary" />,
        title: "Advanced Search",
        description: "Powerful and intuitive search filters to help you find the perfect job or the ideal candidate."
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Built for India",
        description: "A platform designed from the ground up with the Indian job market in mind."
    }
];

export function WhyChooseHiringDekho() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Hiring Dekho?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The smartest way to navigate your career path or build your dream team.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map(feature => (
                <Card key={feature.title} className="text-center border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            {feature.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
