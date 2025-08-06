
'use client';

import { useState } from 'react';
import Link from 'next/link';
import WarrantyForm from '@/components/warranty-form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { WarrantyResult, type PolicyData } from './warranty-result';
import { handleWarrantyClaim } from '@/app/actions';

export default function MainPage() {
  const [testResult, setTestResult] = useState<PolicyData | null>(null);

  // This is a simplified test. In a real scenario, this would be a server call.
  // We are creating a sample policy document to display.
  const runTest = async () => {
     const testValues = {
        invoiceNumber: "TEST-12345",
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        customerPhone: "555-123-4567",
        customerStreet: "123 Main St",
        customerCity: "Anytown",
        customerState: "CA",
        customerZip: "12345",
        vehicleYear: 2023,
        vehicleMake: "Tesla",
        vehicleModel: "Model Y",
        vehicleSubmodel: "Long Range",
        vehicleMileage: 15000,
        isCommercial: false,
        tireBrand: "Michelin",
        tireModel: "Pilot Sport 4S",
        tireSize: "255/45R19",
        tireQuantity: 4,
        pricePerTire: 350,
        roadHazardPrice: 75,
        tireDot1: "DOTB3RVY8C4223",
        tireDot2: "DOTB3RVY8C4224",
        tireDot3: "DOTB3RVY8C4225",
        tireDot4: "DOTB3RVY8C4226",
        tireDot5: "",
        tireDot6: "",
        purchaseDate: new Date(),
        dealerName: "City Tire Center",
    };
    
    // We call the actual server action to ensure the template logic is tested.
    const response = await handleWarrantyClaim(testValues, null);
    if (response.success && response.data) {
       setTestResult({...response.data, formData: testValues});
    } else {
        // Handle error case if needed
        console.error("Test failed:", response.error);
        alert(`Test failed: ${response.error}`);
    }
  };

  const resetTest = () => {
    setTestResult(null);
  }

  if (testResult) {
      return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
            <div className="w-full max-w-4xl mx-auto">
                 <WarrantyResult result={testResult} onReset={resetTest} />
            </div>
        </main>
      )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
       <div className="absolute top-4 right-4">
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
            <Button onClick={runTest} variant="outline" className="w-full sm:w-auto">
                Run Layout Test
            </Button>
          </div>
        </header>
        <WarrantyForm />
      </div>
    </main>
  );
}
