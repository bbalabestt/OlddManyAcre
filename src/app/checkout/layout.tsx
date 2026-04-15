
import type { ReactNode } from 'react';
import Link from 'next/link';
import { SpaceWiseIcon } from '@/components/icons'; // Assuming this path is correct

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-2xl mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90">
          <SpaceWiseIcon className="h-7 w-7" />
          <span>Widing Self Storage</span>
        </Link>
      </header>
      <main className="w-full max-w-xl">
        {children}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Widing. All rights reserved.</p>
      </footer>
    </div>
  );
}
