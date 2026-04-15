
// This file is no longer used as the concept of fixed, pre-defined spaces
// within a branch has been removed in favor of flexible, post-allocations.
// The branch detail page no-longer lists these types of spaces.
// You can safely delete this file if it's not referenced elsewhere.

"use client";

import type { Space } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, MoreHorizontal, PackageSearch, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SpaceTableProps {
  spaces: Space[];
  branchId: string;
}

export function SpaceTable({ spaces, branchId }: SpaceTableProps) {
  
  const handleEdit = (spaceId: string) => {
    console.log("Edit space:", spaceId, "in branch", branchId);
    alert(`Edit space: ${spaceId} (Not implemented - Fixed spaces deprecated)`);
  };

  const handleDelete = (spaceId: string) => {
    console.log("Delete space:", spaceId, "in branch", branchId);
    if (confirm('Are you sure you want to delete this space? (Fixed spaces deprecated)')) {
      alert(`Space ${spaceId} deleted (Not implemented - Fixed spaces deprecated)`);
    }
  };

  const handleAllocate = (spaceId: string) => {
    console.log("Allocate space:", spaceId);
    alert(`Allocate space: ${spaceId} (Not implemented - Fixed spaces deprecated)`);
  };

  const getStatusBadgeVariant = (status: Space['status']) => {
    switch (status) {
      case 'Available': return 'default';
      case 'Occupied': return 'secondary';
      case 'Reserved': return 'outline';
      case 'Maintenance': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center py-8 text-muted-foreground">
          This component (Fixed Space Table) is deprecated. Branch space is now managed via Flexible Allocations.
        </div>
        {spaces.length > 0 && ( // Keep table structure for context if needed, but it won't render content
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Identifier</TableHead>
                <TableHead>Dimensions (m)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden lg:table-cell">Monthly Rate (THB)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {spaces.map((space) => (
                <TableRow key={space.id}>
                    <TableCell className="font-medium">{space.spaceIdentifier}</TableCell>
                    <TableCell>{space.dimensions}</TableCell>
                    <TableCell>
                    <Badge variant={getStatusBadgeVariant(space.status)} className={space.status === 'Available' ? 'bg-primary text-primary-foreground' : space.status === 'Reserved' ? 'border-accent text-accent-foreground' : ''}>
                        {space.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                    {space.clientId ? (
                        <Link href={`/clients/${space.clientId}`} className="hover:underline text-primary">
                        {space.clientName || 'View Client'}
                        </Link>
                    ) : (
                        'N/A'
                    )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                    {space.monthlyRate ? `฿${space.monthlyRate.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                    {/* Actions are effectively disabled as this component is deprecated */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled>
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Actions</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                            <PackageSearch className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
