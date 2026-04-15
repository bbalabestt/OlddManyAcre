
import { getBranchById, getAllocatedBulkSpaces } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, PlusCircle, MapPin, Phone, Building, Clock, Archive, PieChart } from "lucide-react"; // Added Archive, PieChart
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from 'next';
import { Badge } from "@/components/ui/badge";
import type { Branch } from "@/types";
import { BranchAllocationsTable } from "./components/branch-allocations-table";
import { BranchFlexibleUnitView } from "./components/BranchFlexibleUnitView"; // New Import
import { parseCapacityToNumber } from "@/lib/utils"; // New Import

type Props = {
  params: { branchId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const branch = getBranchById(params.branchId);
  const previousTitle = (await parent).title?.absolute || 'Branches';
  return {
    title: branch ? `${branch.name} Details` : 'Branch Not Found',
  };
}

const formatFullAddress = (branch: Branch | undefined): string => {
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

export default async function BranchDetailPage({ params }: Props) {
  const branch = getBranchById(params.branchId);

  if (!branch) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-semibold">Branch Not Found</h1>
        <p className="text-muted-foreground">The branch you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/branches">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Branches
          </Link>
        </Button>
      </div>
    );
  }

  const allAllocations = getAllocatedBulkSpaces();
  const branchCurrentAllocations = allAllocations.filter(
    alloc => alloc.branchId === branch.id && (alloc.status === 'Occupied' || alloc.status === 'Reserved')
  );

  const fullAddress = formatFullAddress(branch);
  const totalCapacitySqm = parseCapacityToNumber(branch.totalCapacity);
  const occupiedCapacitySqm = parseCapacityToNumber(branch.occupiedCapacity);
  const remainingBulkCapacitySqm = parseCapacityToNumber(branch.remainingBulkCapacity);


  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/branches">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Branches
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">{branch.name}</h1>
             <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Building className="h-4 w-4" />
              <Badge variant="outline">{branch.branchType}</Badge>
              {branch.branchOwner && <span> (Owner: {branch.branchOwner})</span>}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" /> <span>{fullAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Phone className="h-4 w-4" /> <span>{branch.contactInfo}</span>
            </div>
             {branch.operatingHours && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" /> <span>{branch.operatingHours}</span>
                </div>
            )}
          </div>
          <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
            <Link href={`/branches/${branch.id}/edit`}>
              <Edit className="mr-2 h-5 w-5" /> Edit Branch
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacitySqm > 0 ? `${totalCapacitySqm} m²` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Total bulk storage capacity
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flexible Space Remaining</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBulkCapacitySqm > 0 ? `${remainingBulkCapacitySqm} m²` : (totalCapacitySqm > 0 ? "0 m²" : "N/A")}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedCapacitySqm > 0 ? `${occupiedCapacitySqm} m² currently committed` : (totalCapacitySqm > 0 ? 'Fully available' : 'Bulk space available for allocation')}
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ceiling Height</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><line x1="12" x2="12" y1="22" y2="2"/><polyline points="19 15 12 22 5 15"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branch.ceilingHeightMeters ? `${branch.ceilingHeightMeters} m` : "N/A"}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
             <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">
              {totalCapacitySqm > 0 ? `${((occupiedCapacitySqm / totalCapacitySqm) * 100).toFixed(1)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of total capacity used
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <BranchFlexibleUnitView 
            totalCapacitySqm={totalCapacitySqm} 
            occupiedCapacitySqm={occupiedCapacitySqm}
            branchName={branch.name}
        />
      </div>

       <div className="mt-4">
        <h2 className="text-xl font-semibold mb-3">Current Allocations in {branch.name}</h2>
        <BranchAllocationsTable allocations={branchCurrentAllocations} />
      </div>
    </div>
  );
}
