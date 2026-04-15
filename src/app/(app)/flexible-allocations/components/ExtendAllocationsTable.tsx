
"use client";

import type { AllocatedBulkSpace } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MoreHorizontal, FileText, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SendExtensionCheckoutModal } from "./send-extension-checkout-modal";
import { markExtensionCheckoutSent as apiMarkExtensionCheckoutSent } from "@/lib/data"; // For direct update if needed

interface ExtendAllocationsTableProps {
  allocations: AllocatedBulkSpace[];
}

export function ExtendAllocationsTable({ allocations: initialAllocations }: ExtendAllocationsTableProps) {
  const [allocations, setAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);
  const [selectedAllocationForCheckout, setSelectedAllocationForCheckout] = useState<AllocatedBulkSpace | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAllocations(initialAllocations.filter(a => a.status === 'AwaitingExtensionPayment'));
  }, [initialAllocations]);
  
  const handleOpenCheckoutModal = (allocation: AllocatedBulkSpace) => {
    setSelectedAllocationForCheckout(allocation);
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutModalClose = () => {
    setIsCheckoutModalOpen(false);
    setSelectedAllocationForCheckout(null);
  };

  const handleCheckoutSentInModal = (allocationId: string, checkoutType: 'gateway' | 'manual') => {
    const updatedAllocation = apiMarkExtensionCheckoutSent(allocationId, checkoutType);
    if (updatedAllocation) {
        setAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a));
        toast({
            title: "Extension Checkout Page Link Simulated",
            description: `Checkout link for allocation ${allocationId.substring(0,8)} marked as sent via ${checkoutType}.`,
        });
    } else {
        toast({ title: "Error", description: "Failed to mark extension checkout as sent.", variant: "destructive" });
    }
    handleCheckoutModalClose(); // Close modal after action
  };


  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Allocations Awaiting Extension Payment</CardTitle>
          <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
              These allocations have requested an extension (space or time) and are awaiting payment for the additional fee.
          </CardContent>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="text-right">Current Space (SQ.M)</TableHead>
                <TableHead className="text-right">New/Extended Space (SQ.M)</TableHead>
                <TableHead className="text-right">Additional Fee (THB)</TableHead>
                <TableHead className="hidden lg:table-cell">Request Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((alloc) => (
                <TableRow key={alloc.id}>
                  <TableCell className="font-medium">
                      <Link href={`/clients/${alloc.clientId}`} className="hover:underline text-primary">
                          {alloc.clientName}
                      </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                      <Link href={`/branches/${alloc.branchId}`} className="hover:underline">
                          {alloc.branchName}
                      </Link>
                  </TableCell>
                  <TableCell className="text-right">{alloc.usedSpaceSqm.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-amber-600 font-semibold">
                    {alloc.requestedExtendedSpaceSqm ? alloc.requestedExtendedSpaceSqm.toFixed(2) : 
                     (alloc.status === 'AwaitingExtensionPayment' && !alloc.requestedExtendedSpaceSqm ? `${alloc.usedSpaceSqm.toFixed(2)} (Time Ext.)` : 'N/A')}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    ฿{alloc.additionalFeeForExtension ? alloc.additionalFeeForExtension.toFixed(2) : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {alloc.extensionRequestDate ? format(parseISO(alloc.extensionRequestDate), "MMM d, yyyy") : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenCheckoutModal(alloc)}
                      disabled={!alloc.additionalFeeForExtension || alloc.additionalFeeForExtension <= 0 || !!alloc.extensionCheckoutSent}
                    >
                      <Send className="mr-1 h-3 w-3" /> 
                      {alloc.extensionCheckoutSent ? "Checkout Sent" : "Send Checkout"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {allocations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No allocations are currently awaiting extension payment.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedAllocationForCheckout && (
        <SendExtensionCheckoutModal
            allocation={selectedAllocationForCheckout}
            isOpen={isCheckoutModalOpen}
            onOpenChange={handleCheckoutModalClose}
            onCheckoutSent={(checkoutType) => { // Modal now passes checkoutType
                handleCheckoutSentInModal(selectedAllocationForCheckout.id, checkoutType);
            }}
        />
      )}
    </>
  );
}
