
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
import { CalendarClock, Repeat, DollarSign, AlertTriangle, ExternalLink, Send } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { processAllocationRenewal as apiProcessAllocationRenewal, confirmExtensionPayment as apiConfirmExtensionPayment } from "@/lib/data";

interface AwaitingRenewalAllocationsTableProps {
  allocations: AllocatedBulkSpace[];
}

export function AwaitingRenewalAllocationsTable({ allocations: initialAllocations }: AwaitingRenewalAllocationsTableProps) {
  const [allocations, setAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setAllocations(initialAllocations.filter(a => a.status === 'AwaitingRenewal'));
  }, [initialAllocations]);
  
  const handleProcessRenewal = (allocationId: string) => {
    // For simplicity, renew for 1 month. A modal could ask for duration.
    const renewedAllocation = apiProcessAllocationRenewal(allocationId, 1);
    if (renewedAllocation) {
      toast({
        title: "Renewal Processed",
        description: `Allocation ${allocationId.substring(0,8)} for ${renewedAllocation.clientName} renewed. New end date: ${renewedAllocation.currentBillingCycleEndDate ? format(parseISO(renewedAllocation.currentBillingCycleEndDate), "PP") : 'N/A'}.`,
      });
      setAllocations(prev => prev.filter(a => a.id !== allocationId)); // Remove from this list
      router.refresh(); // Refresh page data
    } else {
      toast({ title: "Error", description: "Failed to process renewal.", variant: "destructive" });
    }
  };

  const handleInitiateReturn = (allocation: AllocatedBulkSpace) => {
    if (!allocation.clientId) {
      toast({ title: "Error", description: "Client ID missing for this allocation.", variant: "destructive"});
      return;
    }
    const url = `/bookings/new?clientId=${allocation.clientId}&bookingType=Return&selectedAllocationId=${allocation.id}&branchId=${allocation.branchId}`;
    router.push(url);
    toast({ title: "Redirecting", description: `Initiating return process for ${allocation.clientName}.` });
  };

  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Allocations Awaiting Renewal</CardTitle>
           <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
              These allocations are nearing their billing cycle end date. Process renewal or initiate a return.
          </CardContent>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="text-right">Used Space (SQ.M)</TableHead>
                <TableHead>Billing Cycle End</TableHead>
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
                  <TableCell className="text-amber-600 font-semibold">
                    {alloc.currentBillingCycleEndDate ? format(parseISO(alloc.currentBillingCycleEndDate), "PP") : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleProcessRenewal(alloc.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="mr-1 h-3 w-3" /> Renew
                    </Button>
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInitiateReturn(alloc)}
                    >
                      <Send className="mr-1 h-3 w-3" /> Initiate Return
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {allocations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarClock className="mx-auto h-12 w-12 mb-4 text-primary/30" />
              <p className="text-lg mb-2">No allocations are currently awaiting renewal.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
