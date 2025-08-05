
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Home, FileText, Settings, Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
             <div className="flex items-center gap-2">
                <Image
                    src="https://evsportline.com/cdn/shop/files/t-sportline-tire-protection-program-02_c23e898f-b885-43bd-8415-21380b9ed17c_4000x.progressive.jpg"
                    alt="Tire Protection Program"
                    width={40}
                    height={40}
                    className="rounded-lg"
                />
                <span className="text-lg font-semibold">Admin Panel</span>
             </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin">
                    <Home />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/policies')}>
                   <Link href="/admin">
                    <FileText />
                    Policies
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                  <Link href="/admin">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="flex-col !items-start gap-2">
            <ThemeToggle />
            <Button variant="link" asChild className="text-muted-foreground p-0 h-auto">
                <Link href="/">← Back to App</Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                 <div className="flex-1" />
                 <Button asChild variant="outline">
                    <Link href="/search">
                        <Search className="mr-2 h-4 w-4" />
                        Search Policies
                    </Link>
                 </Button>
            </header>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
