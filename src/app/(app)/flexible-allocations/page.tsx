
import { Button } from "@/components/ui/button";
import { PlusCircle, History, Clock } from "lucide-react"; 
import { AllocationsTable } from "./components/allocations-table";
import { ExtendAllocationsTable } from "./components/extend-allocations-table"; 
import { AwaitingRenewalAllocationsTable } from "./components/awaiting-renewal-allocations-table"; // New Import
import { ReleasedAllocationsTable } from "./components/released-allocations-table"; // Re-import if needed
import { getAllocations } from "@/lib/db";
import type { Metadata } from 'next';
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 

export const metadata: Metadata = {
  title: 'Flexible Space Allocations & Storage Management',
};

export default async function FlexibleAllocationsPage() {
  const allAllocations = await getAllocations();
  
  const currentAllocations = allAllocations.filter(
    a => a.status === 'Occupied' || a.status === 'Reserved'
  );
  const awaitingExtensionPaymentAllocations = allAllocations.filter(
    a => a.status === 'AwaitingExtensionPayment'
  );
  const awaitingRenewalAllocations = allAllocations.filter( // New filter
    a => a.status === 'AwaitingRenewal'
  );
  const releasedAllocations = allAllocations.filter( // Filter for released history
    a => a.status === 'Released' 
  );


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Active Storage Management</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/flexible-allocations/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Allocation
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="current" className="flex-grow flex flex-col">
        <TabsList className="mb-4 self-start grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 w-full sm:w-auto"> 
          <TabsTrigger value="current">Current Allocations ({currentAllocations.length})</TabsTrigger>
          <TabsTrigger value="awaiting-renewal">
            <Clock className="mr-2 h-4 w-4"/> Awaiting Renewal ({awaitingRenewalAllocations.length})
          </TabsTrigger>
          <TabsTrigger value="extend">Awaiting Ext. Payment ({awaitingExtensionPaymentAllocations.length})</TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />Released History ({releasedAllocations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="flex-grow overflow-hidden">
          <AllocationsTable allocations={currentAllocations} />
        </TabsContent>
        <TabsContent value="awaiting-renewal" className="flex-grow overflow-hidden">
          <AwaitingRenewalAllocationsTable allocations={awaitingRenewalAllocations} />
        </TabsContent>
        <TabsContent value="extend" className="flex-grow overflow-hidden">
          <ExtendAllocationsTable allocations={awaitingExtensionPaymentAllocations} />
        </TabsContent>
        <TabsContent value="history" className="flex-grow overflow-hidden">
          <ReleasedAllocationsTable allocations={releasedAllocations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
