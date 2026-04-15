
"use client";

import type { ReactNode } from 'react';
// useEffect and usePathname are no longer strictly needed for auth redirection here,
// but useAuth might still be used if other parts of the layout depend on user state (e.g., UserNav).
// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { SpaceWiseIcon } from '@/components/icons';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); // UserNav might still use this
  // const router = useRouter();
  // const pathname = usePathname();

  // useEffect(() => {
  //   // THIS SECTION IS TEMPORARILY DISABLED FOR TESTING WITHOUT LOGIN
  //   if (!loading && !user) {
  //     // If not loading and no user, redirect to login
  //     // Preserve the intended path via query param for redirection after login
  //     router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  //   }
  // }, [user, loading, router, pathname]);

  // TEMPORARILY DISABLED: Loading state check that redirects
  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  // TEMPORARILY DISABLED: User check that redirects
  // if (!user) {
  //   // This check is mostly for the initial render before useEffect runs or if user becomes null
  //   // The useEffect handles the redirect, but this prevents rendering children if user is null.
  //   // It might flash briefly before redirect, so the loading check above is primary.
  //   return (
  //       <div className="flex h-screen items-center justify-center">
  //           <p>Redirecting to login...</p>
  //           <Loader2 className="ml-2 h-5 w-5 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  // If still loading auth state (even if not redirecting), show loader
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar RailComponent={<SidebarRail />} collapsible="icon" variant="inset" side="left">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/90">
            <SpaceWiseIcon className="h-7 w-7" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
              Widing
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 pr-0">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex items-center">
            <SidebarTrigger className="mr-2 md:hidden" />
          </div>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
