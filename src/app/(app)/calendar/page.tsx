
import type { Metadata } from 'next';
import { BookingCalendar } from '@/app/(app)/dashboard/components/booking-calendar'; // Re-use the same calendar component
import { Card, CardContent } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListOrdered } from 'lucide-react'; // Example icon

export const metadata: Metadata = {
  title: 'Full Calendar View',
};

export default function FullCalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Full Calendar View</h1>
        <Button asChild variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/bookings">
                <ListOrdered className="mr-2 h-5 w-5" /> Booking Management
            </Link>
        </Button>
      </div>
      <Card className="shadow-lg flex-grow flex flex-col">
        <CardContent className="p-0 sm:p-2 md:p-4 flex-grow flex flex-col">
          <BookingCalendar />
        </CardContent>
      </Card>
    </div>
  );
}

