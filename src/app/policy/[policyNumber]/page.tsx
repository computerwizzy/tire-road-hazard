
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { handleSearch } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, AlertCircle, FileText, User, Car, Disc3, Calendar, Tag, Image as ImageIcon, Printer, Store, Milestone, Phone, Hash, ShieldCheck, Truck, Mail, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function PolicyDetail({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined, icon: React.ElementType }) {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-2 mt-1 text-muted-foreground shrink-0" />
            <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-muted-foreground break-words">{String(value)}</p>
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
            if (!policyNumber) return;
            setIsLoading(true);
            const response = await handleSearch(policyNumber);
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

        fetchPolicy();
    }, [policyNumber]);

    function handleReprint() {
        const printWindow = window.open(`/policy/${policyNumber}/print`, '_blank');
        printWindow?.addEventListener('load', () => {
            setTimeout(() => {
                printWindow?.print();
            }, 100);
        });
    }

    const allTireDots = policy ? [
        policy.tireDot1,
        policy.tireDot2,
        policy.tireDot3,
        policy.tireDot4,
        policy.tireDot5,
        policy.tireDot6
    ].filter(dot => dot && dot.trim()) : [];
    
    const isPolicyActive = policy ? new Date() < parseISO(policy.warrantyEndDate) : false;

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 lg:p-12 bg-background">
            <div className="w-full max-w-4xl mx-auto">
                 <Button asChild variant="outline" className="mb-4 print-hidden">
                    <Link href="/admin/settings/policies">← Back to Search</Link>
                </Button>
                <Card>
                    <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                <FileText className="text-primary" /> Warranty Policy Details
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <CardDescription className="break-all">
                                    <span className="font-mono text-primary">{policyNumber}</span>
                                </CardDescription>
                                {policy && (
                                    isPolicyActive ? 
                                    <Badge variant="secondary">Active</Badge> : 
                                    <Badge variant="destructive">Expired</Badge>
                                )}
                           </div>
                        </div>
                         {policy && (
                            <Button variant="outline" onClick={handleReprint} className="mt-4 sm:mt-0 print-hidden">
                                <Printer className="mr-2 h-4 w-4" />
                                Reprint Policy
                            </Button>
                        )}
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
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2 mb-4">
                                        <User className="text-primary" />
                                        Customer &amp; Policy
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <PolicyDetail label="Customer Name" value={policy.customerName} icon={User} />
                                        <PolicyDetail label="Customer Email" value={policy.customerEmail} icon={Mail} />
                                        <PolicyDetail label="Customer Phone" value={policy.customerPhone} icon={Phone} />
                                        <PolicyDetail label="Policy Duration" value={policy.policyDuration ? `${policy.policyDuration} Year(s)`: 'N/A'} icon={Clock} />
                                        <PolicyDetail label="Warranty End Date" value={format(parseISO(policy.warrantyEndDate), 'PPP')} icon={Calendar} />
                                        <PolicyDetail label="Commercial Vehicle" value={policy.isCommercial ? 'Yes' : 'No'} icon={Truck} />
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2 mb-4">
                                        <Car className="text-primary" />
                                        Vehicle &amp; Tire
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <PolicyDetail label="Vehicle" value={`${policy.vehicleYear} ${policy.vehicleMake} ${policy.vehicleModel} ${policy.vehicleSubmodel || ''}`.trim()} icon={Car} />
                                        <PolicyDetail label="Mileage" value={policy.vehicleMileage?.toLocaleString()} icon={Milestone} />
                                        <PolicyDetail label="Tire Brand" value={policy.tireBrand} icon={Disc3} />
                                        <PolicyDetail label="Tire Model" value={policy.tireModel} icon={Disc3} />
                                        <PolicyDetail label="Tire Size" value={policy.tireSize} icon={Disc3} />
                                        <PolicyDetail label="Tires Purchased" value={policy.tireQuantity} icon={Hash} />
                                        <PolicyDetail label="Price Per Tire" value={policy.pricePerTire ? `$${policy.pricePerTire.toFixed(2)}` : 'N/A'} icon={Tag} />
                                         {allTireDots.map((dot, index) => (
                                            <PolicyDetail key={index} label={`Tire DOT #${index + 1}`} value={dot} icon={ShieldCheck} />
                                        ))}
                                    </div>
                                </div>
                                 <Separator />
                                <div>
                                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2 mb-4">
                                        <Store className="text-primary" />
                                        Purchase Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <PolicyDetail label="Dealer Name" value={policy.dealerName} icon={Store} />
                                        <PolicyDetail label="Invoice Number" value={policy.invoiceNumber} icon={Tag} />
                                        <PolicyDetail label="Purchase Date" value={format(parseISO(policy.purchaseDate), 'PPP')} icon={Calendar} />
                                    </div>
                                </div>


                                {policy.receiptUrl && (
                                     <div className="space-y-4">
                                        <Separator />
                                        <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                                            <ImageIcon className="text-primary" />
                                            Purchase Receipt
                                        </h3>
                                        <div className="border rounded-lg p-2 sm:p-4">
                                            <a href={policy.receiptUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                                <img 
                                                    src={policy.receiptUrl} 
                                                    alt="Purchase Receipt" 
                                                    className="max-w-full h-auto rounded-md shadow-md hover:opacity-80 transition-opacity"
                                                />
                                            </a>
                                            <Button asChild variant="link" className="mt-2 px-0">
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
