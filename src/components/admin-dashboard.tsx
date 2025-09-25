
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, subDays } from 'date-fns';
import { FileText, Users, ShieldCheck, ShieldX, PlusCircle, Loader2, ShieldAlert, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import type { Policy } from '@/ai/flows/search-policies';
import { getAllPolicies, getDashboardStats, type DashboardStats } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface AdminDashboardProps {
  initialPolicies: Policy[];
  totalCount: number;
  initialStats: DashboardStats;
}

const POLICIES_PER_PAGE = 10;

export default function AdminDashboard({ initialPolicies, totalCount: initialTotalCount, initialStats }: AdminDashboardProps) {
  const router = useRouter();

  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotalCount / POLICIES_PER_PAGE));
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    setTotalPages(Math.ceil(totalCount / POLICIES_PER_PAGE));
  }, [totalCount]);

  async function fetchData(page: number, range?: DateRange) {
    setIsLoading(true);
    const dateFilter = range?.from && range.to ? { from: range.from.toISOString(), to: range.to.toISOString() } : undefined;
    const [policiesResponse, statsResponse] = await Promise.all([
      getAllPolicies(page, POLICIES_PER_PAGE, 'all', dateFilter),
      getDashboardStats(dateFilter),
    ]);

    if (policiesResponse.success && policiesResponse.data) {
      setPolicies(policiesResponse.data);
      setCurrentPage(page);
      if (policiesResponse.count !== undefined) {
        setTotalCount(policiesResponse.count);
      }
    } else {
        console.error("Failed to fetch policies:", policiesResponse.error);
    }

    if (statsResponse) {
      setStats(statsResponse);
    } else {
        console.error("Failed to fetch dashboard stats");
    }

    setIsLoading(false);
  }

  async function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    await fetchData(page, dateRange);
  }

  function handleRowClick(policyNumber: string) {
    router.push(`/policy/${policyNumber}`);
  }

  function getStatus(endDate: string) {
    const today = new Date();
    const warrantyEndDate = parseISO(endDate);
    return today > warrantyEndDate ? <Badge variant="destructive">Expired</Badge> : <Badge variant="secondary">Active</Badge>;
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    fetchData(1, range);
  };

  const setPresetDateRange = (preset: string) => {
    const to = new Date();
    let from;
    switch (preset) {
        case 'all':
            handleDateRangeChange(undefined);
            return;
        case 'today':
            from = to;
            break;
        case '7':
            from = subDays(to, 6);
            break;
        case '30':
            from = subDays(to, 29);
            break;
        case '90':
            from = subDays(to, 89);
            break;
        default:
            from = undefined;
    }
    if (from) {
      handleDateRangeChange({ from, to });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select onValueChange={setPresetDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button asChild>
            <Link href="/admin/registration">
              <PlusCircle className="mr-2" />
              New Warranty
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalPolicies}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.activePolicies}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired Policies</CardTitle>
                <ShieldX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.expiredPolicies}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalClaims}</div>
            </CardContent>
        </Card>
    </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" />
                Warranty Policies
            </CardTitle>
            <CardDescription>A list of all registered warranties in the selected date range.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative min-h-[460px] overflow-x-auto">
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
                        <TableHead className="hidden md:table-cell">Tire DOT</TableHead>
                        <TableHead className="hidden lg:table-cell">Purchase Date</TableHead>
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
                        <TableCell className="hidden md:table-cell">{policy.tireDot}</TableCell>
                        <TableCell className="hidden lg:table-cell">{format(parseISO(policy.purchaseDate), 'PPP')}</TableCell>
                        <TableCell>{format(parseISO(policy.warrantyEndDate), 'PPP')}</TableCell>
                        <TableCell>{getStatus(policy.warrantyEndDate)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                 {policies.length === 0 && !isLoading && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No policies found for the selected date range.</p>
                    </div>
                 )}
            </div>
        </CardContent>
        { totalPages > 1 && (
             <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
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
        )}
    </Card>
    </div>
  );
}
