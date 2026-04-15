
import { getBookingById, getClientById, getBranchById, getAllocatedBulkSpaceById, getDeliveryOptionsForBooking } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, CalendarDays, MapPin, Package, FileText, Building, Image as ImageIcon, AlertTriangle, Edit2, ListChecks, Phone, Clock, ExternalLink, Link as LinkIcon, ArrowRightLeft, Construction, Box } from "lucide-react";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from 'next';
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { AddDeliveryOptionForm } from "./components/add-delivery-option-form";
import { DeliveryOptionsList } from "./components/delivery-options-list";
import Image from "next/image"; 

type Props = {
  params: { bookingId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const booking = getBookingById(params.bookingId);
  return {
    title: booking ? `Delivery Summary: ${booking.id.substring(0,8)}` : 'Booking Not Found',
  };
}

export default async function DeliverySummaryPage({ params }: Props) {
  const booking = getBookingById(params.bookingId);
  
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-semibold">Booking Not Found</h1>
        <p className="text-muted-foreground">The booking you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/delivery-planning">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Delivery Planning
          </Link>
        </Button>
      </div>
    );
  }

  const client = getClientById(booking.clientId);
  const branchForBooking = getBranchById(booking.branchId); 
  const allocation = booking.selectedAllocationId ? getAllocatedBulkSpaceById(booking.selectedAllocationId) : null;
  const deliveryOptions = getDeliveryOptionsForBooking(booking.id);

  const getFullAddress = (
    street?: string, floor?: string, subDistrict?: string, district?: string, province?: string, postcode?: string
  ): string => {
    return [street, floor, subDistrict, district, province, postcode].filter(Boolean).join(', ') || 'N/A';
  };

  let originSectionTitle = "Origin Details";
  let originAddress = "N/A";
  let originContact = booking.originPhoneNumber || "N/A";
  let originAvailability = booking.originAvailableTimeSlots || "N/A";
  let originMapLink = booking.originGoogleMapsLink;

  let destinationSectionTitle = "Destination Details";
  let destinationAddress = "N/A";
  let destinationContact = booking.destinationPhoneNumber || "N/A";
  let destinationAvailability = booking.destinationAvailableTimeSlots || "N/A";
  let destinationMapLink = booking.destinationGoogleMapsLink;


  if (booking.bookingType === 'Pick-up') {
    originSectionTitle = "Origin: Client's Location";
    originAddress = getFullAddress(client?.originStreetAddress, booking.originFloor || client?.originFloor, client?.originSubDistrict, client?.originDistrict, client?.originProvince, client?.originPostcode);
    
    destinationSectionTitle = "Destination: Widing Warehouse";
    destinationAddress = branchForBooking ? getFullAddress(branchForBooking.addressDetail, undefined, branchForBooking.subDistrict, branchForBooking.district, branchForBooking.province, branchForBooking.postcode) : "N/A";
    destinationContact = branchForBooking?.contactInfo || "N/A";
    destinationAvailability = branchForBooking?.operatingHours || "N/A";
    destinationMapLink = branchForBooking?.googleMapsLink;
  } else { 
    const originBranchForReturn = allocation ? getBranchById(allocation.branchId) : branchForBooking;
    originSectionTitle = "Origin: Widing Warehouse";
    originAddress = originBranchForReturn ? getFullAddress(originBranchForReturn.addressDetail, undefined, originBranchForReturn.subDistrict, originBranchForReturn.district, originBranchForReturn.province, originBranchForReturn.postcode) : "N/A";
    originContact = originBranchForReturn?.contactInfo || "N/A";
    originAvailability = originBranchForReturn?.operatingHours || "N/A";
    originMapLink = originBranchForReturn?.googleMapsLink;

    destinationSectionTitle = "Destination: Client's Location";
    destinationAddress = booking.destinationSameAsOrigin 
        ? getFullAddress(client?.originStreetAddress, booking.destinationFloor || client?.originFloor, client?.originSubDistrict, client?.originDistrict, client?.originProvince, client?.originPostcode)
        : getFullAddress(booking.destinationStreetAddress, booking.destinationFloor, booking.destinationSubDistrict, booking.destinationDistrict, booking.destinationProvince, booking.destinationPostcode);
  }
  
  const disassemblyText = booking.disassemblyOption === 'none' || !booking.disassemblyOption ? 'No' 
    : booking.disassemblyOption === 'all' ? 'All items' 
    : `Specific: ${booking.numberOfItemsToDisassemble || 0} items`;


  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/delivery-planning">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Delivery Planning Hub
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Delivery Summary &amp; Planning</h1>
            <CardDescription>Booking ID: {booking.id}</CardDescription>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details ({booking.bookingType})</span>
                <Badge variant={booking.status === 'Pending' ? 'outline' : booking.status === 'Processing' ? 'secondary' : 'default'} className="capitalize">
                  {booking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><User className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Client:</strong> {client?.name || 'N/A'} ({client?.phone || 'N/A'})</div>
                <div><CalendarDays className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Service Date:</strong> {format(parseISO(booking.startTime), "PPp")}</div>
                <div><Building className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Primary Branch:</strong> {branchForBooking?.name || 'N/A'}</div>
                <div><Package className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Type:</strong> {booking.bookingType}</div>
                {booking.customerSelfDelivery && (
                  <div className="md:col-span-2 flex items-center text-blue-600 bg-blue-100/70 px-2 py-1 rounded-md text-xs">
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" /> Customer will handle delivery/pickup themselves.
                  </div>
                )}
              </div>
              
              <Separator/>
              <h4 className="font-medium pt-2 text-base">{originSectionTitle}</h4>
              <p><MapPin className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Address:</strong> {originAddress}</p>
              <p><Phone className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Contact:</strong> {originContact}</p>
              <p><Clock className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Availability:</strong> {originAvailability}</p>
              {originMapLink && (
                <p><LinkIcon className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Map:</strong> <a href={originMapLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Map <ExternalLink className="inline h-3 w-3 ml-0.5"/></a></p>
              )}

              <Separator/>
              <h4 className="font-medium pt-2 text-base">{destinationSectionTitle}</h4>
               <p><MapPin className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Address:</strong> {destinationAddress}</p>
              <p><Phone className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Contact:</strong> {destinationContact}</p>
              <p><Clock className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Availability:</strong> {destinationAvailability}</p>
              {destinationMapLink && (
                <p><LinkIcon className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Map:</strong> <a href={destinationMapLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Map <ExternalLink className="inline h-3 w-3 ml-0.5"/></a></p>
              )}

              <Separator/>
              <h4 className="font-medium pt-2">Logistics Checklist & Services</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <p><strong>Elevator:</strong> {booking.hasElevator === undefined ? 'N/A' : (booking.hasElevator ? 'Yes' : 'No')}</p>
                <p><strong>Dock Area:</strong> {booking.hasDockingArea === undefined ? 'N/A' : (booking.hasDockingArea ? 'Yes' : 'No')}</p>
                <p><strong>Parking Fee:</strong> {booking.hasCarParkingFee === undefined ? 'N/A' : (booking.hasCarParkingFee ? 'Yes' : 'No')}</p>
                <p><strong>Wrapping:</strong> {booking.needsWrapping ? 'Yes' : 'No'}</p>
                <p className="flex items-center gap-1"><Construction className="h-3 w-3"/><strong>Disassembly:</strong> {disassemblyText}</p>
                <p><strong>Extra Manpower:</strong> {booking.needsExtraManpower ? 'Yes' : 'No'}</p>
              </div>
              {booking.hasBigFurniture && (
                 <p><strong>Big Furniture:</strong> Yes (Max W: {booking.bigFurnitureMaxWidthCm || 'N/A'}cm, Max H: {booking.bigFurnitureMaxHeightCm || 'N/A'}cm)</p>
              )}
              {booking.customerNotes && <p><FileText className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Customer Notes:</strong> {booking.customerNotes}</p>}
               {booking.staffNotes && <p><Edit2 className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Staff Notes:</strong> {booking.staffNotes}</p>}

              {booking.bookingType === 'Pick-up' && booking.items && booking.items.length > 0 && (
                <>
                  <Separator/>
                  <h4 className="font-medium pt-2">Items for Pick-up</h4>
                  <ul className="list-disc list-inside pl-4">
                    {booking.items.map((item, idx) => <li key={idx}>{item.type}: {item.quantity}</li>)}
                  </ul>
                </>
              )}
              {booking.bookingType === 'Pick-up' && booking.itemImageNames && booking.itemImageNames.length > 0 && (
                <>
                  <h4 className="font-medium pt-1">Item Image Filenames Noted</h4>
                  <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                    {booking.itemImageNames.map((name, idx) => <li key={idx} className="truncate" title={name}>{name}</li>)}
                  </ul>
                </>
              )}
              {booking.bookingType === 'Return' && allocation && (
                 <>
                  <Separator/>
                  <h4 className="font-medium pt-2">Returning Allocation Details</h4>
                  <p><Archive className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Allocation ID:</strong> {allocation.id.substring(0,8)}...</p>
                  <p><Box className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Stored Space:</strong> {allocation.usedSpaceSqm} SQ.M at {allocation.branchName}</p>
                  {allocation.notes && <p><strong>Allocation Notes:</strong> {allocation.notes}</p>}
                 </>
              )}
            </CardContent>
          </Card>

          {deliveryOptions.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Proposed Delivery Options ({deliveryOptions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryOptionsList bookingId={booking.id} options={deliveryOptions} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks /> Add Delivery Options</CardTitle>
              <CardDescription>Propose delivery methods for this booking. Adding the first option will change booking status to 'Processing'.</CardDescription>
            </CardHeader>
            <CardContent>
               {booking.customerSelfDelivery ? (
                <div className="p-4 border border-dashed rounded-md bg-blue-50 text-blue-700 text-center">
                  <ArrowRightLeft className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Customer Self-Delivery/Pickup</p>
                  <p className="text-xs">No delivery options needed from staff as customer will handle transport.</p>
                </div>
              ) : (
                <AddDeliveryOptionForm bookingId={booking.id} currentOptionsCount={deliveryOptions.length} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
