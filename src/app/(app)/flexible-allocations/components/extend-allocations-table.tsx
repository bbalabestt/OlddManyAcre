
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
    // Potentially refresh allocations list if status might change after sending checkout
    // For now, we assume status doesn't change just by sending link
  };


  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Allocations Awaiting Extension Payment</CardTitle>
          <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
              These allocations have requested an extension and are awaiting payment for the additional fee.
          </CardContent>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="text-right">Current Space (SQ.M)</TableHead>
                <TableHead className="text-right">New Total Space (SQ.M)</TableHead>
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
                    {alloc.requestedExtendedSpaceSqm ? alloc.requestedExtendedSpaceSqm.toFixed(2) : 'N/A'}
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
                      disabled={!alloc.additionalFeeForExtension || alloc.additionalFeeForExtension <= 0}
                    >
                      <Send className="mr-1 h-3 w-3" /> Send Checkout
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
            onCheckoutSent={() => {
                // This callback can be used to update the local state if needed
                // For example, to refresh the list or update the specific allocation item.
                // For now, we will just close the modal.
                const updatedAllocations = allocations.map(alloc => 
                    alloc.id === selectedAllocationForCheckout.id 
                    ? { ...alloc, extensionCheckoutSent: { type: 'gateway', sentAt: new Date().toISOString() } } // Dummy update for UI feedback
                    : alloc
                );
                setAllocations(updatedAllocations);
            }}
        />
      )}
    </>
  );
}
