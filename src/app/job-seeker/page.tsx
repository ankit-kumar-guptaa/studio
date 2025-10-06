import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JobSeekerDashboard } from "@/components/job-seeker/JobSeekerDashboard";

export default function JobSeekerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <JobSeekerDashboard />
      </main>
      <Footer />
    </div>
  );
}
