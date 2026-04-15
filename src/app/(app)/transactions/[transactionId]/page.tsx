
"use client"; 

// Import useParams
import { useParams } from "next/navigation";
import { getTransactionById, getClientById, getBranchById, updateTransactionDocumentStatus } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Edit, Printer, User, CalendarDays, Tag, Landmark, Package, FileText, BadgeDollarSign, Building, CheckCircle, FileClock, FileWarning, FileX, Send, FileSignature, Mail, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { Badge as UiBadge } from "@/components/ui/badge"; 
import { format, parseISO } from 'date-fns';
import type { Transaction, TransactionType } from "@/types";
import { useEffect, useState } from "react"; // React.use is not needed here
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Keep this for router.refresh()
import { Separator } from "@/components/ui/separator";


const formatTransactionTypeDisplay = (type: TransactionType): string => {
  switch (type) {
    case "FullAmount": return "Full Amount";
    case "DeliveryOnly": return "Delivery Only";
    default: return type;
  }
};

const DocumentStatusIndicator = ({ status, type }: { status?: 'NotYet' | 'Created' | 'Sent', type: 'Invoice' | 'Receipt' }) => {
  if (!status) return <p className="font-semibold">N/A</p>;
  
  let Icon = FileClock;
  let color = "text-yellow-600";
  if (status === 'Created') { Icon = FileCheck2; color = "text-blue-600"; }
  if (status === 'Sent') { Icon = Send; color = "text-green-600"; }

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className={`font-semibold ${color}`}>{status}</p>
    </div>
  );
};

// Modify component signature to not accept params prop
export default function TransactionDetailPage() {
  const paramsFromHook = useParams(); // Use the hook
  // Ensure transactionId is a string. useParams can return string | string[] or be null initially.
  // For a route like /[transactionId], it should be a string once available.
  const transactionId = typeof paramsFromHook.transactionId === 'string' ? paramsFromHook.transactionId : undefined;

  const router = useRouter();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null | undefined>(undefined);
  const [clientName, setClientName] = useState<string | undefined>(undefined);
  const [branchName, setBranchName] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Check if transactionId is available before fetching
    if (transactionId) {
      const fetchedTransaction = getTransactionById(transactionId);
      setTransaction(fetchedTransaction);
      if (fetchedTransaction) {
        const fetchedClient = getClientById(fetchedTransaction.clientId);
        setClientName(fetchedClient?.name);
        const fetchedBranch = getBranchById(fetchedTransaction.relatedBranchId || "");
        setBranchName(fetchedBranch?.name);
      } else {
        // Handle case where transactionId is valid but no transaction found
        setTransaction(null); 
      }
    }
  }, [transactionId]); // Dependency on transactionId from useParams

  const handleDocumentStatusUpdate = async (documentType: 'invoice' | 'receipt', newStatus: 'Created' | 'Sent') => {
    if (!transaction) return;
    const updatedTx = updateTransactionDocumentStatus(transaction.id, documentType, newStatus);
    if (updatedTx) {
      setTransaction(updatedTx); // Update local state for immediate UI feedback
      toast({
        title: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Status Updated`,
        description: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} for transaction ${transaction.id.substring(0,8)} is now ${newStatus}.`,
      });
      // router.refresh(); // Optionally keep if there are other derived states on server that need refreshing
    } else {
      toast({
        title: "Error",
        description: `Failed to update ${documentType} status.`,
        variant: "destructive",
      });
    }
  };
  
  if (transaction === undefined) {
    // Still loading or transactionId not yet available from params hook
    return <div className="flex justify-center items-center h-full"><FileText className="h-8 w-8 animate-pulse" /></div>;
  }
  
  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-semibold">Transaction Not Found</h1>
        <p className="text-muted-foreground">The transaction you are looking for (ID: {transactionId || 'N/A'}) does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Transactions
          </Link>
        </Button>
      </div>
    );
  }
  
  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Completed': return 'default';
      case 'Failed': return 'destructive';
      case 'Cancelled': return 'secondary';
      default: return 'secondary';
    }
  };
  
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'Pending': return <FileClock className="h-5 w-5 text-yellow-500" />;
      case 'Completed': return <FileCheck2 className="h-5 w-5 text-green-500" />;
      case 'Failed': return <FileWarning className="h-5 w-5 text-red-500" />;
      case 'Cancelled': return <FileX className="h-5 w-5 text-gray-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Transactions
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Transaction Details</h1>
            <CardDescription>ID: {transaction.id}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
              <Printer className="mr-2 h-5 w-5" /> Print (Placeholder)
            </Button>
            <Button asChild className="shadow-md hover:shadow-lg transition-shadow" disabled>
              <Link href={`/transactions/${transaction.id}/edit`}> 
                <Edit className="mr-2 h-5 w-5" /> Edit Transaction
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              Transaction: {transaction.id.substring(0,8)}...
            </span>
            <UiBadge 
              variant={getStatusBadgeVariant(transaction.status)}
              className={`capitalize ${transaction.status === 'Completed' ? 'bg-primary text-primary-foreground' : transaction.status === 'Pending' ? 'border-accent text-accent-foreground' : '' }`}
            >
              {transaction.status}
            </UiBadge>
          </CardTitle>
          <CardDescription>
            Recorded on {format(parseISO(transaction.date), "PPpp")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <BadgeDollarSign className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold text-lg">฿{transaction.amount.toFixed(2)} {transaction.currency}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold capitalize">{formatTransactionTypeDisplay(transaction.type)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Landmark className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
               <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">{transaction.method || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                {transaction.clientId ? (
                  <Link href={`/clients/${transaction.clientId}`} className="font-semibold hover:underline text-primary">
                    {clientName || transaction.clientName || 'View Client'}
                  </Link>
                ) : (
                  <p className="font-semibold">{transaction.clientName || 'N/A'}</p>
                )}
              </div>
            </div>
            {transaction.bookingId && (
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Related Booking</p>
                  <Link href={`/bookings`} className="font-semibold hover:underline text-primary">
                    Booking ID: {transaction.bookingId.substring(0,8)}...
                  </Link>
                </div>
              </div>
            )}
            {transaction.relatedSpaceId && (
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Related Space/Allocation</p>
                  <p className="font-semibold">ID: {transaction.relatedSpaceId}</p> 
                </div>
              </div>
            )}
             {transaction.relatedBranchId && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <Link href={`/branches/${transaction.relatedBranchId}`} className="font-semibold hover:underline text-primary">
                    {branchName || 'View Branch'}
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 pt-4 border-t mt-2 space-y-3">
            <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Invoice Status</p>
                    <DocumentStatusIndicator status={transaction.invoiceStatus} type="Invoice" />
                </div>
            </div>
            <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Receipt Status</p>
                     <DocumentStatusIndicator status={transaction.receiptStatus} type="Receipt" />
                </div>
            </div>
          </div>

          {transaction.description && (
            <div className="md:col-span-2 flex items-start gap-3 pt-4 border-t mt-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Description / Notes</p>
                    <p className="font-semibold whitespace-pre-wrap">{transaction.description}</p>
                </div>
            </div>
          )}
        </CardContent>
        <Separator className="my-4"/>
        <CardFooter className="flex flex-col sm:flex-row gap-2 items-start">
            <div className="space-y-2">
                <h4 className="text-sm font-medium">Invoice Actions</h4>
                {transaction.invoiceStatus === 'NotYet' && (
                    <Button onClick={() => handleDocumentStatusUpdate('invoice', 'Created')} size="sm">
                        <FileSignature className="mr-2 h-4 w-4" /> Create Invoice
                    </Button>
                )}
                {transaction.invoiceStatus === 'Created' && (
                     <Button onClick={() => handleDocumentStatusUpdate('invoice', 'Sent')} size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Send Invoice
                    </Button>
                )}
                {transaction.invoiceStatus === 'Sent' && (
                    <p className="text-sm text-muted-foreground flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Invoice Sent</p>
                )}
            </div>
             <div className="space-y-2 sm:ml-4">
                <h4 className="text-sm font-medium">Receipt Actions</h4>
                {transaction.receiptStatus === 'NotYet' && (
                    <Button onClick={() => handleDocumentStatusUpdate('receipt', 'Created')} size="sm">
                         <FileSignature className="mr-2 h-4 w-4" /> Create Receipt
                    </Button>
                )}
                {transaction.receiptStatus === 'Created' && (
                     <Button onClick={() => handleDocumentStatusUpdate('receipt', 'Sent')} size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Send Receipt
                    </Button>
                )}
                {transaction.receiptStatus === 'Sent' && (
                    <p className="text-sm text-muted-foreground flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Receipt Sent</p>
                )}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

    
