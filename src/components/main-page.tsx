
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
        <path d="M6.34 2.16 4.93 4.93m14.14 0 1.41-2.77m-1.41 19.64 1.41 2.77M4.93 19.07l-1.41 2.77"/>
        <path d="M9 7.5a2.5 2.5 0 0 1 5 0V10c0 .83-.67 1.5-1.5 1.5h-2A1.5 1.5 0 0 1 9 10V7.5Z"/>
        <path d="M12 12v1.5a2.5 2.5 0 0 1-5 0V12"/>
        <path d="m14.5 12.5.5 2"/>
        <path d="m9.5 12.5-.5 2"/>
        <path d="M18 12h.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"/>
        <path d="M6 12h-.5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1"/>
        <path d="M12 2a10 10 0 0 0-10 10v0a10 10 0 0 0 10 10v0a10 10 0 0 0 10-10v0a10 10 0 0 0-10-10Z"/>
    </svg>
)


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
