
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
import { ExternalLink, Edit2, Repeat, DollarSign, Eye } from "lucide-react"; 
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateAllocatedBulkSpace, requestSpaceExtension, markExtensionCheckoutSent as apiMarkExtensionCheckoutSent } from "@/lib/data"; 
import { useRouter } from "next/navigation";
import { FlexibleAllocationDetailSidePanel } from "./flexible-allocation-detail-side-panel";


interface AllocationsTableProps {
  allocations: AllocatedBulkSpace[];
}

export function AllocationsTable({ allocations: initialAllocations }: AllocationsTableProps) {
  const [allocations, setAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocatedBulkSpace | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setAllocations(initialAllocations.filter(a => a.status === 'Occupied' || a.status === 'Reserved'));
  }, [initialAllocations]);
  
  const handleRowClick = (allocation: AllocatedBulkSpace) => {
    setSelectedAllocation(allocation);
    setIsPanelOpen(true);
  };

  const handleEditDetailsInPanel = (allocationId: string, updates: Partial<AllocatedBulkSpace>) => {
    const currentAllocation = allocations.find(a => a.id === allocationId);
    if (!currentAllocation) return;

    const updatedAllocation = updateAllocatedBulkSpace(allocationId, updates);
    if (updatedAllocation) {
        setAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a));
        setSelectedAllocation(updatedAllocation); 
        
        let toastMessage = `Details for allocation ID ${allocationId.substring(0,8)} updated.`;
        if (updates.internalUnitIdentifier !== undefined || updates.usedSpaceSqm !== undefined || updates.notes !== undefined) {
            toastMessage = `Allocation ${allocationId.substring(0,8)} details (Units/Space/Notes) updated.`;
        }
        
        toast({ title: "Allocation Details Updated", description: toastMessage });
    } else {
         toast({ title: "Error", description: "Failed to update allocation details.", variant: "destructive" });
    }
  };

  const handleRequestExtensionInPanel = (allocationId: string, newTotalSpaceSqm: number, additionalFee: number) => {
    const updatedAllocation = requestSpaceExtension(allocationId, newTotalSpaceSqm, additionalFee);
    if (updatedAllocation) {
      toast({
        title: "Extension Requested",
        description: `Allocation for ${updatedAllocation.clientName} moved to 'Awaiting Extension Payment'. New Space: ${newTotalSpaceSqm} SQ.M, Fee: ฿${additionalFee.toFixed(2)}.`,
      });
      setAllocations(prev => prev.filter(a => a.id !== allocationId)); 
      setSelectedAllocation(null); 
      setIsPanelOpen(false); 
      router.refresh(); 
    } else {
      toast({ title: "Error", description: "Failed to request extension.", variant: "destructive" });
    }
  };
  
  const handleInitiateReturnInPanel = (allocationToReturn: AllocatedBulkSpace) => {
    // This function is currently not called from the side panel as the button was removed.
    // Kept for potential future use or if logic needs to be triggered differently.
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
        setAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a));
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
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Current Flexible Allocations</CardTitle>
          <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
              Showing spaces currently 'Occupied' or 'Reserved'. Click row for details & actions.
          </CardContent>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Unit ID</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="text-right">Used Space (SQ.M)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Allocation Date</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((alloc) => (
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
                  <TableCell className="hidden md:table-cell">
                      <Link href={`/branches/${alloc.branchId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                          {alloc.branchName}
                      </Link>
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
          {allocations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No active flexible allocations found.</p>
              <Button asChild>
                <Link href="/flexible-allocations/new">
                  Add a New Allocation
                </Link>
              </Button>
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
          onRequestExtension={handleRequestExtensionInPanel}
          onInitiateReturn={handleInitiateReturnInPanel} // Kept for prop compatibility, not called from panel
          onSendExtensionCheckout={handleSendExtensionCheckoutInPanel}
        />
      )}
    </>
  );
}
