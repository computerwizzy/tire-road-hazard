
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Loader2, FileQuestion, AlertCircle, ShieldCheck } from 'lucide-react';
import type { Claim } from '@/ai/flows/search-policies';
import { getAllClaims } from '@/data/db-actions';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const runtime = 'edge';

type ClaimWithCustomer = Claim & { policies: { customerName: string } };

const CLAIMS_PER_PAGE = 10;

export default function AllClaimsPage() {
    const router = useRouter();
    const [claims, setClaims] = useState<ClaimWithCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / CLAIMS_PER_PAGE);

    async function loadClaims(page: number) {
        setIsLoading(true);
        setError(null);
        const response = await getAllClaims(page, CLAIMS_PER_PAGE);
        if (response.success && response.data) {
            setClaims(response.data);
            setTotalCount(response.count || 0);
            setCurrentPage(page);
        } else {
            setError(response.error || 'Failed to load claims.');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        loadClaims(1);
    }, []);

    function handleRowClick(policyNumber: string) {
        router.push(`/policy/${policyNumber}`);
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck /> All Claims
                </h2>
                <Button asChild>
                    <Link href="/admin/claims/search">
                        <PlusCircle className="mr-2" />
                        File New Claim
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Claims</CardTitle>
                    <CardDescription>
                        A list of all claims filed by customers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading Claims</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="relative min-h-[460px] overflow-x-auto">
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        {!isLoading && claims.length === 0 && !error ? (
                             <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
                                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-foreground">No Claims Found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    There have been no claims submitted yet.
                                </p>
                            </div>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Policy #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date Filed</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {claims.map((claim) => (
                                    <TableRow key={String(claim.id)} onClick={() => handleRowClick(claim.policy_number)} className="cursor-pointer">
                                        <TableCell className="font-mono">{claim.policy_number}</TableCell>
                                        <TableCell>{claim.policies?.customerName || 'N/A'}</TableCell>
                                        <TableCell>{format(parseISO(claim.created_at), 'PPP')}</TableCell>
                                        <TableCell>
                                            <Badge variant={claim.status === 'submitted' ? 'secondary' : 'default'}>
                                                {claim.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        )}
                    </div>
                </CardContent>
                {!isLoading && totalPages > 1 && (
                    <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => loadClaims(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => loadClaims(currentPage + 1)}
                                disabled={currentPage === totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
