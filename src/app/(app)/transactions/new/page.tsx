
import { AddTransactionForm } from "@/components/forms/add-transaction-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { mockClients, mockBranches } from "@/lib/data";

export const metadata: Metadata = {
  title: 'Add New Transaction',
};

export default function AddNewTransactionPage() {
  // In a real app, these would be fetched or passed appropriately
  const clients = mockClients; 
  const branches = mockBranches;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
          <CardDescription>Manually record a financial transaction.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddTransactionForm clients={clients} branches={branches} />
        </CardContent>
      </Card>
    </div>
  );
}
