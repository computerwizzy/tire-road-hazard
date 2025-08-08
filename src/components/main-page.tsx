
'use client';

import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

export default function MainPage() {

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
       <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/login">
              <User className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Admin Login</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="mb-4">
            <Image 
                src="https://evsportline.com/cdn/shop/files/t-sportline-tire-protection-program-02_c23e898f-b885-43bd-8415-21380b9ed17c_4000x.progressive.jpg"
                alt="Tire Protection Program"
                width={200}
                height={200}
                className="mx-auto rounded-lg shadow-md"
                data-ai-hint="tire tread"
            />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Tires & Engine Performance
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Register your tire road hazard warranty and secure your peace of mind.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="w-full sm:w-auto">
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
