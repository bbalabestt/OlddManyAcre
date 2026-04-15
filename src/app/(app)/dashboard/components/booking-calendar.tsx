
"use client";

import type { Booking } from "@/types";
import { mockBookings } from "@/lib/data";
import React, { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isSameDay, startOfMonth, addDays, compareAsc, isAfter, isBefore, subDays } from 'date-fns'; // Added isAfter, isBefore, and subDays
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, CornerDownLeft, Hourglass } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarTabType = 'expired' | 'pickup' | 'return';

const getEventDates = (bookings: Booking[], tabType: CalendarTabType): Map<string, Booking[]> => {
  const eventDatesMap = new Map<string, Booking[]>();
  bookings.forEach(booking => {
    // For 'expired' tab, use endTime. For 'pickup' and 'return', use startTime.
    const dateToUse = tabType === 'expired' ? booking.endTime : booking.startTime;
    const dateKey = format(parseISO(dateToUse), "yyyy-MM-dd");

    if (!eventDatesMap.has(dateKey)) {
      eventDatesMap.set(dateKey, []);
    }
    eventDatesMap.get(dateKey)?.push(booking);
  });
  return eventDatesMap;
};

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState<CalendarTabType>('expired');

  const activeBookings = useMemo(() => {
    return mockBookings.filter(booking => booking.status !== 'Completed' && booking.status !== 'Cancelled');
  }, []);

  const upcomingExpiredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const sevenDaysFromNow = addDays(today, 7);

    return activeBookings
      .filter(b =>
        ['Confirmed', 'InTransit', 'AwaitingAllocation'].includes(b.status) &&
        isAfter(parseISO(b.endTime), subDays(today,1)) && // End time is today or in the future (using subDays for inclusivity of today)
        isBefore(parseISO(b.endTime), addDays(sevenDaysFromNow,1)) // And end time is before 8 days from now (inclusive of 7th day)
      )
      .sort((a, b) => compareAsc(parseISO(a.endTime), parseISO(b.endTime)));
  }, [activeBookings]);

  const upcomingPickupBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeBookings
      .filter(b => b.bookingType === 'Pick-up' && isAfter(parseISO(b.startTime), subDays(today,1)))
      .sort((a,b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));
  }, [activeBookings]);

  const requestedReturnBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeBookings
      .filter(b => b.bookingType === 'Return' && isAfter(parseISO(b.startTime), subDays(today,1)))
      .sort((a,b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));
  }, [activeBookings]);

  const filteredBookingsForTab = useMemo(() => {
    switch (activeTab) {
      case 'expired': return upcomingExpiredBookings;
      case 'pickup': return upcomingPickupBookings;
      case 'return': return requestedReturnBookings;
      default: return [];
    }
  }, [activeTab, upcomingExpiredBookings, upcomingPickupBookings, requestedReturnBookings]);

  const bookingsByDate = useMemo(() => getEventDates(filteredBookingsForTab, activeTab), [filteredBookingsForTab, activeTab]);

  const bookingsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return bookingsByDate.get(dateKey) || [];
  }, [selectedDate, bookingsByDate]);

  const eventDatesForModifier = Array.from(bookingsByDate.keys()).map(dateStr => parseISO(dateStr));
  const countForSelectedDay = bookingsForSelectedDay.length;

  const getTabContent = (bookingsToList: Booking[], tabType: CalendarTabType) => {
    if (bookingsToList.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground text-center py-4">
            No bookings for this category {selectedDate ? `on ${format(selectedDate, "PPP")}` : 'currently'}.
          </p>
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {bookingsToList.map((booking) => (
          <li key={booking.id} className="text-xs p-3 rounded-lg bg-card shadow-md border">
            <div className="flex justify-between items-start mb-1">
              <Link href={`/bookings`} passHref>
                 <Button variant="link" className="p-0 h-auto font-semibold text-primary hover:underline truncate text-left text-sm block">
                    ID: {booking.id.substring(0, 8)}...
                 </Button>
              </Link>
               <Badge
                variant={booking.status === 'Pending' ? 'outline' : booking.status === 'Confirmed' ? 'default' : 'secondary'}
                className={`capitalize text-xs whitespace-nowrap ${booking.status === 'Pending' ? 'border-accent text-accent-foreground' : ''}`}
              >
                {booking.status}
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs mb-0.5">Client: {booking.clientName}</div>
            <div className="text-muted-foreground text-xs mb-0.5">Branch: {booking.branchName}</div>
            {tabType === 'expired' && (
              <div className="text-destructive-foreground text-xs font-semibold bg-destructive/80 px-1.5 py-0.5 rounded-sm inline-block">
                Expires: {format(parseISO(booking.endTime), "PPp")}
              </div>
            )}
             {(tabType === 'pickup' || tabType === 'return') && (
                <div className="text-muted-foreground text-xs">
                    {tabType === 'pickup' ? 'Pickup' : 'Return'} Date: {format(parseISO(booking.startTime), "PPp")}
                </div>
             )}
          </li>
        ))}
      </ul>
    );
  };


  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
        <CardDescription>Overview of important upcoming booking events.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalendarTabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="expired"><Hourglass className="mr-1 sm:mr-2 h-4 w-4"/>Upcoming Expiries ({upcomingExpiredBookings.length})</TabsTrigger>
            <TabsTrigger value="pickup"><Package className="mr-1 sm:mr-2 h-4 w-4"/>Pick-ups ({upcomingPickupBookings.length})</TabsTrigger>
            <TabsTrigger value="return"><CornerDownLeft className="mr-1 sm:mr-2 h-4 w-4"/>Returns ({requestedReturnBookings.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-grow flex flex-col md:flex-row gap-6">
          <div className="md:w-[300px] lg:w-[320px] xl:w-[350px] flex-shrink-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border p-0 shadow-sm bg-card"
              modifiers={{ booked: eventDatesForModifier }}
              modifiersClassNames={{ booked: ' booked-day-indicator '}}
              classNames={{
                  day_today: "bg-accent/70 text-accent-foreground font-bold ring-1 ring-accent",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
              }}
            />
            <style jsx global>{`
              .booked-day-indicator {
                position: relative;
              }
              .booked-day-indicator::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: hsl(var(--primary));
              }
              .rdp-day_selected.booked-day-indicator::after {
                  background-color: hsl(var(--primary-foreground));
              }
               .rdp-day_today.booked-day-indicator:not(.rdp-day_selected)::after {
                   background-color: hsl(var(--primary) / 0.8);
              }
            `}</style>
          </div>
          <div className="flex-grow flex flex-col min-w-0">
            <div className="sticky top-0 bg-card pt-1 pb-2 z-10">
              <h4 className="font-semibold text-md">
                Events for: <span className="text-primary">{selectedDate ? format(selectedDate, "PPP") : "N/A"}</span>
                 {selectedDate && ` (${countForSelectedDay} event${countForSelectedDay === 1 ? '' : 's'})`}
              </h4>
            </div>
            <ScrollArea className="flex-grow border rounded-md p-3 min-h-[240px] bg-background shadow-inner">
              {getTabContent(bookingsForSelectedDay, activeTab)}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

