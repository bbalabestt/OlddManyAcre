
"use client";

import type { Booking, BookingStatus } from "@/types";
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, compareDesc, isBefore, subDays } from 'date-fns';
import { BookingDetailSidePanel } from "./booking-detail-side-panel";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatBookingDuration } from "@/lib/utils";

interface BookingListTableProps {
  bookings: Booking[];
  viewType: 'completed' | 'cancelled';
}

export function BookingListTable({ bookings: initialBookings, viewType }: BookingListTableProps) {
  const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings); // Holds all bookings from props
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAllBookings(initialBookings);
  }, [initialBookings]);

  const sevenDaysAgo = subDays(new Date(), 7);

  const filteredBookings = useMemo(() => {
    let filtered = [];
    if (viewType === 'completed') {
      filtered = allBookings.filter(b => b.status === 'Completed');
      return filtered.sort((a, b) => compareDesc(parseISO(a.endTime), parseISO(b.endTime)));
    } else if (viewType === 'cancelled') {
      filtered = allBookings.filter(b => 
        b.status === 'Cancelled' || 
        (b.status === 'Pending' && isBefore(parseISO(b.createdAt), sevenDaysAgo))
      );
      return filtered.sort((a, b) => compareDesc(parseISO(a.startTime), parseISO(b.startTime)));
    }
    return [];
  }, [allBookings, viewType, sevenDaysAgo]);

  const handleRowClick = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsSidePanelOpen(true);
    }
  };
  
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setAllBookings(prevBookings =>
      prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
    setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev);
  };

  const handleRejectBooking = (bookingId: string) => {
     setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, status: 'Cancelled' } : prev);
    toast({
      title: "Booking Rejected",
      description: `Booking ${bookingId.substring(0,8)} has been marked as Cancelled.`
    });
    setIsSidePanelOpen(false);
  };


  const getStatusBadgeVariant = (status: BookingStatus, isIdle: boolean) => {
    if (isIdle) return 'destructive';
    switch (status) {
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const pageTitle = viewType === 'completed' ? 'Completed Bookings' : 'Cancelled & Idle Bookings';

  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>{pageTitle} ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Branch</TableHead>
                    <TableHead>Start Date</TableHead>
                    {viewType === 'completed' && <TableHead>End Date</TableHead>}
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const isIdle = viewType === 'cancelled' && booking.status === 'Pending' && isBefore(parseISO(booking.createdAt), sevenDaysAgo);
                    const displayStatus = isIdle ? 'Cancelled (Idle)' : booking.status;
                    return (
                      <TableRow 
                        key={booking.id} 
                        onClick={() => handleRowClick(booking.id)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                        <TableCell>{booking.clientName || 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell">{booking.branchName}</TableCell>
                        <TableCell>{format(parseISO(booking.startTime), "PP")}</TableCell>
                        {viewType === 'completed' && <TableCell>{format(parseISO(booking.endTime), "PP")}</TableCell>}
                        <TableCell>{formatBookingDuration(booking.startTime, booking.endTime)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status, isIdle)} className="capitalize">
                            {displayStatus}
                          </Badge>
                          {isIdle && (
                            <div className="flex items-center text-xs text-destructive mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                                Auto-cancelled
                            </div>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRowClick(booking.id)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No bookings in this category.</p>
               {(viewType !== 'completed' && viewType !== 'cancelled') && (
                <Button asChild>
                  <Link href="/bookings/new">Create a New Booking</Link>
                </Button>
               )}
            </div>
          )}
        </CardContent>
      </Card>
      {selectedBooking && (
        <BookingDetailSidePanel
          booking={selectedBooking}
          isOpen={isSidePanelOpen}
          onOpenChange={setIsSidePanelOpen}
          onUpdateStatus={handleUpdateBookingStatus}
          onRejectBooking={handleRejectBooking} 
        />
      )}
    </>
  );
}
