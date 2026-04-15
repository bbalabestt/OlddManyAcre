
"use client";

import type { Booking, BookingStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck2, MapPin, User, Car, FileText, Building, Edit, Image as ImageIcon, AlertTriangle, Hourglass, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { formatBookingDuration } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
  onCardClick: (bookingId: string) => void;
  isIdleCancel?: boolean; 
}

export function BookingCard({ booking, onCardClick, isIdleCancel }: BookingCardProps) {
  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Processing': return 'secondary'; 
      case 'Pre-confirmed': return 'secondary'; 
      case 'Confirmed': return 'default';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const displayStatus = isIdleCancel ? 'Cancelled (Idle)' : booking.status;
  const duration = formatBookingDuration(booking.startTime, booking.endTime);

  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow flex flex-col h-full rounded-lg cursor-pointer"
      onClick={() => onCardClick(booking.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate" title={`ID: ${booking.id}`}>
              ID: {booking.id.substring(0, 8)}...
            </CardTitle>
            <CardDescription className="text-sm">
              {format(parseISO(booking.startTime), "PPp")}
            </CardDescription>
          </div>
          <Badge
            variant={getStatusBadgeVariant(booking.status)}
            className={`capitalize whitespace-nowrap ml-2 ${booking.status === 'Pending' ? 'border-accent text-accent-foreground' : booking.status === 'Confirmed' ? 'bg-primary text-primary-foreground' : ''} ${isIdleCancel ? 'border-destructive text-destructive-foreground' : ''}`}
          >
            {displayStatus}
          </Badge>
        </div>
        {isIdleCancel && (
          <div className="flex items-center text-xs text-destructive mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Auto-cancelled due to inactivity.
          </div>
        )}
        {booking.customerSelfDelivery && booking.status === 'Processing' && (
          <div className="flex items-center text-xs text-blue-600 mt-1 bg-blue-100/70 px-1.5 py-0.5 rounded-sm">
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Customer Self-Delivery/Pickup
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-2 text-sm flex-grow pt-0">
        {booking.thumbnailImageUrl && (
          <div className="relative w-full h-20 rounded overflow-hidden mb-2" data-ai-hint="storage items boxes">
            <Image src={booking.thumbnailImageUrl} alt="Booking thumbnail" layout="fill" objectFit="cover" />
          </div>
        )}
        {!booking.thumbnailImageUrl && (
           <div className="relative w-full h-20 rounded bg-muted flex items-center justify-center mb-2" data-ai-hint="storage items boxes">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate" title={booking.clientName || booking.driverName}>Client: {booking.clientName || booking.driverName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate" title={booking.branchName}>Branch: {booking.branchName}</span>
        </div>
        {booking.spaceIdentifier && (
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0"><path d="M21 10H3C2.44772 10 2 10.4477 2 11V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V11C22 10.4477 21.5523 10 21 10Z"/><path d="M3 6H21V10H3V6Z"/><path d="M12 2V6"/><path d="M7 2V6"/><path d="M17 2V6"/></svg>
            <span className="truncate" title={booking.spaceIdentifier}>Space: {booking.spaceIdentifier}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate" title={booking.bookingType}>Type: {booking.bookingType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate" title={`Duration: ${duration}`}>Duration: {duration}</span>
        </div>
        {booking.vehicleInfo && (
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate" title={booking.vehicleInfo}>Vehicle: {booking.vehicleInfo}</span>
          </div>
        )}
        {booking.notes && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground italic text-xs line-clamp-2" title={booking.notes}>Notes: {booking.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 mt-auto border-t flex justify-end">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" tabIndex={-1}>
          View Details
          <Edit className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
