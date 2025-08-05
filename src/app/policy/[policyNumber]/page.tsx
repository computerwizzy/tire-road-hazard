
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { handleSearch } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertCircle, FileText, User, Car, Disc3, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function PolicyDetail({ label, value, icon: Icon }: { label: string; value: string | null | undefined, icon: React.ElementType }) {
    if (!value) return null;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
            <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-muted-foreground">{value}</p>
            </div>
        </div>
    );
}


export default function PolicyPage() {
    const params = useParams();
    const policyNumber = params.policyNumber as string;
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPolicy() {
            setIsLoading(true);
            const response = await handleSearch({ searchTerm: policyNumber });
            if (response.success && response.data?.results && response.data.results.length > 0) {
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

        if (policyNumber) {
            fetchPolicy();
        }
    }, [policyNumber]);

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
            <div className="w-full max-w-4xl">
                 <Button asChild variant="outline" className="mb-4">
                    <Link href="/search">← Back to Search</Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                           <FileText className="text-primary" /> Warranty Policy Details
                        </CardTitle>
                        <CardDescription>
                            Viewing details for policy number: <span className="font-mono text-primary">{policyNumber}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center h-40 text-destructive">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p className="font-semibold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        {policy && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PolicyDetail icon={User} label="Customer Name" value={policy.customerName} />
                                    <PolicyDetail icon={User} label="Customer Email" value={policy.customerEmail} />
                                    <PolicyDetail icon={Disc3} label="Tire DOT Number" value={policy.tireDot} />
                                    <PolicyDetail icon={Calendar} label="Purchase Date" value={format(parseISO(policy.purchaseDate), 'PPP')} />
                                    <PolicyDetail icon={Calendar} label="Warranty End Date" value={format(parseISO(policy.warrantyEndDate), 'PPP')} />
                                </div>
                                {policy.receiptUrl && (
                                     <div>
                                        <h3 className="font-headline text-lg font-semibold flex items-center gap-2 mb-4">
                                            <ImageIcon className="text-primary" />
                                            Purchase Receipt
                                        </h3>
                                        <div className="border rounded-lg p-4">
                                            <a href={policy.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                <img 
                                                    src={policy.receiptUrl} 
                                                    alt="Purchase Receipt" 
                                                    className="max-w-full h-auto rounded-md shadow-md hover:opacity-80 transition-opacity"
                                                />
                                            </a>
                                            <Button asChild variant="link" className="mt-2">
                                                 <a href={policy.receiptUrl} target="_blank" rel="noopener noreferrer">View Full Size</a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
