
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { handleSearch, handleNewClaim } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, FileText, User, Car, ShieldAlert, CheckCircle, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const NewClaimSchema = z.object({
  policyNumber: z.string(),
  incidentDescription: z.string().min(10, { message: "Please provide a detailed description of the incident." }),
});

function NewClaimForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const policyNumber = searchParams.get('policyNumber');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [submissionResult, setSubmissionResult] = useState<{ success: boolean; data?: any; error?: string} | null>(null);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const form = useForm<z.infer<typeof NewClaimSchema>>({
        resolver: zodResolver(NewClaimSchema),
        defaultValues: {
            policyNumber: policyNumber || '',
            incidentDescription: '',
        },
    });

     useEffect(() => {
        async function fetchPolicy() {
            if (!policyNumber) {
                setError("No policy number provided.");
                setIsLoading(false);
                return;
            }
            const response = await handleSearch(policyNumber);
            if (response.success && response.data?.results.length) {
                const foundPolicy = response.data.results.find(p => p.policyNumber === policyNumber);
                if (foundPolicy) {
                    setPolicy(foundPolicy);
                } else {
                    setError('Policy not found.');
                }
            } else {
                setError(response.error || 'Failed to fetch policy data.');
            }
            setIsLoading(false);
        }
        fetchPolicy();
    }, [policyNumber]);

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });

    async function onSubmit(values: z.infer<typeof NewClaimSchema>) {
        setIsSubmitting(true);
        setError(null);

        const photosData: { buffer: string, contentType: string, fileName: string }[] = [];
        for (const fileInput of fileInputRefs.current) {
            const photoFile = fileInput?.files?.[0];
            if (photoFile) {
                const buffer = await toBase64(photoFile);
                photosData.push({
                    buffer,
                    contentType: photoFile.type,
                    fileName: photoFile.name
                });
            }
        }
        
        const response = await handleNewClaim(values, photosData);
        setSubmissionResult(response);
        if(response.error) {
            setError(response.error);
        }
        setIsSubmitting(false);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error && !policy) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/claims">Go Back</Link>
                    </Button>
                </div>
            </Alert>
        );
    }
    
    if (submissionResult?.success) {
        return (
            <Card>
                <CardHeader className="items-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <CardTitle className="text-2xl">Claim Submitted Successfully</CardTitle>
                    <CardDescription>
                        Your claim with ID <span className="font-mono text-primary">{submissionResult.data.claimId}</span> has been filed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p>We will review the details and get back to you shortly.</p>
                </CardContent>
                <CardFooter className="justify-center">
                     <Button asChild>
                        <Link href="/admin/claims">File Another Claim</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <ShieldAlert /> New Claim Details
                </CardTitle>
                <CardDescription>
                    You are filing a claim for policy <span className="font-mono text-primary">{policy?.policyNumber}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-lg">Policy Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2"><User className="text-muted-foreground" /> <span>{policy?.customerName}</span></div>
                        <div className="flex items-center gap-2"><Car className="text-muted-foreground" /> <span>{`${policy?.vehicleYear} ${policy?.vehicleMake} ${policy?.vehicleModel}`}</span></div>
                        <div className="flex items-center gap-2 col-span-full"><FileText className="text-muted-foreground" /> <span>{policy?.policyNumber}</span></div>
                    </div>
                </div>
                <Separator className="my-6" />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="incidentDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Incident Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what happened to the tire (e.g., ran over a nail, hit a pothole)."
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="space-y-4">
                            <FormLabel className="text-base">Upload Photos (Optional, up to 6)</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <FormItem key={index}>
                                        <FormLabel className="text-xs text-muted-foreground">Photo {index + 1}</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2 p-2 border rounded-md">
                                                <Upload className="text-muted-foreground h-4 w-4" />
                                                <Input 
                                                    type="file" 
                                                    ref={el => fileInputRefs.current[index] = el} 
                                                    accept="image/*"
                                                    className="text-xs file:mr-2 file:text-xs"
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                ))}
                            </div>
                        </div>
                        
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Submission Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <CardFooter className="px-0 justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Claim'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function NewClaimPage() {
    return (
        <div className="max-w-4xl mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6">
             <Suspense fallback={<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <NewClaimForm />
            </Suspense>
        </div>
    );
}
