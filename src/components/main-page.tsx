
'use client';

import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const TireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="currentColor">
            {/* Car Body */}
            <rect x="30" y="40" width="120" height="30" />
            <rect x="40" y="30" width="60" height="10" />
            <rect x="90" y="30" width="60" height="10" />

            {/* Wheels (using a contrasting color from the theme) */}
            <circle cx="60" cy="40" r="15" fill="hsl(var(--background))" />
            <circle cx="140" cy="40" r="15" fill="hsl(var(--background))" />

            {/* Tires */}
            <ellipse cx="60" cy="40" rx="12" ry="8" />
            <ellipse cx="140" cy="40" rx="12" ry="8" />

            {/* Road Hazard Icon */}
            <rect x="140" y="50" width="10" height="10" fill="hsl(var(--background))" />
            <rect x="140" y="60" width="10" height="5" fill="hsl(var(--background))" />
            <rect x="140" y="70" width="10" height="5" fill="hsl(var(--background))" />
        </g>
    </svg>
);


export default function MainPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
       <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full mb-4">
            <TireIcon className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Tires & Engine Performance
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Register your tire road hazard warranty and secure your peace of mind.
          </p>
          <div className="mt-6">
            <Button asChild>
                <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Search for a Warranty
                </Link>
            </Button>
          </div>
        </header>
        <WarrantyForm />
      </div>
    </main>
  );
}
