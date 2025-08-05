
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { getAllPolicies } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
import AdminLayout from '@/components/admin-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadPolicies() {
      setIsLoading(true);
      const response = await getAllPolicies();
      if (response.success && response.data) {
        setPolicies(response.data);
      } else {
        setError(response.error || 'An unknown error occurred.');
      }
      setIsLoading(false);
    }
    loadPolicies();
  }, []);

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

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary" />
                    All Warranty Policies
                </CardTitle>
                <CardDescription>A complete list of all registered warranties.</CardDescription>
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
                {!isLoading && !error && (
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Policy #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Tire DOT</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {policies.map((policy) => (
                            <TableRow 
                                key={policy.policyNumber} 
                                onClick={() => handleRowClick(policy.policyNumber)}
                                className="cursor-pointer"
                            >
                            <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                            <TableCell>{policy.customerName}</TableCell>
                            <TableCell>{policy.tireDot}</TableCell>
                            <TableCell>{format(parseISO(policy.purchaseDate), 'PPP')}</TableCell>
                            <TableCell>{format(parseISO(policy.warrantyEndDate), 'PPP')}</TableCell>
                            <TableCell>{getStatus(policy.warrantyEndDate)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                )}
                 {policies.length === 0 && !isLoading && !error && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No policies have been created yet.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
