
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays } from "lucide-react"; // Added CalendarDays icon
import { BookingKanbanBoard } from "./components/booking-kanban-board";
import { BookingListTable } from "./components/booking-list-table"; 
import { getBookings } from "@/lib/db";
import type { Metadata } from 'next';
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isToday, isFuture, parseISO, subDays, isBefore } from 'date-fns';
import type { BookingStatus } from "@/types";

export const metadata: Metadata = {
  title: 'Booking Management',
};

const UPCOMING_KANBAN_COLUMNS_ORDER: BookingStatus[] = ['Pending', 'Processing', 'Pre-confirmed']; // Removed 'Confirmed'
const TODAY_KANBAN_COLUMNS_ORDER: BookingStatus[] = ['Confirmed', 'InTransit', 'AwaitingAllocation'];

export default async function BookingsPage() {
  const bookings = await getBookings();
  const sevenDaysAgo = subDays(new Date(), 7);

  const upcomingBookingsCount = bookings.filter(b => {
    const startTime = parseISO(b.startTime);
    const isIdle = b.status === 'Pending' && isBefore(parseISO(b.createdAt), sevenDaysAgo);
    if (b.status === 'Completed' || b.status === 'Cancelled' || isIdle) return false;
    return isFuture(startTime) && UPCOMING_KANBAN_COLUMNS_ORDER.includes(b.status); // Uses updated UPCOMING_KANBAN_COLUMNS_ORDER
  }).length;

  const todaysBookingsCount = bookings.filter(b => {
    const startTime = parseISO(b.startTime);
    const isIdle = b.status === 'Pending' && isBefore(parseISO(b.createdAt), sevenDaysAgo);
    if (b.status === 'Completed' || b.status === 'Cancelled' || isIdle) return false;
    
    if (TODAY_KANBAN_COLUMNS_ORDER.includes(b.status)) {
        if (b.status === 'Confirmed') { // For count, include Confirmed if today OR future (as it can appear in the column)
            return isToday(startTime) || isFuture(startTime);
        }
        return isToday(startTime); // Other statuses in Today's view must be for today
    }
    return false;
  }).length;

  const completedBookingsCount = bookings.filter(b => b.status === 'Completed').length;

  const cancelledBookingsCount = bookings.filter(b => 
    b.status === 'Cancelled' || 
    (b.status === 'Pending' && isBefore(parseISO(b.createdAt), sevenDaysAgo))
  ).length;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Booking Management</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/calendar">
              <CalendarDays className="mr-2 h-5 w-5" /> View Full Calendar
            </Link>
          </Button>
          <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/bookings/new">
              <PlusCircle className="mr-2 h-5 w-5" /> New Booking
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="flex-grow flex flex-col">
        <TabsList className="mb-4 self-start grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookingsCount})</TabsTrigger>
          <TabsTrigger value="today">Today's ({todaysBookingsCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookingsCount})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookingsCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex-grow overflow-hidden">
          <BookingKanbanBoard bookings={bookings} viewType="upcoming" />
        </TabsContent>
        <TabsContent value="today" className="flex-grow overflow-hidden">
          <BookingKanbanBoard bookings={bookings} viewType="today" />
        </TabsContent>
        <TabsContent value="completed" className="flex-grow overflow-hidden">
          <BookingListTable bookings={bookings} viewType="completed" />
        </TabsContent>
        <TabsContent value="cancelled" className="flex-grow overflow-hidden">
          <BookingListTable bookings={bookings} viewType="cancelled" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
