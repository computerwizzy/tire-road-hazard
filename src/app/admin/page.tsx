
import { getAllPolicies, getDashboardStats } from '@/app/actions';
import AdminDashboard from '@/components/admin-dashboard';
import type { Policy } from '@/ai/flows/search-policies';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/app/actions';

export const runtime = 'edge';
export const revalidate = 0; // Disable caching for this page

export default async function AdminPage() {
    let initialPolicies: Policy[] = [];
    let totalCount = 0;
    let stats: DashboardStats = { totalPolicies: 0, activePolicies: 0, expiredPolicies: 0, totalCustomers: 0, totalClaims: 0 };
    let error: string | null = null;

    try {
        const [policyResponse, statsResponse] = await Promise.all([
            getAllPolicies(1, 10),
            getDashboardStats()
        ]);

        if (!policyResponse.success) {
            // This error is critical for the main table, so we treat it as a page-level error.
            error = policyResponse.error || 'An unknown error occurred while fetching policies.';
        } else {
            initialPolicies = policyResponse.data || [];
            totalCount = policyResponse.count || 0;
        }

        // Stats can be treated as non-critical; the page can still render without them.
        if (statsResponse) {
            stats = statsResponse;
        } else {
            console.warn("Could not fetch dashboard stats, defaulting to zero.");
        }

    } catch (e) {
        const caughtError = e as Error;
        console.error("Failed to load admin dashboard data:", caughtError);
        error = caughtError.message || 'An unexpected error occurred.';
    }

     if (error) {
         return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-40 text-destructive text-center p-4 border-2 border-dashed border-destructive/50 rounded-lg">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p className="font-semibold">Error Fetching Initial Data</p>
                            <p className="text-sm">{error}</p>
                            <p className="text-xs mt-2 text-muted-foreground">This might be because the database tables do not exist or RLS policies are preventing access. Please check your Supabase dashboard.</p>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <AdminDashboard initialPolicies={initialPolicies} totalCount={totalCount} initialStats={stats} />
    );
}
