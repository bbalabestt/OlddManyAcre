
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AllSpacesTable } from "./components/all-space-table"; // Renamed for clarity
import { getAllocatedBulkSpaces, mockBranches, mockClients } from "@/lib/data"; // Fetch flexible allocations
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'All Allocated Spaces', // Updated title
};

export default async function AllSpacesPage() {
  // Fetch flexible allocations instead of fixed spaces
  const allocations = getAllocatedBulkSpaces(); 
  // The AllSpacesTable will be adapted to show these allocations.
  // Client and Branch info is already part of AllocatedBulkSpace type.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">All Allocated Spaces</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          {/* Link to the flexible allocation form */}
          <Link href="/flexible-allocations/new"> 
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Allocation
          </Link>
        </Button>
      </div>
      <AllSpacesTable allocations={allocations} />
    </div>
  );
}
