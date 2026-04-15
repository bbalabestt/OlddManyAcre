
import { AddAllocationForm } from "../components/add-allocation-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { mockClients, mockBranches } from "@/lib/data";


export const metadata: Metadata = {
  title: 'Add New Flexible Allocation',
};

export default function AddNewAllocationPage() {
  // In a real app, these would be fetched or passed appropriately
  const clients = mockClients; 
  const branches = mockBranches;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/flexible-allocations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Allocations
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Flexible Space Allocation</CardTitle>
          <CardDescription>Assign bulk storage space to a customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddAllocationForm clients={clients} branches={branches} />
        </CardContent>
      </Card>
    </div>
  );
}
