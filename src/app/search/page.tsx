
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { handleSearch } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Loader2, FileQuestion } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Policy } from '@/ai/flows/search-policies';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

const SearchSchema = z.object({
  searchTerm: z.string().min(1, { message: 'Please enter a search term.' }),
});

export default function SearchPage() {
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

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-4xl">
         <Button asChild variant="outline" className="mb-4">
            <Link href="/">← Back to Registration</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Search className="text-primary" />
              Search Warranty Policies
            </CardTitle>
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
                        <Input placeholder="Enter Policy Number, Customer Name, or Tire DOT..." {...field} />
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
                    'Search'
                  )}
                </Button>
              </form>
            </Form>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {results && (
              <div className="mt-8">
                {results.results.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tire DOT</TableHead>
                        <TableHead>Expires</TableHead>
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
    </main>
  );
}
