
"use client";

import type { AllocatedBulkSpace } from "@/types"; // Changed from Space to AllocatedBulkSpace
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
import { Edit, MoreHorizontal, UserCog, Repeat, ExternalLink, CheckSquare, Square, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateAllocatedBulkSpace, releaseAllocatedBulkSpace as apiReleaseAllocatedBulkSpace } from "@/lib/data";

// This table now displays AllocatedBulkSpace, similar to AllocationsTable
interface AllSpacesTableProps {
  allocations: AllocatedBulkSpace[];
}

export function AllSpacesTable({ allocations: initialAllocations }: AllSpacesTableProps) {
  const [allocations, setAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);
  const { toast } = useToast();

  useEffect(() => {
    // Filter to show only active allocations, similar to flexible-allocations page
    setAllocations(initialAllocations.filter(a => a.status === 'Occupied' || a.status === 'Reserved'));
  }, [initialAllocations]);
  
  const handleEditUsedSpace = (allocationId: string) => {
    const currentAllocation = allocations.find(a => a.id === allocationId);
    const newSize = prompt(`Enter new used space (SQ.M) for ${currentAllocation?.clientName} at ${currentAllocation?.branchName}:`, currentAllocation?.usedSpaceSqm.toString());
    if (newSize !== null && !isNaN(parseFloat(newSize)) && parseFloat(newSize) > 0) {
      const updatedAllocation = updateAllocatedBulkSpace(allocationId, { usedSpaceSqm: parseFloat(newSize) });
      if (updatedAllocation) {
        setAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a));
        toast({ title: "Space Updated", description: `Used space for ${updatedAllocation.clientName} updated to ${updatedAllocation.usedSpaceSqm} SQ.M.` });
      }
    } else if (newSize !== null) {
      toast({ title: "Invalid Input", description: "Please enter a positive number.", variant: "destructive" });
    }
  };

  const handleReassignClient = (allocationId: string) => {
    const currentAllocation = allocations.find(a => a.id === allocationId);
    // Placeholder: In a real app, open a modal with client dropdown
    toast({ title: "Action Required", description: `Implement client re-assignment for allocation of ${currentAllocation?.usedSpaceSqm} SQ.M for ${currentAllocation?.clientName}. (Not implemented)`});
  };

  const handleChangeStatus = (allocationId: string, newStatus: 'Occupied' | 'Reserved') => {
     const updatedAllocation = updateAllocatedBulkSpace(allocationId, { status: newStatus });
     if (updatedAllocation) {
        setAllocations(prev => prev.map(a => a.id === allocationId ? updatedAllocation : a).filter(a => a.status === 'Occupied' || a.status === 'Reserved'));
        toast({ title: "Status Updated", description: `Allocation for ${updatedAllocation.clientName} is now ${newStatus}.` });
     }
  };
  
  const handleReleaseSpace = (allocationId: string) => {
    if (confirm('Are you sure you want to release this space? This marks the items as returned and the space as available.')) {
      const success = apiReleaseAllocatedBulkSpace(allocationId); // This function in lib/data now just filters it out from mock data
      if (success) {
        setAllocations(prev => prev.filter(a => a.id !== allocationId));
        toast({ title: "Space Released", description: `Allocation ID ${allocationId.substring(0,8)} has been released.` });
      } else {
        toast({ title: "Error", description: "Failed to release space.", variant: "destructive" });
      }
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
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Currently Allocated Flexible Spaces</CardTitle>
        <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
            This table shows all flexible spaces currently 'Occupied' or 'Reserved' across all branches.
        </CardContent>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Used Space (SQ.M)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Allocation Date</TableHead>
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
                <TableCell>
                    <Link href={`/branches/${alloc.branchId}`} className="hover:underline">
                        {alloc.branchName}
                    </Link>
                </TableCell>
                <TableCell className="text-right">{alloc.usedSpaceSqm.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(alloc.status)}
                    className={alloc.status === 'Occupied' ? 'bg-primary text-primary-foreground' : 'border-accent text-accent-foreground'}
                  >
                    {alloc.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{format(parseISO(alloc.allocationDate), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => toast({ title: "View Details", description: `Viewing details for allocation ID ${alloc.id.substring(0,8)} (Not fully implemented)`})}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUsedSpace(alloc.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Used Space
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReassignClient(alloc.id)}>
                        <UserCog className="mr-2 h-4 w-4" /> Re-assign Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {alloc.status === 'Occupied' && (
                        <DropdownMenuItem onClick={() => handleChangeStatus(alloc.id, 'Reserved')}>
                          <Square className="mr-2 h-4 w-4" /> Mark as Reserved
                        </DropdownMenuItem>
                      )}
                      {alloc.status === 'Reserved' && (
                        <DropdownMenuItem onClick={() => handleChangeStatus(alloc.id, 'Occupied')}>
                           <CheckSquare className="mr-2 h-4 w-4" /> Mark as Occupied
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleReleaseSpace(alloc.id)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Release Space
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {allocations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No active flexible allocations found across any branch.</p>
            <Button asChild>
              <Link href="/flexible-allocations/new">
                Add a New Allocation
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
