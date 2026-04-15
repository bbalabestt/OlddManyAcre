
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ListOrdered, LogOut } from "lucide-react";

// This is a placeholder page.
// In a real app, you'd fetch and display customer-specific data.

export default function CustomerDashboardPage() {
  // Simulated user data
  const userName = "Valued Customer"; 
  const activeAllocations = 2; // Example data
  const pastBookings = 5; // Example data

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Welcome, {userName}!</h1>
        <Button variant="outline" asChild>
          <Link href="/"> 
            <LogOut className="mr-2 h-4 w-4" /> Logout (Simulated)
          </Link>
        </Button>
      </header>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Active Storage</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAllocations} allocations</div>
            <p className="text-xs text-muted-foreground">Currently stored items and spaces.</p>
            <Button variant="link" asChild className="px-0 pt-2 text-primary">
              <Link href="#">View Active Storage &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Booking History</CardTitle>
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastBookings} bookings</div>
            <p className="text-xs text-muted-foreground">Review your past service requests.</p>
             <Button variant="link" asChild className="px-0 pt-2 text-primary">
              <Link href="#">View Booking History &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader>
          <CardTitle>Your Current Allocations</CardTitle>
          <CardDescription>
            Details about your items currently in storage. Click an allocation to manage items or request returns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for allocation cards */}
          <div className="space-y-4">
            {/* Example Allocation Card 1 (Placeholder) */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-md">Allocation ID: ALLOC-XYZ123</CardTitle>
                <CardDescription>Branch: Downtown Storage | Using: 10 sq m</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Items: Office furniture, 15 boxes.</p>
                <p className="text-sm">Start Date: 2023-10-15</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">Manage Items / Request Return</Button>
              </CardFooter>
            </Card>
            
            {/* Example Allocation Card 2 (Placeholder) */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-md">Allocation ID: ALLOC-ABC789</CardTitle>
                <CardDescription>Branch: Uptown Secure Units | Using: 5 sq m</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Items: Seasonal clothing, 3 suitcases.</p>
                <p className="text-sm">Start Date: 2024-01-20</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">Manage Items / Request Return</Button>
              </CardFooter>
            </Card>

            {activeAllocations === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg">You have no active storage allocations.</p>
                <Button asChild className="mt-4">
                  <Link href="/book-storage">Book New Storage</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Widing. All rights reserved.</p>
        <p>
          Need help? <Link href="mailto:support@widing.com" className="text-primary hover:underline">Contact Support</Link>
        </p>
      </footer>
    </div>
  );
}
