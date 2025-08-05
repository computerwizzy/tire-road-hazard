
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, isAfter } from 'date-fns';
import { FileText, Loader2, AlertCircle, Users, ShieldCheck, ShieldX, PlusCircle } from 'lucide-react';
import { getAllPolicies } from '@/app/actions';
import type { Policy } from '@/ai/flows/search-policies';
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
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

export default function AdminPage({ user }: { user: User }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    async function loadPolicies() {
      setIsLoading(true);
      const response = await getAllPolicies();
      if (response.success && response.data) {
        const fetchedPolicies = response.data;
        setPolicies(fetchedPolicies);
        
        const today = new Date();
        const active = fetchedPolicies.filter(p => isAfter(parseISO(p.warrantyEndDate), today)).length;
        const expired = fetchedPolicies.length - active;
        const customers = new Set(fetchedPolicies.map(p => p.customerEmail)).size;
        
        setStats({
          totalPolicies: fetchedPolicies.length,
          activePolicies: active,
          expiredPolicies: expired,
          totalCustomers: customers,
        });

      } else {
        setError(response.error || 'An unknown error occurred.');
      }
      setIsLoading(false);
    }
    // Only load policies if the user object is available
    if (user) {
      loadPolicies();
    }
  }, [user]);

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
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
           <Button asChild>
                <Link href="/">
                    <PlusCircle className="mr-2" />
                    New Warranty
                </Link>
            </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPolicies}</div>
                    <p className="text-xs text-muted-foreground">All warranties registered</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activePolicies}</div>
                    <p className="text-xs text-muted-foreground">Warranties currently active</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expired Policies</CardTitle>
                    <ShieldX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.expiredPolicies}</div>
                    <p className="text-xs text-muted-foreground">Warranties that have expired</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">Unique customers by email</p>
                </CardContent>
            </Card>
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
  );
}
