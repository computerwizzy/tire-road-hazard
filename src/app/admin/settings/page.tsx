
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileEdit, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/admin/settings/users" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="text-primary" />
                                    User Management
                                </CardTitle>
                                <CardDescription>Add, remove, or edit admin users.</CardDescription>
                            </div>
                            <ChevronRight className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/settings/policies" className="block">
                     <Card className="hover:bg-muted/50 transition-colors">
                         <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileEdit className="text-primary" />
                                    Policy Management
                                </CardTitle>
                                <CardDescription>Edit existing warranty policies.</CardDescription>
                            </div>
                            <ChevronRight className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
