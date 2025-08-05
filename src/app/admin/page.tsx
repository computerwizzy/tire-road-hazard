
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

    try {
        [policyResponse, statsResponse] = await Promise.all([
            getAllPolicies(1, 10),
            getDashboardStats()
        ]);
    } catch (e) {
        const error = e as Error;
        const errorMessage = error.message || 'An unexpected error occurred.';
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
                            <p className="text-sm">{errorMessage}</p>
                            <p className="text-xs mt-2 text-muted-foreground">This might be because the database tables do not exist or RLS policies are preventing access. Please check your Supabase dashboard.</p>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        )
    }


    if (!policyResponse.success) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-40 text-destructive text-center p-4 border-2 border-dashed border-destructive/50 rounded-lg">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p className="font-semibold">Error Fetching Policies</p>
                            <p className="text-sm">{policyResponse.error}</p>
                            <p className="text-xs mt-2 text-muted-foreground">This might be because the 'policies' table does not exist or RLS policies are preventing access. Please check your Supabase dashboard.</p>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    const initialPolicies: Policy[] = policyResponse.data || [];
    const totalCount = policyResponse.count || 0;
    const stats: DashboardStats = statsResponse;

    return <AdminDashboard initialPolicies={initialPolicies} totalCount={totalCount} initialStats={stats} />;
}
