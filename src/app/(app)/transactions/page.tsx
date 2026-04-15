
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, FileClock, FileCheck2, FileX } from "lucide-react";
import { TransactionTable } from "./components/transaction-table";
import { mockTransactions } from "@/lib/data";
import type { Metadata } from 'next';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/types";

export const metadata: Metadata = {
  title: 'Financial Transactions',
};

export default async function TransactionsPage() {
  const transactions = mockTransactions; 

  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(t => t.status === 'Pending').length;
  const completedTransactions = transactions.filter(t => t.status === 'Completed').length;
  const failedOrCancelledTransactions = transactions.filter(t => t.status === 'Failed' || t.status === 'Cancelled').length;

  const stats = [
    { title: "Total Transactions", value: totalTransactions, icon: Receipt, description: "All recorded transactions" },
    { title: "Pending", value: pendingTransactions, icon: FileClock, description: "Transactions awaiting completion" },
    { title: "Completed", value: completedTransactions, icon: FileCheck2, description: "Successfully completed transactions" },
    { title: "Failed/Cancelled", value: failedOrCancelledTransactions, icon: FileX, description: "Problematic transactions" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Financial Transactions</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/transactions/new"> 
            <PlusCircle className="mr-2 h-5 w-5" /> New Transaction
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TransactionTable transactions={transactions} />
    </div>
  );
}
