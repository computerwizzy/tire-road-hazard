
'use client';

import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MainPage() {

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Warranty Registration
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Register a new tire road hazard warranty.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link href="/admin/settings/policies">
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
