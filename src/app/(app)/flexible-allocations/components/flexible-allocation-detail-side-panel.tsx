
"use client";

import type { AllocatedBulkSpace } from "@/types";
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
import { 
  User, Building, Archive, CalendarDays, Tag, FileText, Repeat, Edit2, DollarSign, Send, ExternalLink, Package, AlertTriangle, Info, ClipboardCopy, Edit3
} from "lucide-react"; 
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SendExtensionCheckoutModal } from "./send-extension-checkout-modal";
import { RequestExtensionModal } from "./request-extension-modal";
import { EditAllocationModal } from "./edit-allocation-modal"; 

interface FlexibleAllocationDetailSidePanelProps {
  allocation: AllocatedBulkSpace | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditDetails: (allocationId: string, updates: Partial<AllocatedBulkSpace>) => void;
  onRequestExtension: (allocationId: string, newTotalSpaceSqm: number, additionalFee: number) => void;
  onInitiateReturn: (allocation: AllocatedBulkSpace) => void; // Kept for potential future use, but button removed for now
  onSendExtensionCheckout: (allocationId: string, checkoutType: 'gateway' | 'manual') => void;
}

export function FlexibleAllocationDetailSidePanel({ 
  allocation, 
  isOpen, 
  onOpenChange,
  onEditDetails,
  onRequestExtension,
  onInitiateReturn, // Kept for potential future use
  onSendExtensionCheckout
}: FlexibleAllocationDetailSidePanelProps) {
  const { toast } = useToast();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRequestExtensionModalOpen, setIsRequestExtensionModalOpen] = useState(false);
  const [isEditAllocationModalOpen, setIsEditAllocationModalOpen] = useState(false);

  if (!allocation) return null;

  const getStatusBadgeVariant = (status: AllocatedBulkSpace['status']) => {
    switch (status) {
      case 'Occupied': return 'default';
      case 'Reserved': return 'outline';
      case 'AwaitingExtensionPayment': return 'secondary';
      case 'Released': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleEditAllocationAction = () => {
    setIsEditAllocationModalOpen(true);
  };

  const handleConfirmAllocationEdit = (allocationId: string, newUnitIdString: string, newUsedSpaceSqm: number, newNotes: string | undefined) => {
    onEditDetails(allocationId, { 
      internalUnitIdentifier: newUnitIdString, 
      usedSpaceSqm: newUsedSpaceSqm,
      notes: newNotes,
    });
  };
  
  const handleRequestExtensionAction = () => {
    setIsRequestExtensionModalOpen(true);
  };
  
  const handleSendCheckoutModalOpen = () => {
    if (allocation.status === 'AwaitingExtensionPayment' && allocation.additionalFeeForExtension && allocation.additionalFeeForExtension > 0) {
      setIsCheckoutModalOpen(true);
    } else {
      toast({title: "Cannot Send Checkout", description: "No pending extension fee to pay for this allocation.", variant: "destructive"});
    }
  };

  const handleExtensionCheckoutSentInPanel = () => {
    // This callback could be used if the modal itself updates the data,
    // but currently the parent table handles the data update.
    // For now, just ensure the modal closes.
    setIsCheckoutModalOpen(false);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md md:max-w-lg flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">Allocation: {allocation.id.substring(0, 8)}...</SheetTitle>
            <SheetDescription>
              Details for allocation at {allocation.branchName}.
            </SheetDescription>
          </SheetHeader>

          <div className="mb-4">
            <Badge 
                variant={getStatusBadgeVariant(allocation.status)} 
                className={`capitalize text-base px-3 py-1 ${allocation.status === 'Occupied' ? 'bg-primary text-primary-foreground' : allocation.status === 'Reserved' ? 'border-accent text-accent-foreground' : allocation.status === 'AwaitingExtensionPayment' ? 'border-blue-500 text-blue-700' : ''}`}
            >
                {allocation.status}
            </Badge>
          </div>
              
          <ScrollArea className="flex-grow pr-6 -mr-6 mb-4">
            <div className="space-y-4">
              <section>
                <h4 className="text-sm font-semibold mb-2 text-primary">Key Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Client: {allocation.clientId ? <Link href={`/clients/${allocation.clientId}`} className="text-primary hover:underline">{allocation.clientName}</Link> : allocation.clientName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Branch: <Link href={`/branches/${allocation.branchId}`} className="text-primary hover:underline">{allocation.branchName}</Link></span>
                  </div>
                   <div className="flex items-start gap-2">
                    <Archive className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Used Space: {allocation.usedSpaceSqm.toFixed(2)} SQ.M</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Allocated On: {format(parseISO(allocation.allocationDate), "PPpp")}</span>
                  </div>
                  {allocation.internalUnitIdentifier && (
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>Internal Unit ID(s): {allocation.internalUnitIdentifier}</span>
                    </div>
                  )}
                   {allocation.releaseDate && (
                    <div className="flex items-start gap-2 text-destructive">
                      <CalendarDays className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Released On: {format(parseISO(allocation.releaseDate), "PPpp")}</span>
                    </div>
                  )}
                </div>
              </section>

              <Separator />
              
              {allocation.relatedBookingId && (
                 <section>
                    <h4 className="text-sm font-semibold mb-1 text-primary">Related Booking</h4>
                    <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href={`/delivery-summary/${allocation.relatedBookingId}`}>
                            View Booking Summary (ID: {allocation.relatedBookingId.substring(0,8)}...) <ExternalLink className="ml-1 h-3 w-3"/>
                        </Link>
                    </Button>
                 </section>
              )}
              
              {allocation.allocatedSpaceImageNames && allocation.allocatedSpaceImageNames.length > 0 && (
                <section>
                    <h4 className="text-sm font-semibold mb-1 text-primary">Noted Image Filenames</h4>
                    <ul className="list-disc list-inside pl-4 text-xs text-muted-foreground">
                        {allocation.allocatedSpaceImageNames.map((name, idx) => <li key={idx} className="truncate" title={name}>{name}</li>)}
                    </ul>
                </section>
              )}
              
              {allocation.notes && (
                <section>
                  <h4 className="text-sm font-semibold mb-1 text-primary">Notes</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="whitespace-pre-wrap">{allocation.notes}</p>
                  </div>
                </section>
              )}

              {allocation.status === 'AwaitingExtensionPayment' && (
                <section className="p-3 border border-blue-500/50 rounded-md bg-blue-500/10 text-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 flex-shrink-0"/>
                        <h4 className="text-sm font-semibold">Pending Extension</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                        {allocation.requestedExtendedSpaceSqm !== undefined && <p><strong>New Total Requested Space:</strong> {allocation.requestedExtendedSpaceSqm.toFixed(2)} SQ.M</p>}
                        {allocation.additionalFeeForExtension !== undefined && <p><strong>Additional Fee Due:</strong> ฿{allocation.additionalFeeForExtension.toFixed(2)}</p>}
                        {allocation.extensionRequestDate && <p><strong>Request Date:</strong> {format(parseISO(allocation.extensionRequestDate), "PPp")}</p>}
                        {allocation.extensionCheckoutSent && (
                            <p className="flex items-center gap-1">
                                <ClipboardCopy className="h-3 w-3"/>
                                <span>Checkout sent ({allocation.extensionCheckoutSent.type}) on {format(parseISO(allocation.extensionCheckoutSent.sentAt), "PPp")}</span>
                            </p>
                        )}
                    </div>
                </section>
              )}

            </div>
          </ScrollArea>

          <SheetFooter className="pt-4 mt-auto border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {allocation.status !== 'Released' && allocation.status !== 'AwaitingExtensionPayment' && (
                    <>
                        <Button variant="outline" onClick={handleEditAllocationAction} className="sm:col-span-2">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Allocation Details
                        </Button>
                        <Button variant="outline" onClick={handleRequestExtensionAction} className="sm:col-span-2">
                            <DollarSign className="mr-2 h-4 w-4" /> Request Space/Time Extension
                        </Button>
                    </>
                )}

                 {allocation.status === 'AwaitingExtensionPayment' && (
                     <Button 
                        onClick={handleSendCheckoutModalOpen} 
                        className="sm:col-span-2 bg-blue-600 hover:bg-blue-700"
                        disabled={!allocation.additionalFeeForExtension || allocation.additionalFeeForExtension <= 0}
                    >
                        <Send className="mr-2 h-4 w-4" /> Send Extension Checkout
                    </Button>
                 )}
              
              <SheetClose asChild className="sm:col-span-2">
                <Button variant="secondary">Close</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {allocation && isRequestExtensionModalOpen && (
        <RequestExtensionModal
            allocation={allocation}
            isOpen={isRequestExtensionModalOpen}
            onOpenChange={setIsRequestExtensionModalOpen}
            onConfirm={onRequestExtension}
        />
      )}
      
      {allocation && isEditAllocationModalOpen && (
        <EditAllocationModal
            allocation={allocation}
            isOpen={isEditAllocationModalOpen}
            onOpenChange={setIsEditAllocationModalOpen}
            onConfirm={handleConfirmAllocationEdit}
        />
      )}

      {allocation && allocation.status === 'AwaitingExtensionPayment' && (
        <SendExtensionCheckoutModal
          allocation={allocation}
          isOpen={isCheckoutModalOpen}
          onOpenChange={setIsCheckoutModalOpen}
          onCheckoutSent={() => {
            // The checkout type is determined within SendExtensionCheckoutModal or passed to it.
            // For now, we assume it handles its own logic for what type is sent.
            // The onSendExtensionCheckout prop is used to notify parent that some action was taken.
            onSendExtensionCheckout(allocation.id, 'gateway'); // Defaulting to 'gateway' as an example
            handleExtensionCheckoutSentInPanel();
          }}
        />
      )}
    </>
  );
}
