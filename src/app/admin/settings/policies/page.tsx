
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { handleSearch, getAllPolicies } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileEdit, Loader2, FileQuestion, Search, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SearchSchema = z.object({
  searchTerm: z.string().min(1, { message: 'Please enter a search term.' }),
});

const POLICIES_PER_PAGE = 10;

export default function PolicyManagementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<{ results: Policy[] } | null>(null);
    const router = useRouter();

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / POLICIES_PER_PAGE);

    const form = useForm<z.infer<typeof SearchSchema>>({
        resolver: zodResolver(SearchSchema),
        defaultValues: {
            searchTerm: '',
        },
    });

    async function loadPolicies(page: number) {
        setIsLoading(true);
        setError(null);
        const response = await getAllPolicies(page, POLICIES_PER_PAGE);
        if (response.success && response.data) {
            setPolicies(response.data);
            setTotalCount(response.count || 0);
            setCurrentPage(page);
        } else {
            setError(response.error || 'Failed to load policies.');
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        loadPolicies(1);
    }, []);

    async function onSearch(values: z.infer<typeof SearchSchema>) {
        if (!values.searchTerm) {
            setSearchResults(null);
            loadPolicies(1);
            return;
        }
        setIsSearching(true);
        setError(null);
        setSearchResults(null);
        const response = await handleSearch(values.searchTerm);
        if (response.success && response.data) {
            setSearchResults(response.data);
        } else {
            setError(response.error || 'An unknown error occurred.');
        }
        setIsSearching(false);
    }

    function handleRowClick(policyNumber: string) {
        router.push(`/policy/${policyNumber}`);
    }
    
     function getStatus(endDate: string) {
        const today = new Date();
        const warrantyEndDate = parseISO(endDate);
        if (today > warrantyEndDate) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="secondary">Active</Badge>;
    }
    
    const policiesToShow = searchResults ? searchResults.results : policies;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileEdit /> Policy Management
                </h2>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Search Policies</CardTitle>
                    <CardDescription>
                        Find a specific warranty policy by its policy number, customer name, phone number, or tire DOT number.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSearch)} className="flex flex-col sm:flex-row items-start gap-4">
                             <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormField
                                control={form.control}
                                name="searchTerm"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="sr-only">Search Term</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Search policies..." {...field} className="pl-10" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                             <Button type="submit" disabled={isSearching} className="w-full sm:w-auto">
                                {isSearching ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Searching...
                                    </>
                                ) : (
                                    <>
                                    Search
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle>
                        {searchResults ? 'Search Results' : 'All Policies'}
                    </CardTitle>
                     <CardDescription>
                        {searchResults ? `Found ${searchResults.results.length} policies matching your search.` : `Showing page ${currentPage} of ${totalPages}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mt-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                                {error.includes("RLS") && <p className="mt-2 text-xs">Please visit your Supabase dashboard and ensure that you have enabled read access for authenticated users on your 'policies' table.</p>}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="relative min-h-[460px] overflow-x-auto">
                        {(isLoading || isSearching) && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        {policiesToShow.length > 0 ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Policy #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Tire DOT</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {policiesToShow.map((policy) => (
                                <TableRow 
                                    key={policy.policyNumber} 
                                    onClick={() => handleRowClick(policy.policyNumber)}
                                    className="cursor-pointer"
                                >
                                <TableCell className="font-medium whitespace-nowrap">{policy.policyNumber}</TableCell>
                                <TableCell>{policy.customerName}</TableCell>
                                <TableCell className="hidden md:table-cell">{policy.tireDot}</TableCell>
                                <TableCell className="whitespace-nowrap">{format(parseISO(policy.warrantyEndDate), 'PPP')}</TableCell>
                                <TableCell>{getStatus(policy.warrantyEndDate)}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        ) : (
                        !isLoading && !isSearching && (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
                                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-foreground">No policies found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {searchResults ? 'Your search did not match any policies.' : 'There are no policies in the system yet.'}
                                </p>
                            </div>
                        )
                        )}
                    </div>
                </CardContent>
                {!searchResults && totalPages > 1 && (
                    <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => loadPolicies(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => loadPolicies(currentPage + 1)}
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
