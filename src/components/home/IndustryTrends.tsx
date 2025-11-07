'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Clock, Zap, Globe } from 'lucide-react';

const trends = [
  {
    icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
    title: "Tech Jobs Boom",
    description: "Software developer roles have seen 45% growth in the last quarter",
    stat: "+45%",
    trend: "up",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: "Remote Work",
    description: "62% of companies now offer flexible remote work options",
    stat: "62%",
    trend: "up",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
    title: "Salary Growth",
    description: "Average tech salaries have increased by 18% year-over-year",
    stat: "+18%",
    trend: "up",
    gradient: "from-yellow-500 to-amber-500"
  },
  {
    icon: <Clock className="h-8 w-8 text-purple-500" />,
    title: "Hiring Speed",
    description: "Average time-to-hire reduced from 45 to 28 days with AI matching",
    stat: "-38%",
    trend: "down",
    gradient: "from-purple-500 to-violet-500"
  },
  {
    icon: <Zap className="h-8 w-8 text-orange-500" />,
    title: "AI Adoption",
    description: "78% of recruiters now use AI tools for candidate screening",
    stat: "78%",
    trend: "up",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: <Globe className="h-8 w-8 text-indigo-500" />,
    title: "Global Talent",
    description: "Cross-border hiring has increased by 120% post-pandemic",
    stat: "+120%",
    trend: "up",
    gradient: "from-indigo-500 to-blue-500"
  }
];

const hotJobs = [
  { title: "Full Stack Developer", count: "2.4K", growth: "+32%", color: "bg-blue-100 text-blue-800" },
  { title: "Data Scientist", count: "1.8K", growth: "+45%", color: "bg-green-100 text-green-800" },
  { title: "UX Designer", count: "1.2K", growth: "+28%", color: "bg-purple-100 text-purple-800" },
  { title: "DevOps Engineer", count: "980", growth: "+38%", color: "bg-orange-100 text-orange-800" },
  { title: "Product Manager", count: "750", growth: "+22%", color: "bg-indigo-100 text-indigo-800" },
  { title: "Cloud Architect", count: "620", growth: "+51%", color: "bg-cyan-100 text-cyan-800" }
];

export function IndustryTrends() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Industry Insights & Trends
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stay ahead with real-time market data and hiring trends
          </p>
        </div>

        {/* Trend Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {trends.map((trend, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
                      {trend.icon}
                    </div>
                    <CardTitle className="text-lg">{trend.title}</CardTitle>
                  </div>
                  <span className={`text-sm font-bold ${
                    trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.stat}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{trend.description}</p>
                <div className="mt-3 w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${trend.gradient} transition-all duration-1000`}
                    style={{ width: trend.trend === 'up' ? '75%' : '40%' }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hot Jobs Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground">🔥 Hot Jobs Right Now</h3>
            <p className="text-muted-foreground">Most in-demand roles this month</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotJobs.map((job, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-card rounded-lg p-4 shadow-lg border-2 border-transparent hover:border-primary/30">
                  <h4 className="font-semibold text-foreground text-sm mb-2">{job.title}</h4>
                  <div className="text-2xl font-bold text-primary mb-1">{job.count}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${job.color}`}>
                    {job.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}