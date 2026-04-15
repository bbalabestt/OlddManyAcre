
"use client";

import type { Booking, BookingStatus } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookingCard } from "./booking-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isToday, isFuture, parseISO, format, compareAsc, compareDesc, subDays, isBefore } from 'date-fns';
import { BookingDetailSidePanel } from "./booking-detail-side-panel";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BookingKanbanBoardProps {
  bookings: Booking[];
  viewType: 'upcoming' | 'today'; 
}

interface KanbanColumn {
  id: BookingStatus; 
  title: string;
  bookings: Booking[];
  futureBookings?: Booking[]; // For "Confirmed" in "Today's" view
}

// Active statuses for Upcoming Kanban board
const UPCOMING_KANBAN_COLUMNS_ORDER: BookingStatus[] = ['Pending', 'Processing', 'Pre-confirmed'];
// Specific active statuses for Today's Kanban board
const TODAY_KANBAN_COLUMNS_ORDER: BookingStatus[] = ['Confirmed', 'InTransit', 'AwaitingAllocation'];


export function BookingKanbanBoard({ bookings: initialBookings, viewType }: BookingKanbanBoardProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const { toast } = useToast();
  const [showFutureConfirmed, setShowFutureConfirmed] = useState(false);


  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const handleCardClick = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsSidePanelOpen(true);
    }
  };

  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prevBookings =>
      prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
    setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev);
  };

  const handleRejectBookingInKanban = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, status: 'Cancelled' } : prev);
    toast({
      title: "Booking Rejected",
      description: `Booking ${bookingId.substring(0,8)} has been marked as Cancelled.`
    });
    setIsSidePanelOpen(false);
  };

  const sevenDaysAgo = subDays(new Date(), 7);

  const filteredBookingsForView = bookings.filter(b => {
    const startTime = parseISO(b.startTime);
    const isIdle = b.status === 'Pending' && isBefore(parseISO(b.createdAt), sevenDaysAgo);

    if (b.status === 'Completed' || b.status === 'Cancelled' || isIdle) {
      return false;
    }

    if (viewType === 'upcoming') {
      return isFuture(startTime) && UPCOMING_KANBAN_COLUMNS_ORDER.includes(b.status);
    }
    if (viewType === 'today') {
        if (TODAY_KANBAN_COLUMNS_ORDER.includes(b.status)) {
            if (b.status === 'Confirmed') { // Confirmed can be today or future for this view's column
                return isToday(startTime) || isFuture(startTime);
            }
            return isToday(startTime); // Other statuses in 'Today' view must actually be for today
        }
    }
    return false;
  });
  
  const getColumnTitle = (status: BookingStatus): string => {
    switch(status) {
      case 'Pending': return 'Awaiting Delivery Plan';
      case 'Processing': return 'Pending Booking Team Review';
      case 'Pre-confirmed': return 'Awaiting Payment';
      case 'Confirmed': return 'Confirmed & Scheduled';
      case 'InTransit': return 'In Transit';
      case 'AwaitingAllocation': return 'Awaiting Space Allocation';
      default: return status;
    }
  };

  const columnsOrderForView = viewType === 'today' ? TODAY_KANBAN_COLUMNS_ORDER : UPCOMING_KANBAN_COLUMNS_ORDER;

  const columns: KanbanColumn[] = columnsOrderForView.map(status => {
    let columnBookings = filteredBookingsForView
      .filter(b => b.status === status) 
      .sort((a, b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));
    
    let futureBookingsForConfirmed: Booking[] | undefined = undefined;

    if (viewType === 'today' && status === 'Confirmed') {
        const todaysConfirmed = columnBookings.filter(b => isToday(parseISO(b.startTime)));
        futureBookingsForConfirmed = columnBookings.filter(b => isFuture(parseISO(b.startTime)))
                                        .sort((a,b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));
        columnBookings = todaysConfirmed; // Main bookings for this column are today's
    }

    return { 
        id: status, 
        title: getColumnTitle(status), 
        bookings: columnBookings,
        futureBookings: futureBookingsForConfirmed 
    };
  });

  return (
    <>
      <div className="flex gap-4 -mx-4 px-4 pb-4 overflow-x-auto h-full">
        {columns.map((col) => {
          let count = col.bookings.length;
          if (viewType === 'today' && col.id === 'Confirmed' && col.futureBookings) {
            count += col.futureBookings.length; // Add future bookings to the total count for the 'Confirmed' column title
          }
          
          if (viewType === 'upcoming' && count === 0 && !UPCOMING_KANBAN_COLUMNS_ORDER.includes(col.id)) {
             return null;
          }
           if (viewType === 'today' && count === 0 && !TODAY_KANBAN_COLUMNS_ORDER.includes(col.id)) {
             return null;
           }

          return (
            <Card 
              key={col.id} 
              className="w-80 md:w-96 flex-shrink-0 flex flex-col shadow-lg rounded-lg h-full"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-semibold">
                  {col.title} ({count})
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-grow">
                <CardContent className="p-4 flex flex-col gap-4">
                  {col.bookings.length > 0 ? (
                    col.bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCardClick={handleCardClick}
                      />
                    ))
                  ) : (
                    viewType === 'today' && col.id === 'Confirmed' && col.futureBookings && col.futureBookings.length > 0 
                    ? null // If only future bookings exist, don't show "No bookings in this category." yet
                    : <p className="text-sm text-muted-foreground text-center py-4">No bookings in this category for today.</p>
                  )}

                  {viewType === 'today' && col.id === 'Confirmed' && col.futureBookings && col.futureBookings.length > 0 && (
                    <>
                      <div className="my-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs" 
                            onClick={() => setShowFutureConfirmed(!showFutureConfirmed)}
                        >
                          {showFutureConfirmed ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                          {showFutureConfirmed ? 'Hide' : 'Show'} Future Confirmed ({col.futureBookings.length})
                        </Button>
                      </div>
                      {showFutureConfirmed && (
                        <>
                          <Separator className="my-1"/>
                          <p className="text-xs text-muted-foreground text-center mb-2">Upcoming Confirmed Bookings</p>
                          {col.futureBookings.map((booking) => (
                             <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCardClick={handleCardClick}
                              />
                          ))}
                        </>
                      )}
                    </>
                  )}
                  {col.bookings.length === 0 && !(viewType === 'today' && col.id === 'Confirmed' && col.futureBookings && col.futureBookings.length > 0) && (
                     <p className="text-sm text-muted-foreground text-center py-4">No bookings in this category.</p>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          );
        })}
        {filteredBookingsForView.length === 0 && columns.length === 0 && ( 
          <Card className="w-full">
            <CardContent className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No bookings for this view.</p>
              {(viewType === 'upcoming' || viewType === 'today') && (
                <Button asChild>
                  <Link href="/bookings/new">Create a New Booking</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {selectedBooking && (
        <BookingDetailSidePanel
          booking={selectedBooking}
          isOpen={isSidePanelOpen}
          onOpenChange={setIsSidePanelOpen}
          onUpdateStatus={handleUpdateBookingStatus}
          onRejectBooking={handleRejectBookingInKanban}
        />
      )}
    </>
  );
}
