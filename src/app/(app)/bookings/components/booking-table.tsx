
// This file is no longer used as bookings are displayed using BookingKanbanBoard.tsx
// You can safely delete this file if it's not referenced elsewhere.

"use client";

import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookingCard } from "./booking-card"; 

interface BookingDisplayProps {
  bookings: Booking[];
}

// This component is deprecated in favor of BookingKanbanBoard
export function BookingTable({ bookings }: BookingDisplayProps) { 

  const handleEdit = (bookingId: string) => {
    console.log("Edit booking:", bookingId);
    alert(`Edit booking: ${bookingId} (Not implemented)`);
  };

  const handleDelete = (bookingId: string) => {
    console.log("Delete/Cancel booking:", bookingId);
    if (confirm('Are you sure you want to cancel this booking?')) {
      alert(`Booking ${bookingId} cancelled (Not implemented)`);
    }
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>All Bookings (Legacy Table - Deprecated)</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No bookings found.</p>
            <Button asChild>
              <Link href="/bookings/new">
                Create a New Booking
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

