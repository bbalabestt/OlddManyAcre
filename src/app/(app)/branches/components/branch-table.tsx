
"use client";

import type { Branch } from "@/types";
import { useState } from "react";
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
import { Eye, Edit, Trash2, MoreHorizontal, ExternalLink, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BranchTableProps {
  branches: Branch[];
}

export function BranchTable({ branches }: BranchTableProps) {
  const router = useRouter();

  const handleRowClick = (branch: Branch) => {
    router.push(`/branches/${branch.id}`);
  };

  const handleDelete = (branchId: string, branchName: string) => {
    console.log("Delete branch:", branchId);
    if(confirm(`Are you sure you want to delete branch "${branchName}"? This action cannot be undone.`)){
      alert(`Branch ${branchName} would be deleted. (Not implemented)`);
    }
  };

  const parseCapacityStringToNumber = (capacityString?: string): number => {
    if (!capacityString) return 0;
    const parts = capacityString.match(/^(\d+(\.\d+)?)/);
    return parts ? parseFloat(parts[1]) : 0;
  };

  const getUtilizationColor = (percentage: number): string => {
    const hue = Math.max(0, 120 - percentage * 1.2);
    return `hsl(${hue}, 70%, 45%)`;
  };

  const formatShortAddress = (branch: Branch): string => {
    const parts = [
      branch.addressDetail,
      branch.subDistrict,
    ].filter(Boolean);
    if (parts.length === 0 && branch.province) return branch.province; // Fallback to province if detail and subDistrict are missing
    return parts.join(', ') || 'N/A';
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell min-w-[200px]">Space (SQ.M)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => {
                const occupied = parseCapacityStringToNumber(branch.occupiedCapacity);
                const total = parseCapacityStringToNumber(branch.totalCapacity);
                const percentage = total > 0 ? Math.min(100, (occupied / total) * 100) : 0;
                const progressBarColor = getUtilizationColor(percentage);
                const shortAddress = formatShortAddress(branch);

                return (
                  <TableRow
                    key={branch.id}
                    onClick={() => handleRowClick(branch)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {branch.name}
                      <div className="text-xs text-muted-foreground md:hidden">{shortAddress}</div>
                      <div className="mt-1 md:hidden"> {/* Progress bar for mobile */}
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {occupied} of {total || 'N/A'} ({percentage.toFixed(0)}%)
                        </div>
                        <Progress
                          value={percentage}
                          style={{ '--primary': progressBarColor } as React.CSSProperties}
                          className="h-1.5 w-full"
                          aria-label={`Capacity utilized: ${percentage.toFixed(0)}%`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{shortAddress}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={branch.branchType === "Owned" ? "default" : "secondary"} className="capitalize">
                        <Building className="mr-1 h-3 w-3" />
                        {branch.branchType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{branch.contactInfo}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>
                          {occupied} of {total || 'N/A'} ({percentage.toFixed(0)}%)
                        </span>
                        <Progress
                          value={percentage}
                          style={{ '--primary': progressBarColor } as React.CSSProperties}
                          className="h-1.5 w-full mt-1"
                          aria-label={`Capacity utilized: ${percentage.toFixed(0)}%`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                           <DropdownMenuItem asChild>
                            <Link href={`/branches/${branch.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" /> View Full Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/branches/${branch.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(branch.id, branch.name)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {branches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No branches found. <Link href="/branches/new" className="text-primary hover:underline">Add your first branch!</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
