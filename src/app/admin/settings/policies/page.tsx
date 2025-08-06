
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { handleSearch } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileEdit, Loader2, FileQuestion, Search, AlertCircle, Printer } from 'lucide-react';

const SearchSchema = z.object({
  searchTerm: z.string().min(1, { message: 'Please enter a search term.' }),
});

export default function PolicyManagementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<{ results: Policy[] } | null>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof SearchSchema>>({
        resolver: zodResolver(SearchSchema),
        defaultValues: {
        searchTerm: '',
        },
    });

    async function onSubmit(values: z.infer<typeof SearchSchema>) {
        setIsLoading(true);
        setError(null);
        setResults(null);
        const response = await handleSearch(values.searchTerm);
        if (response.success && response.data) {
        setResults(response.data);
        } else {
        setError(response.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    }

    function handleRowClick(policyNumber: string) {
        router.push(`/policy/${policyNumber}`);
    }

    function handleTestLayout(e: React.MouseEvent, policyNumber: string) {
        e.stopPropagation(); // Prevents the row's onClick from firing
        window.open(`/policy/${policyNumber}/print`, '_blank');
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileEdit /> Policy Management
                </h2>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Search Policies</CardTitle>
                    <CardDescription>
                        Find a specific warranty policy by its policy number, customer name, or tire DOT number.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                            <FormField
                            control={form.control}
                            name="searchTerm"
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                <FormLabel className="sr-only">Search Term</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Policy #, Customer Name, or Tire DOT..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Searching...
                                    </>
                                ) : (
                                    <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                     {error && (
                        <Alert variant="destructive" className="mt-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Searching Policies</AlertTitle>
                            <AlertDescription>
                                {error}
                                {error.includes("RLS") && <p className="mt-2 text-xs">Please visit your Supabase dashboard and ensure that you have enabled read access for authenticated users on your 'policies' table.</p>}
                            </AlertDescription>
                        </Alert>
                    )}

                    {results && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">Search Results</h3>
                            {results.results.length > 0 ? (
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Policy #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Tire DOT</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {results.results.map((policy) => (
                                    <TableRow 
                                        key={policy.policyNumber} 
                                        onClick={() => handleRowClick(policy.policyNumber)}
                                        className="cursor-pointer"
                                    >
                                    <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                                    <TableCell>{policy.customerName}</TableCell>
                                    <TableCell>{policy.tireDot}</TableCell>
                                    <TableCell>{format(parseISO(policy.warrantyEndDate), 'PPP')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={(e) => handleTestLayout(e, policy.policyNumber)}
                                        >
                                           <Printer className="mr-2 h-4 w-4" />
                                           Test Layout
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
                                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-foreground">No policies found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Your search did not match any warranty policies.</p>
                            </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
