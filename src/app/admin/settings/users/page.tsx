
'use client';

import AdminLayout from '@/components/admin-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function UserManagementPage() {
    return (
        <AdminLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users /> User Management
                    </h2>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Users</CardTitle>
                        <CardDescription>
                            This section is under construction. Functionality to add, edit, and remove users will be available here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
