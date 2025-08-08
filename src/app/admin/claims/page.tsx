
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { handleSearch } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, AlertCircle, FileQuestion, ShieldCheck } from 'lucide-react';

const SearchSchema = z.object({
  policyNumber: z.string().min(1, { message: 'Please enter a policy number.' }),
});

export default function ClaimsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [policy, setPolicy] = useState<Policy | null>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof SearchSchema>>({
        resolver: zodResolver(SearchSchema),
        defaultValues: {
            policyNumber: '',
        },
    });

    async function onSearch(values: z.infer<typeof SearchSchema>) {
        setIsLoading(true);
        setError(null);
        setPolicy(null);

        const response = await handleSearch(values.policyNumber);
        
        if (response.success && response.data?.results.length) {
            const foundPolicy = response.data.results.find(p => p.policyNumber === values.policyNumber);
            if (foundPolicy) {
                setPolicy(foundPolicy);
            } else {
                 setError(`No policy found with the number "${values.policyNumber}". Please check the number and try again.`);
            }
        } else {
            setError(response.error || `No policy found with the number "${values.policyNumber}". Please check the number and try again.`);
        }
        setIsLoading(false);
    }
    
    function handleFileClaim() {
        if (policy) {
            router.push(`/admin/claims/new?policyNumber=${policy.policyNumber}`);
        }
    }

    return (
        <div className="max-w-7xl mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck /> File a Claim
                </h2>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Find Warranty Policy</CardTitle>
                    <CardDescription>
                        Enter a policy number below to find the warranty and file a claim.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSearch)} className="flex flex-col sm:flex-row items-start gap-4">
                             <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormField
                                    control={form.control}
                                    name="policyNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Policy Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Policy Number (e.g., TS-ABC123)" {...field} className="pl-10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Searching...
                                    </>
                                ) : 'Find Policy'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
            {error && !policy && (
                <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Search Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {policy && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Policy Found</CardTitle>
                        <CardDescription>Review the policy details below before filing a claim.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold text-muted-foreground">Policy #:</span> {policy.policyNumber}</div>
                            <div><span className="font-semibold text-muted-foreground">Customer:</span> {policy.customerName}</div>
                            <div><span className="font-semibold text-muted-foreground">Vehicle:</span> {`${policy.vehicleYear} ${policy.vehicleMake} ${policy.vehicleModel}`}</div>
                            <div><span className="font-semibold text-muted-foreground">Tires:</span> {`${policy.tireBrand} ${policy.tireModel} (${policy.tireSize})`}</div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleFileClaim}>
                            File Claim for this Policy
                        </Button>
                    </CardFooter>
                </Card>
            )}

             {!policy && !isLoading && !error && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
                    <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">Waiting for Search</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter a policy number above to begin.
                    </p>
                </div>
            )}
        </div>
    );
}
```