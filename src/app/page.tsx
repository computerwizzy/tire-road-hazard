import WarrantyForm from '@/components/warranty-form';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            TireSafe Warranty
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Register your tire road hazard warranty and secure your peace of mind.
          </p>
        </header>
        <WarrantyForm />
      </div>
    </main>
  );
}
