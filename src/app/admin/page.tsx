
import { getAllPolicies, getDashboardStats } from '@/app/actions';
import AdminDashboard from '@/components/admin-dashboard';
import type { Policy } from '@/ai/flows/search-policies';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/app/actions';

export const revalidate = 0; // Disable caching for this page

export default async function AdminPage() {
    
    let policyResponse;
    let statsResponse;
    let stats: DashboardStats = { totalPolicies: 0, activePolicies: 0, expiredPolicies: 0, totalCustomers: 0 };
    let initialPolicies: Policy[] = [];
    let totalCount = 0;
    let error: string | null = null;

    try {
        // Fetch policies first, as they are more likely to have RLS issues.
        policyResponse = await getAllPolicies(1, 10);
        if (!policyResponse.success) {
            error = policyResponse.error || 'An unknown error occurred while fetching policies.';
        } else {
             initialPolicies = policyResponse.data || [];
             totalCount = policyResponse.count || 0;
            // Only fetch stats if policies succeed
            statsResponse = await getDashboardStats();
            stats = statsResponse;
        }

    } catch (e) {
        const caughtError = e as Error;
        error = caughtError.message || 'An unexpected error occurred.';
    }

     if (error) {
         return (
            <div className="max-w-7xl mx-auto flex-1 space-y-4 p-4 md:p-8 pt-6">
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
      <div className="max-w-7xl mx-auto">
        <AdminDashboard initialPolicies={initialPolicies} totalCount={totalCount} initialStats={stats} />
      </div>
    );
}
