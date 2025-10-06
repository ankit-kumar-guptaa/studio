import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  const footerSections = [
    {
      title: 'Job Seekers',
      links: [
        { label: 'Search Jobs', href: '/job-seeker' },
        { label: 'Resume Builder', href: '#' },
        { label: 'Career Blog', href: '/blog' },
        { label: 'Job Alerts', href: '#' },
      ],
    },
    {
      title: 'Employers',
      links: [
        { label: 'Post a Job', href: '/employer' },
        { label: 'Manage Applicants', href: '#' },
        { label: 'Company Profile', href: '#' },
        { label: 'Analytics', href: '#' },
      ],
    },
    {
      title: 'Hiring Dekho',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Sitemap', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Disclaimer', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">Rozgaar ka Sahi Rasta</p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-headline font-bold uppercase tracking-wider text-foreground/90">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Hiring Dekho. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
            {socialLinks.map((social) => (
              <Link key={social.label} href={social.href} className="text-muted-foreground hover:text-primary">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
