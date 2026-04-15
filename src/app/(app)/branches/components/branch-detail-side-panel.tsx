
"use client";

import type { Branch } from "@/types";
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
import { MapPin, Phone, Clock, Building, User, Users, BarChart3, Archive, Edit, ExternalLink, PieChart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface BranchDetailSidePanelProps {
  branch: Branch | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatFullAddressPanel = (branch: Branch | null): string => {
  if (!branch) return 'N/A';
  const parts = [
    branch.addressDetail,
    branch.subDistrict,
    branch.district,
    branch.province,
    branch.postcode,
  ].filter(Boolean);
  return parts.join(', ') || 'Address not fully specified';
};

export function BranchDetailSidePanel({ branch, isOpen, onOpenChange }: BranchDetailSidePanelProps) {
  if (!branch) return null;

  const parseCapacityToNum = (capStr?: string) => capStr ? parseInt(capStr.split(" ")[0]) : 0;
  const totalCap = parseCapacityToNum(branch.totalCapacity);
  const committedCap = parseCapacityToNum(branch.occupiedCapacity);
  const utilization = totalCap > 0 ? (committedCap / totalCap) * 100 : 0;
  const fullAddress = formatFullAddressPanel(branch);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{branch.name}</SheetTitle>
          <SheetDescription>
            Detailed information for {branch.name}.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6 mb-4">
          <div className="space-y-4">
            <section>
              <h4 className="text-sm font-semibold mb-2 text-primary">Contact & Location</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{fullAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{branch.contactInfo}</span>
                </div>
                {branch.operatingHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>{branch.operatingHours}</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section>
              <h4 className="text-sm font-semibold mb-2 text-primary">Type & Ownership</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>Type: <Badge variant="outline">{branch.branchType}</Badge></span>
                </div>
                {(branch.branchType === "Partner" || branch.branchType === "Franchise") && branch.branchOwner && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Owner/Partner: {branch.branchOwner}</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section>
                <h4 className="text-sm font-semibold mb-2 text-primary">Storage Capacity</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 border rounded-md bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-xs text-muted-foreground">Total Capacity</p>
                           <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-lg">{branch.totalCapacity || "N/A"}</p>
                    </div>
                     <div className="p-3 border rounded-md bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-xs text-muted-foreground">Committed</p>
                           <Archive className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-lg">{branch.occupiedCapacity || "0 sq m"}</p>
                    </div>
                     <div className="p-3 border rounded-md bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-xs text-muted-foreground">Remaining Bulk</p>
                           <Archive className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-lg">{branch.remainingBulkCapacity || "N/A"}</p>
                    </div>
                     <div className="p-3 border rounded-md bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-xs text-muted-foreground">Utilization</p>
                           <PieChart className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-lg">{utilization.toFixed(1)}%</p>
                    </div>
                </div>
                 {branch.ceilingHeightMeters && <p className="mt-2 text-xs text-muted-foreground">Ceiling Height: {branch.ceilingHeightMeters}m</p>}
                {branch.numberOfFloors && <p className="text-xs text-muted-foreground">Floors: {branch.numberOfFloors}</p>}
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="pt-4 mt-auto border-t gap-2">
          <Button variant="outline" asChild>
            <Link href={`/branches/${branch.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" /> View Full Page
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/branches/${branch.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Branch
            </Link>
          </Button>
           <SheetClose asChild>
            <Button variant="secondary">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
