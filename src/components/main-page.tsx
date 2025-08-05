
'use client';

import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const TireIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M19 12H5a2 2 0 0 0-2 2v4h18v-4a2 2 0 0 0-2-2Z" />
        <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
        <path d="M2 18h20" />
        <path d="M6 18C4.34 18 3 19.34 3 21" />
        <path d="M18 18c1.66 0 3 1.34 3 3" />
        <line x1="12" x2="12" y1="5" y2="12" />
        <line x1="5" x2="19" y1="9" y2="9" />
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
