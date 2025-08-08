
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { Home, Settings, LogOut, User as UserIcon, Search, PlusCircle } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { handleLogout } from '@/app/actions';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { Input } from './ui/input';

export default function AdminLayout({
  children,
  user
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    if (searchTerm) {
        router.push(`/admin/settings/policies?q=${encodeURIComponent(searchTerm)}`);
    } else {
        router.push(`/admin/settings/policies`);
    }
  };


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
             { pathname.startsWith('/admin/settings') ? (
                <form className="px-2" onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            placeholder="Search Policies"
                            className="w-full rounded-lg bg-background pl-8"
                        />
                    </div>
                </form>
             ) : null}
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
                    <SidebarMenuButton asChild isActive={pathname === '/admin/registration'}>
                    <Link href="/admin/registration">
                        <PlusCircle />
                        New Warranty
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                  <Link href="/admin/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="flex-col !items-start gap-2">
            <ThemeToggle />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1">
            <header className="flex items-center justify-between p-4 border-b h-[57px]">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                 <div className="flex-1" />
                 <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                           <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <UserIcon className="h-4 w-4" />
                                </AvatarFallback>
                           </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Admin</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleLogout()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </header>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
