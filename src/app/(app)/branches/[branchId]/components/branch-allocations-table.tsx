
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
import { Eye, PackagePlus, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateAllocatedBulkSpace, requestSpaceExtension, requestTimeExtension, markExtensionCheckoutSent as apiMarkExtensionCheckoutSent } from "@/lib/data";
import { useRouter } from "next/navigation";
import { FlexibleAllocationDetailSidePanel } from "@/app/(app)/flexible-allocations/components/FlexibleAllocationDetailSidePanel";

interface BranchAllocationsTableProps {
  allocations: AllocatedBulkSpace[];
}

export function BranchAllocationsTable({ allocations: initialAllocations }: BranchAllocationsTableProps) {
  const [branchAllocations, setBranchAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocatedBulkSpace | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setBranchAllocations(initialAllocations);
  }, [initialAllocations]);
  
  const handleRowClick = (allocation: AllocatedBulkSpace) => {
    setSelectedAllocation(allocation);
    setIsPanelOpen(true);
  };

  const handleEditDetailsInPanel = (allocationId: string, updates: Partial<AllocatedBulkSpace>) => {
    const updatedAllocation = updateAllocatedBulkSpace(allocationId, updates);
    if (updatedAllocation) {
        setBranchAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a).filter(a => a.status === 'Occupied' || a.status === 'Reserved'));
        setSelectedAllocation(updatedAllocation); 
        toast({ title: "Allocation Details Updated", description: `Details for allocation ID ${allocationId.substring(0,8)} updated.` });
    } else {
         toast({ title: "Error", description: "Failed to update allocation details.", variant: "destructive" });
    }
  };

  const handleRequestSpaceExtensionInPanel = (allocationId: string, newTotalSpaceSqm: number, additionalFee: number) => {
    const updatedAllocation = requestSpaceExtension(allocationId, newTotalSpaceSqm, additionalFee);
    if (updatedAllocation) {
      toast({
        title: "Space Extension Requested",
        description: `Allocation for ${updatedAllocation.clientName} moved to Awaiting Payment. New Space: ${newTotalSpaceSqm} SQ.M, Fee: ฿${additionalFee.toFixed(2)}.`,
      });
      setBranchAllocations(prev => prev.filter(a => a.id !== allocationId)); 
      setSelectedAllocation(null); 
      setIsPanelOpen(false); 
      router.refresh(); 
    } else {
      toast({ title: "Error", description: "Failed to request space extension.", variant: "destructive" });
    }
  };
  
  const handleRequestTimeExtensionInPanel = (allocationId: string, additionalMonths: number, calculatedFee: number) => {
    const updatedAllocation = requestTimeExtension(allocationId, additionalMonths, calculatedFee);
    if (updatedAllocation) {
      toast({
        title: "Time Extension Requested",
        description: `Allocation for ${updatedAllocation.clientName} moved to Awaiting Payment. ${additionalMonths} month(s) extension, Fee: ฿${calculatedFee.toFixed(2)}.`,
      });
      setBranchAllocations(prev => prev.filter(a => a.id !== allocationId)); 
      setSelectedAllocation(null); 
      setIsPanelOpen(false); 
      router.refresh(); 
    } else {
      toast({ title: "Error", description: "Failed to request time extension.", variant: "destructive" });
    }
  };

  const handleInitiateReturnInPanel = (allocationToReturn: AllocatedBulkSpace) => {
    // This logic would typically redirect to a new booking page with pre-filled data
    if (!allocationToReturn.clientId) {
        toast({title: "Cannot Initiate Return", description: "This allocation is system reserved and not assigned to a client.", variant: "destructive"});
        return;
    }
    const url = `/bookings/new?clientId=${allocationToReturn.clientId}&bookingType=Return&selectedAllocationId=${allocationToReturn.id}&branchId=${allocationToReturn.branchId}`;
    router.push(url);
    toast({ title: "Redirecting for Return", description: `Initiating return process for ${allocationToReturn.clientName}.` });
    setIsPanelOpen(false);
  };

  const handleSendExtensionCheckoutInPanel = (allocationId: string, checkoutType: 'gateway' | 'manual') => {
    const updatedAllocation = apiMarkExtensionCheckoutSent(allocationId, checkoutType);
    if (updatedAllocation) {
        setBranchAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a).filter(a => a.status === 'Occupied' || a.status === 'Reserved' || a.status === 'AwaitingExtensionPayment'));
        setSelectedAllocation(updatedAllocation); 
        toast({
            title: "Extension Checkout Page Link Simulated",
            description: `Checkout link for allocation ${allocationId.substring(0,8)} marked as sent.`,
        });
    } else {
        toast({ title: "Error", description: "Failed to mark extension checkout as sent.", variant: "destructive" });
    }
  };
  
  const getStatusBadgeVariant = (status: AllocatedBulkSpace['status']) => {
    switch (status) {
      case 'Occupied': return 'default'; 
      case 'Reserved': return 'outline'; 
      default: return 'secondary';
    }
  };

  return (
    <>
      <Card className="shadow-md">
        <CardContent className="pt-6">
          {branchAllocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client / Unit ID</TableHead>
                  <TableHead className="text-right">Used Space (SQ.M)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Allocation Date</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchAllocations.map((alloc) => (
                  <TableRow 
                      key={alloc.id} 
                      onClick={() => handleRowClick(alloc)} 
                      className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                        {alloc.clientId ? (
                            <Link href={`/clients/${alloc.clientId}`} onClick={(e) => e.stopPropagation()} className="hover:underline text-primary block">
                                {alloc.clientName}
                            </Link>
                        ) : (
                            <span className="block">{alloc.clientName}</span>
                        )}
                        {alloc.internalUnitIdentifier && (
                            <span className="text-xs text-muted-foreground block">Unit(s): {alloc.internalUnitIdentifier}</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">{alloc.usedSpaceSqm.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(alloc.status)}
                        className={alloc.status === 'Occupied' ? 'bg-primary text-primary-foreground' : alloc.status === 'Reserved' ? 'border-accent text-accent-foreground' : ''}
                      >
                        {alloc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{format(parseISO(alloc.allocationDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(alloc);}} className="text-xs">
                          <Eye className="mr-1 h-3 w-3" /> View
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
                <PackagePlus className="mx-auto h-12 w-12 mb-4 text-primary/30" />
                <p className="text-lg mb-2">No current flexible allocations for this branch.</p>
                <p className="text-sm">
                    You can add a new allocation via the 
                    <Button variant="link" asChild className="px-1">
                        <Link href="/flexible-allocations/new">Flexible Allocations page</Link>
                    </Button>.
                </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAllocation && (
        <FlexibleAllocationDetailSidePanel
          allocation={selectedAllocation}
          isOpen={isPanelOpen}
          onOpenChange={setIsPanelOpen}
          onEditDetails={handleEditDetailsInPanel}
          onRequestExtension={handleRequestSpaceExtensionInPanel} 
          onInitiateReturn={handleInitiateReturnInPanel} 
          onSendExtensionCheckout={handleSendExtensionCheckoutInPanel}
        />
      )}
    </>
  );
}
