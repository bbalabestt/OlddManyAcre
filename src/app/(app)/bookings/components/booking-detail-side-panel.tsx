
"use client";

import type { Booking, BookingStatus, DeliveryOption } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { 
  Calendar, Clock, User, Car, Building, Package, FileText, 
  Truck, Ban, CheckCircle, AlertTriangle, ExternalLink, Trash2, SquareOff, Archive,
  Send, CreditCard, Hourglass, Route, Bike, ListChecks, SendToBack, 
  ListOrdered, History, ChevronRight, Check, Server, ClipboardCopy, UserCircle, ArrowRightLeft, Construction
} from "lucide-react"; 
import { Users } from "lucide-react"; 
import { format, parseISO, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type ReactNode } from "react";
import { ConfirmSpaceUsageModal } from "./confirm-space-usage-modal";
import { ChooseDeliveryOptionModal } from "./choose-delivery-option-modal"; 
import { SendCheckoutPageModal } from "./send-checkout-page-modal"; 
import { addTransaction, getDeliveryOptionById, getDeliveryOptionsForBooking, updateBookingCheckoutSent, updateBookingStatus as apiUpdateBookingStatus } from "@/lib/data"; 
import { formatBookingDuration, cn } from "@/lib/utils";
import Link from "next/link"; 

interface BookingDetailSidePanelProps {
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus, chosenDeliveryOptionId?: string) => void; 
  onRejectBooking: (bookingId: string) => void;
}

const bookingStatusTimelineDefinition: {
  pickup: { status: BookingStatus, label: string, icon: React.ElementType }[];
  return: { status: BookingStatus, label: string, icon: React.ElementType }[];
} = {
  pickup: [
    { status: 'Pending', label: 'Awaiting Delivery Plan', icon: ListOrdered },
    { status: 'Processing', label: 'Booking Team Review', icon: ListChecks },
    { status: 'Pre-confirmed', label: 'Awaiting Payment', icon: CreditCard },
    { status: 'Confirmed', label: 'Confirmed & Scheduled', icon: Calendar },
    { status: 'InTransit', label: 'In Transit', icon: Bike },
    { status: 'AwaitingAllocation', label: 'Awaiting Space Allocation', icon: Archive },
    { status: 'Completed', label: 'Completed', icon: CheckCircle },
  ],
  return: [
    { status: 'Pending', label: 'Awaiting Return Plan', icon: ListOrdered },
    { status: 'Processing', label: 'Booking Team Review', icon: ListChecks },
    { status: 'Pre-confirmed', label: 'Awaiting Return Payment', icon: CreditCard },
    { status: 'Confirmed', label: 'Return Confirmed', icon: Calendar },
    { status: 'InTransit', label: 'Items In Transit (Return)', icon: Truck },
    { status: 'Completed', label: 'Return Completed', icon: CheckCircle },
  ],
};


export function BookingDetailSidePanel({ 
  booking, 
  isOpen, 
  onOpenChange, 
  onUpdateStatus,
  onRejectBooking
}: BookingDetailSidePanelProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<BookingStatus | undefined>(booking?.status);
  const [isConfirmSpaceModalOpen, setIsConfirmSpaceModalOpen] = useState(false);
  const [isChooseDeliveryModalOpen, setIsChooseDeliveryModalOpen] = useState(false); 
  const [isSendCheckoutModalOpen, setIsSendCheckoutModalOpen] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [chosenDeliveryOptionForModal, setChosenDeliveryOptionForModal] = useState<DeliveryOption | null>(null);


  useEffect(() => {
    setCurrentStatus(booking?.status);
    if (booking) {
      if (booking.status === 'Processing' && !booking.customerSelfDelivery) { // Only fetch if not self-delivery
        setDeliveryOptions(getDeliveryOptionsForBooking(booking.id));
      } else {
        setDeliveryOptions([]);
      }
      if ((booking.status === 'Pre-confirmed' || booking.status === 'Confirmed' || booking.status === 'InTransit' || booking.status === 'AwaitingAllocation' || booking.status === 'Completed') && booking.chosenDeliveryOptionId) {
        setChosenDeliveryOptionForModal(getDeliveryOptionById(booking.chosenDeliveryOptionId));
      } else {
        setChosenDeliveryOptionForModal(null);
      }
    }
  }, [booking]);


  if (!booking) return null;

  const handleSelectDeliveryOption = (option: DeliveryOption) => {
    if (booking) {
      onUpdateStatus(booking.id, 'Pre-confirmed', option.id);
      toast({
        title: "Delivery Option Selected",
        description: `Provider ${option.providerName} selected for booking ${booking.id.substring(0,8)}. Status changed to Pre-confirmed.`
      });

      if (option.estimatedCost > 0 && booking.clientId) {
         try {
            addTransaction({
            clientId: booking.clientId,
            date: new Date().toISOString(),
            type: 'DeliveryOnly', 
            amount: option.estimatedCost,
            method: 'Online', 
            status: 'Pending', 
            description: `Delivery fee for booking ID: ${booking.id.substring(0,8)} (Provider: ${option.providerName})`,
            bookingId: booking.id,
            relatedBranchId: booking.branchId,
            });
            toast({
            title: "Transaction Created",
            description: `Delivery cost of THB ${option.estimatedCost.toFixed(2)} recorded.`,
            });
        } catch (error) {
            console.error("Failed to create transaction for delivery cost:", error);
            toast({
            title: "Transaction Error",
            description: "Could not record delivery cost transaction.",
            variant: "destructive",
            });
        }
      }
      setIsChooseDeliveryModalOpen(false);
    }
  };


  const handleConfirmPaymentAndFinalize = () => {
     if (booking) {
      onUpdateStatus(booking.id, 'Confirmed');
      toast({
        title: "Payment Confirmed & Finalized",
        description: `Booking ${booking.id.substring(0,8)} status changed to Confirmed.`
      });
    }
  };

  const handleSendCheckoutPageAction = () => {
    if (booking && (booking.chosenDeliveryOptionId || booking.customerSelfDelivery)) { // Allow if self-delivery even without option ID
      const option = booking.chosenDeliveryOptionId ? getDeliveryOptionById(booking.chosenDeliveryOptionId) : null;
      if (option || booking.customerSelfDelivery) {
        setChosenDeliveryOptionForModal(option); // Will be null if self-delivery and no option, which is fine for modal
        setIsSendCheckoutModalOpen(true);
      } else {
         toast({ title: "Error", description: "Chosen delivery option details not found.", variant: "destructive" });
      }
    } else {
         toast({ title: "Error", description: "No delivery option chosen or self-delivery not indicated for this booking.", variant: "destructive" });
    }
  };

  const handleMarkAsInTransit = () => {
    if (booking) {
      onUpdateStatus(booking.id, 'InTransit');
      toast({
        title: "Booking In Transit",
        description: `Booking ${booking.id.substring(0,8)} is now marked as In Transit.`
      });
    }
  };

  const handleReadyForAllocation = () => {
    if (booking && booking.status === 'InTransit') {
      onUpdateStatus(booking.id, 'AwaitingAllocation');
      toast({
        title: "Ready for Allocation",
        description: `Booking ${booking.id.substring(0,8)} moved to Awaiting Allocation.`
      });
    }
  };

  const handleSpaceUsageConfirmed = (bookingId: string, actualSpace: number) => {
     onUpdateStatus(bookingId, 'Completed');
     toast({
        title: "Booking Completed",
        description: `Actual space for booking ${bookingId.substring(0,8)} recorded as ${actualSpace} SQ.M. Booking marked as Completed.`,
    });
    setIsConfirmSpaceModalOpen(false);
  };


  const handleRejectBookingAction = () => {
    if (booking) {
      onRejectBooking(booking.id); 
      onOpenChange(false); 
    }
  };

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Processing': return 'secondary'; 
      case 'Pre-confirmed': return 'secondary';
      case 'Confirmed': return 'default';
      case 'InTransit': return 'default'; 
      case 'AwaitingAllocation': return 'secondary';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const isActionDisabled = booking?.status === 'Completed' || booking?.status === 'Cancelled';
  const canReject = !['InTransit', 'AwaitingAllocation', 'Completed', 'Cancelled'].includes(booking.status);
  const duration = formatBookingDuration(booking.startTime, booking.endTime);
  const bookingIsToday = isToday(parseISO(booking.startTime));

  const timelineSteps = booking.bookingType === 'Pick-up' 
    ? bookingStatusTimelineDefinition.pickup
    : bookingStatusTimelineDefinition.return;
  const currentStatusIndex = timelineSteps.findIndex(step => step.status === (currentStatus || booking.status));
  
  const disassemblyText = booking.disassemblyOption === 'none' || !booking.disassemblyOption ? 'No' 
    : booking.disassemblyOption === 'all' ? 'All items' 
    : `Specific: ${booking.numberOfItemsToDisassemble || 0} items`;


  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md md:max-w-lg flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">Booking ID: {booking.id.substring(0, 8)}...</SheetTitle>
            <SheetDescription>
              Details for booking at {booking.branchName}. Client: {booking.clientName || 'N/A'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mb-4"> 
            <Badge 
                variant={getStatusBadgeVariant(currentStatus || booking.status)} 
                className={`capitalize text-base px-3 py-1 ${currentStatus === 'Pending' ? 'border-accent text-accent-foreground' : (currentStatus === 'Confirmed' || currentStatus === 'InTransit') ? 'bg-primary text-primary-foreground' : ''}`}
            >
                {currentStatus || booking.status}
            </Badge>
             {booking.customerSelfDelivery && (
                <div className="flex items-center text-xs text-blue-600 mt-2 bg-blue-100/70 px-2 py-1 rounded-md">
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" /> Customer will handle delivery/pickup themselves.
                </div>
            )}
          </div>
              
          <ScrollArea className="flex-grow pr-6 -mr-6 mb-4">
            <div className="space-y-4">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline">
                  <section>
                    <div className="space-y-1">
                      {timelineSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompletedStep = index < currentStatusIndex;
                        const isCurrentStep = index === currentStatusIndex;

                        return (
                          <div key={step.status} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-full border-2",
                                  isCurrentStep ? "border-primary bg-primary text-primary-foreground" :
                                  isCompletedStep ? "border-green-500 bg-green-500 text-white" :
                                  "border-muted-foreground/30 text-muted-foreground/70"
                                )}
                              >
                                {isCompletedStep ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                              </div>
                              {index < timelineSteps.length - 1 && (
                                <div className={cn(
                                    "h-4 w-0.5",
                                    isCompletedStep ? "bg-green-500" : "bg-muted-foreground/30"
                                )} />
                              )}
                            </div>
                            <span className={cn(
                                "text-xs",
                                isCurrentStep ? "font-semibold text-primary" :
                                isCompletedStep ? "text-green-600" :
                                "text-muted-foreground"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <section>
                    <h4 className="text-sm font-semibold mb-2 text-primary">Date &amp; Time</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{booking.bookingType === 'Return' ? 'Req. Return Date' : 'Start'}: {format(parseISO(booking.startTime), "PPpp")}</span>
                      </div>
                      {booking.bookingType === 'Pick-up' && booking.endTime && (
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>End: {format(parseISO(booking.endTime), "PPpp")}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Hourglass className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Duration: {duration}</span>
                      </div>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h4 className="text-sm font-semibold mb-2 text-primary">Key Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>Driver: {booking.driverName || "Not Assigned"}</span>
                      </div>
                      {booking.clientName && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>Client: {booking.clientName} (ID: {booking.clientId?.substring(0,8)}...)</span>
                        </div>
                      )}
                       {(booking.originFloor && booking.bookingType === 'Pick-up') && (
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0"><path d="M2 3h20"/><path d="M3 3v18h18V3"/><path d="M9 8v8"/><path d="M15 8v8"/><path d="M9 12h6"/></svg>
                            <span>Client Origin Floor: {booking.originFloor}</span>
                        </div>
                      )}
                       {(booking.destinationFloor && booking.bookingType === 'Return') && (
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0"><path d="M2 3h20"/><path d="M3 3v18h18V3"/><path d="M9 8v8"/><path d="M15 8v8"/><path d="M9 12h6"/></svg>
                            <span>Client Destination Floor: {booking.destinationFloor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>Type: {booking.bookingType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{booking.bookingType === 'Return' ? 'Origin Branch' : 'Destination Branch'}: {booking.branchName}</span>
                      </div>
                      {booking.spaceIdentifier && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0"><path d="M21 10H3C2.44772 10 2 10.4477 2 11V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V11C22 10.4477 21.5523 10 21 10Z"/><path d="M3 6H21V10H3V6Z"/><path d="M12 2V6"/><path d="M7 2V6"/><path d="M17 2V6"/></svg>
                          <span>Space: {booking.spaceIdentifier}</span>
                        </div>
                      )}
                      {booking.vehicleInfo && (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>Vehicle: {booking.vehicleInfo || "Not Assigned"}</span>
                        </div>
                      )}
                      {(booking.desiredWidthSqm || booking.desiredLengthSqm) && (
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>Requested Space: 
                                {booking.desiredWidthSqm && ` ${booking.desiredWidthSqm}m (W)`}
                                {booking.desiredWidthSqm && booking.desiredLengthSqm && ` x `}
                                {booking.desiredLengthSqm && ` ${booking.desiredLengthSqm}m (L)`}
                            </span>
                        </div>
                      )}
                      {(booking.disassemblyOption && booking.disassemblyOption !== 'none') && (
                        <div className="flex items-center gap-2">
                            <Construction className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>Disassembly: {disassemblyText}</span>
                        </div>
                      )}
                    </div>
                  </section>
                  <Separator />
                   {chosenDeliveryOptionForModal && (
                    <section>
                        <h4 className="text-sm font-semibold mb-2 text-primary">Selected Delivery Option</h4>
                         <div className="space-y-2 text-sm p-3 border rounded-md bg-muted/30">
                            <p><strong>Provider:</strong> {chosenDeliveryOptionForModal.providerName === 'Other' && chosenDeliveryOptionForModal.otherProviderName ? chosenDeliveryOptionForModal.otherProviderName : chosenDeliveryOptionForModal.providerName}</p>
                            <p><strong>Est. Cost:</strong> ฿{chosenDeliveryOptionForModal.estimatedCost.toFixed(2)}</p>
                            {chosenDeliveryOptionForModal.picPhoneNumber && <p><strong>PIC Phone:</strong> {chosenDeliveryOptionForModal.picPhoneNumber}</p>}
                            {chosenDeliveryOptionForModal.vehicleAssignments && chosenDeliveryOptionForModal.vehicleAssignments.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Vehicle(s) & Personnel:</h5>
                                    <ul className="space-y-1.5 pl-1">
                                        {chosenDeliveryOptionForModal.vehicleAssignments.map((va, index) => (
                                            <li key={va.id || index} className="text-xs border-l-2 pl-2 border-border/70">
                                                <div className="flex items-center gap-1.5">
                                                    <Truck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                    <span>{va.quantity}x {va.vehicleType === 'Other' && va.otherVehicleType ? va.otherVehicleType : va.vehicleType}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-1">
                                                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                    <span>{va.numberOfDrivers} Driver(s)</span>
                                                    {va.numberOfAssistants > 0 && (
                                                    <span className="ml-1 flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                        {va.numberOfAssistants} Assistant(s)
                                                    </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                  )}
                </TabsContent>

                <TabsContent value="notes">
                   <div className="space-y-4 text-sm">
                        {booking.customerNotes ? (
                            <section>
                                <h4 className="text-sm font-semibold mb-1 text-primary">Customer Notes (Logistics)</h4>
                                <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <p className="whitespace-pre-wrap">{booking.customerNotes}</p>
                                </div>
                            </section>
                        ) : (
                            <p className="text-muted-foreground text-xs">No customer notes provided.</p>
                        )}
                        <Separator className="my-2"/>
                        {booking.staffNotes ? (
                            <section>
                                <h4 className="text-sm font-semibold mb-1 text-primary">Staff Booking Notes (Internal)</h4>
                                <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <p className="whitespace-pre-wrap">{booking.staffNotes}</p>
                                </div>
                            </section>
                        ) : (
                            <p className="text-muted-foreground text-xs">No internal staff notes for this booking.</p>
                        )}
                    </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <SheetFooter className="pt-4 mt-auto border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {booking.status === 'Pending' && (
                <div className="sm:col-span-2 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {booking.customerSelfDelivery 
                        ? "Customer will handle delivery/pickup. Once items arrive/are picked up, proceed to update status."
                        : "This booking is awaiting delivery planning. Options will be added by the delivery team via the Delivery Planning Hub."
                    }
                  </p>
                  {!booking.customerSelfDelivery && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (typeof window !== 'undefined' && booking) {
                                const link = `${window.location.origin}/delivery-summary/${booking.id}`;
                                navigator.clipboard.writeText(link)
                                .then(() => {
                                    toast({ title: "Link Copied", description: "Delivery summary link copied to clipboard." });
                                })
                                .catch(err => {
                                    console.error('Failed to copy link: ', err);
                                    toast({ title: "Copy Failed", description: "Could not copy link. Please try manually.", variant: "destructive" });
                                });
                            }
                        }}
                    >
                        <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Delivery Summary Link
                    </Button>
                  )}
                  {/* Action to manually move Pending to Processing for self-delivery */}
                  {booking.customerSelfDelivery && (
                     <Button 
                        variant="default" 
                        onClick={() => onUpdateStatus(booking.id, 'Processing')} 
                        disabled={isActionDisabled}
                        className="sm:col-span-2"
                      >
                        <ListChecks className="mr-2 h-4 w-4" /> Mark as Ready for Review
                      </Button>
                  )}
                </div>
              )}
              {booking.status === 'Processing' && !booking.customerSelfDelivery && (
                 <Button 
                  variant="default" 
                  onClick={() => setIsChooseDeliveryModalOpen(true)} 
                  disabled={isActionDisabled}
                  className="sm:col-span-2"
                >
                  <ListChecks className="mr-2 h-4 w-4" /> Select Delivery Option
                </Button>
              )}
               {booking.status === 'Processing' && booking.customerSelfDelivery && (
                 <p className="text-xs text-muted-foreground text-center sm:col-span-2">
                    Customer is handling delivery/pickup. Proceed to 'Pre-confirmed' once ready for payment.
                 </p>
              )}
              {booking.status === 'Pre-confirmed' && (
                <>
                  <Button 
                    variant="default" 
                    onClick={handleConfirmPaymentAndFinalize} 
                    disabled={isActionDisabled}
                    className="w-full" 
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Confirm Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSendCheckoutPageAction} 
                    disabled={isActionDisabled || (!booking.chosenDeliveryOptionId && !booking.customerSelfDelivery)}
                    className="w-full"
                  >
                    <SendToBack className="mr-2 h-4 w-4" /> Send Checkout Page
                  </Button>
                </>
              )}
               {booking.status === 'Confirmed' && bookingIsToday && (
                 <Button 
                    variant="default"
                    onClick={handleMarkAsInTransit}
                    disabled={isActionDisabled}
                    className="bg-orange-500 hover:bg-orange-600 text-white sm:col-span-2"
                  >
                    <Bike className="mr-2 h-4 w-4" /> Mark as In Transit
                  </Button>
               )}
               {booking.status === 'Confirmed' && !bookingIsToday && (
                 <p className="text-xs text-muted-foreground text-center sm:col-span-2">
                    This confirmed booking is not for today. "In Transit" option will appear on the service date.
                 </p>
               )}
                {booking.status === 'InTransit' && (
                 <Button 
                    variant="default"
                    onClick={handleReadyForAllocation} 
                    disabled={isActionDisabled}
                    className="bg-sky-600 hover:bg-sky-700 text-white sm:col-span-2"
                  >
                    <Archive className="mr-2 h-4 w-4" /> Ready for Allocation
                  </Button>
               )}
               {booking.status === 'AwaitingAllocation' && (
                 <Button 
                    variant="default"
                    onClick={() => setIsConfirmSpaceModalOpen(true)}
                    disabled={isActionDisabled}
                    className="bg-green-600 hover:bg-green-700 text-white sm:col-span-2"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Finalize Allocation & Complete
                  </Button>
               )}
              
              <Button 
                variant="destructive" 
                onClick={handleRejectBookingAction} 
                disabled={!canReject || isActionDisabled} 
                className="w-full"
              >
                <Ban className="mr-2 h-4 w-4" /> Reject Booking 
              </Button>
              <SheetClose asChild>
                <Button variant="secondary" className="w-full">Close</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {booking && booking.status === 'Processing' && !booking.customerSelfDelivery && deliveryOptions.length > 0 && (
        <ChooseDeliveryOptionModal
            bookingId={booking.id}
            isOpen={isChooseDeliveryModalOpen}
            onOpenChange={setIsChooseDeliveryModalOpen}
            deliveryOptions={deliveryOptions}
            onSelectOption={handleSelectDeliveryOption}
        />
      )}
       {booking && booking.status === 'Processing' && !booking.customerSelfDelivery && deliveryOptions.length === 0 && isChooseDeliveryModalOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsChooseDeliveryModalOpen(false)}>
            <div className="bg-background p-6 rounded-lg shadow-xl text-center" onClick={e => e.stopPropagation()}>
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Delivery Options Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    The delivery team has not proposed any options for this booking yet. <br/>
                    Please check the <Link href={`/delivery-summary/${booking.id}`} className="text-primary hover:underline">Delivery Summary page</Link> or coordinate with the delivery team.
                </p>
                <Button onClick={() => setIsChooseDeliveryModalOpen(false)}>Close</Button>
            </div>
         </div>
      )}
       {booking && booking.status === 'Pre-confirmed' && (chosenDeliveryOptionForModal || booking.customerSelfDelivery) && (
        <SendCheckoutPageModal
          booking={booking}
          chosenDeliveryOption={chosenDeliveryOptionForModal} // Can be null if self-delivery
          isOpen={isSendCheckoutModalOpen}
          onOpenChange={setIsSendCheckoutModalOpen}
        />
      )}
      {booking && (booking.status === 'AwaitingAllocation' || (booking.status === 'InTransit' && booking.bookingType === 'Return')) && (
         <ConfirmSpaceUsageModal
            booking={booking}
            isOpen={isConfirmSpaceModalOpen}
            onOpenChange={setIsConfirmSpaceModalOpen}
            onConfirm={handleSpaceUsageConfirmed} 
          />
      )}
    </>
  );
}
