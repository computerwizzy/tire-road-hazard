
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, isAfter } from 'date-fns';
import { FileText, Users, ShieldCheck, ShieldX, PlusCircle, Loader2 } from 'lucide-react';
import type { Policy } from '@/ai/flows/search-policies';
import { getAllPolicies, type DashboardStats } from '@/app/actions';
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

interface AdminDashboardProps {
  initialPolicies: Policy[];
  totalCount: number;
  initialStats: DashboardStats;
}

const POLICIES_PER_PAGE = 10;

export default function AdminDashboard({ initialPolicies, totalCount, initialStats }: AdminDashboardProps) {
  const router = useRouter();

  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);


  const totalPages = Math.ceil(totalCount / POLICIES_PER_PAGE);

  async function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setIsLoading(true);
    const response = await getAllPolicies(page, POLICIES_PER_PAGE);
    if (response.success && response.data) {
        setPolicies(response.data);
        setCurrentPage(page);
    } else {
        // You might want to show a toast notification here
        console.error("Failed to fetch page:", response.error);
    }
    setIsLoading(false);
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
                    <p className="text-xs text-muted-foreground">Unique customers registered</p>
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
                <div className="min-h-[560px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
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
                     {policies.length === 0 && !isLoading && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No policies have been created yet.</p>
                        </div>
                     )}
                </div>
            </CardContent>
            <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
      </div>
  );
}

    
