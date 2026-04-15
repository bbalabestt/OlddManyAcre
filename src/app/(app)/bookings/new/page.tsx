
import { Suspense } from "react";
import { StaffBookingForm } from "@/components/forms/staff-booking-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { mockClients, mockBranches } from "@/lib/data";

export const metadata: Metadata = {
  title: 'Create New Booking',
};

export default function StaffCreateBookingPage() {
  // In a real app, these might be fetched or managed via a different state mechanism
  const clients = mockClients;
  const branches = mockBranches;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Booking Management
          </Link>
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Create New Booking (Staff)</CardTitle>
          <CardDescription>Manually enter booking details for a client.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <StaffBookingForm clients={clients} branches={branches} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
