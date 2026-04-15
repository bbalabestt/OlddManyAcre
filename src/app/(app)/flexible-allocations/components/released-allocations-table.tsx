
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
import { FileText, History } from "lucide-react"; // Removed Eye
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from "react";

interface ReleasedAllocationsTableProps {
  allocations: AllocatedBulkSpace[];
}

export function ReleasedAllocationsTable({ allocations: initialAllocations }: ReleasedAllocationsTableProps) {
  const [allocations, setAllocations] = useState<AllocatedBulkSpace[]>(initialAllocations);

  useEffect(() => {
    setAllocations(initialAllocations.filter(a => a.status === 'Released'));
  }, [initialAllocations]);
  

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Released Allocations History</CardTitle>
         <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
            A log of spaces that have been released by clients.
        </CardContent>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Branch</TableHead>
              <TableHead className="text-right">Used Space (SQ.M)</TableHead>
              <TableHead className="hidden lg:table-cell">Allocation Date</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((alloc) => (
              <TableRow key={alloc.id}>
                <TableCell className="font-medium">
                    {alloc.clientId ? (
                        <Link href={`/clients/${alloc.clientId}`} className="hover:underline text-primary">
                            {alloc.clientName}
                        </Link>
                    ) : (
                        alloc.clientName 
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Link href={`/branches/${alloc.branchId}`} className="hover:underline">
                        {alloc.branchName}
                    </Link>
                </TableCell>
                <TableCell className="text-right">{alloc.usedSpaceSqm.toFixed(2)}</TableCell>
                <TableCell className="hidden lg:table-cell">{format(parseISO(alloc.allocationDate), "MMM d, yyyy")}</TableCell>
                <TableCell>{alloc.releaseDate ? format(parseISO(alloc.releaseDate), "MMM d, yyyy") : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled>
                    <FileText className="mr-1 h-3 w-3" /> View Log (N/A)
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {allocations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <History className="mx-auto h-12 w-12 mb-4 text-primary/30" />
            <p className="text-lg mb-2">No released allocations found in history.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
