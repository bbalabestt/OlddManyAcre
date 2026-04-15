
import { mockBookings, getClientById } from "@/lib/data";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { PackageSearch, AlertTriangle, ArrowRight, ListChecks, Route } from "lucide-react"; // Added Route
import type { Booking } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: 'Delivery Planning Hub',
};

export default async function DeliveryPlanningPage() {
  const bookingsAwaitingPlanning = mockBookings.filter(b => b.status === 'Pending' && (b.bookingType === 'Pick-up' || b.bookingType === 'Return'));
  const bookingsPlanned = mockBookings.filter(b => b.status === 'Processing' && (b.bookingType === 'Pick-up' || b.bookingType === 'Return'));

  const renderBookingTable = (bookings: Booking[], listTitle: string, listDescription: string, emptyMessage: string) => (
    <Card className="shadow-lg rounded-lg flex-grow flex flex-col">
      <CardHeader>
        <CardTitle>{listTitle} ({bookings.length})</CardTitle>
        <CardDescription>{listDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const client = getClientById(booking.clientId);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id.substring(0, 8)}...</TableCell>
                      <TableCell>{client?.name || booking.clientName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={booking.bookingType === 'Pick-up' ? 'default' : 'secondary'} className="capitalize">
                          {booking.bookingType}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(booking.startTime), "PPp")}</TableCell>
                      <TableCell>{booking.branchName}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/delivery-summary/${booking.id}`}>
                            {listTitle.includes("Awaiting") ? "Plan Delivery" : "View/Edit Plan"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <PackageSearch className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg mb-2">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Delivery Planning Hub</h1>
      </div>

      <Tabs defaultValue="awaiting-plan" className="flex-grow flex flex-col">
        <TabsList className="mb-4 self-start grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="awaiting-plan">
            <ListChecks className="mr-2 h-4 w-4" /> Awaiting Plan ({bookingsAwaitingPlanning.length})
          </TabsTrigger>
          <TabsTrigger value="planned">
            <Route className="mr-2 h-4 w-4" /> Planned ({bookingsPlanned.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting-plan" className="flex-grow flex flex-col">
          {renderBookingTable(
            bookingsAwaitingPlanning,
            "Bookings Awaiting Delivery Plan",
            "Review these bookings and add delivery options on their respective summary pages.",
            "No bookings currently require delivery planning."
          )}
        </TabsContent>

        <TabsContent value="planned" className="flex-grow flex flex-col">
          {renderBookingTable(
            bookingsPlanned,
            "Bookings with Delivery Plans",
            "These bookings have at least one delivery option proposed. The booking team will review and select an option.",
            "No bookings have delivery plans yet."
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

    