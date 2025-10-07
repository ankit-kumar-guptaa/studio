// This component is not currently used, but kept for potential future use.
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { topCompanies } from '@/lib/data';
import type { Company } from '@/lib/types';

async function getTopCompanies(): Promise<Company[]> {
  return topCompanies;
}

export async function TopCompanies() {
  const companies = await getTopCompanies();

  return (
    <section id="top-companies" className="bg-secondary py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Top Companies Hiring Now
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get hired by the most sought-after companies in the industry.
          </p>
        </div>
        {companies.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {companies.map((company) => {
              const companyLogo = company.logo ? findImage(company.logo) : findImage('company-logo-1');
              return (
                <Link href="#" key={company.id}>
                  <Card className="group flex h-full flex-col items-center justify-center p-4 text-center transition-all hover:bg-card hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center justify-center p-0">
                      {companyLogo && (
                        <Image
                          src={companyLogo.imageUrl}
                          alt={`${company.name} logo`}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-contain transition-transform group-hover:scale-110 border"
                          data-ai-hint={companyLogo.imageHint}
                        />
                      )}
                      <h3 className="mt-4 font-semibold text-foreground">{company.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center text-muted-foreground">
             <p>No companies available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
