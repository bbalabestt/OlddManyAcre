
"use client";

import type { Transaction, TransactionType } from "@/types";
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
import { Edit, MoreHorizontal, FileText, Trash2, FileCheck2, FileClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";

interface TransactionTableProps {
  transactions: Transaction[];
}

const formatTransactionTypeDisplay = (type: TransactionType): string => {
  switch (type) {
    case "FullAmount": return "Full Amount";
    case "DeliveryOnly": return "Delivery Only";
    default: return type.replace(/([A-Z])/g, ' $1').trim();
  }
};

const getStatusBadge = (status?: 'NotYet' | 'Created' | 'Sent') => {
  if (!status) return <Badge variant="outline" className="text-xs">N/A</Badge>;
  switch (status) {
    case 'NotYet': return <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">{status}</Badge>;
    case 'Created': return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">{status}</Badge>;
    case 'Sent': return <Badge variant="default" className="text-xs bg-green-100 text-green-700">{status}</Badge>;
    default: return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();
  
  const handleEdit = (transactionId: string) => {
    console.log("Edit transaction:", transactionId);
    alert(`Edit transaction: ${transactionId} (Not implemented)`);
  };

  const handleDelete = (transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      alert(`Transaction ${transactionId} deleted (Not implemented)`);
    }
  };
  
  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Completed': return 'default';
      case 'Failed': return 'destructive';
      case 'Cancelled': return 'secondary'; 
      default: return 'secondary';
    }
  };

  const handleRowClick = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount (THB)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Method</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Invoice</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow 
                key={transaction.id} 
                onClick={() => handleRowClick(transaction.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                    <Link href={`/transactions/${transaction.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline text-primary">
                        {transaction.id.substring(0, 8)}...
                    </Link>
                </TableCell>
                <TableCell>{format(parseISO(transaction.date), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {transaction.clientId ? (
                    <Link href={`/clients/${transaction.clientId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                      {transaction.clientName || 'View Client'}
                    </Link>
                  ) : (
                    transaction.clientName || 'N/A'
                  )}
                </TableCell>
                <TableCell>
                    <Badge variant="secondary" className="capitalize">{formatTransactionTypeDisplay(transaction.type)}</Badge>
                </TableCell>
                <TableCell className="text-right">฿{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(transaction.status)}
                    className={`capitalize ${transaction.status === 'Completed' ? 'bg-primary text-primary-foreground' : transaction.status === 'Pending' ? 'border-accent text-accent-foreground' : '' }`}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{transaction.method || 'N/A'}</TableCell>
                <TableCell className="hidden lg:table-cell text-center">{getStatusBadge(transaction.invoiceStatus)}</TableCell>
                <TableCell className="hidden lg:table-cell text-center">{getStatusBadge(transaction.receiptStatus)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowClick(transaction.id)}>
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(transaction.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction.id)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No transactions found.</p>
            <Button asChild>
              <Link href="/transactions/new">
                Create a New Transaction
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

