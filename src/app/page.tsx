import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Wrench, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
       <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full mb-4">
            <Wrench className="h-10 w-10" />
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
