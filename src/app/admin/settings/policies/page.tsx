
'use client';

import AdminLayout from '@/components/admin-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileEdit } from 'lucide-react';

export default function PolicyManagementPage() {
    return (
        <AdminLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FileEdit /> Policy Management
                    </h2>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Policies</CardTitle>
                        <CardDescription>
                            This section is under construction. Functionality to search for and edit existing policies will be available here.
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
