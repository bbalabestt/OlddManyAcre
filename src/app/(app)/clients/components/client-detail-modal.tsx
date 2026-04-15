
"use client";

import type { Client, Transaction, AllocatedBulkSpace, TransactionType } from "@/types"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User, Mail, Phone, CalendarDays, 
  Package, Briefcase, Building, Tag, CheckCircle, AlertCircle, Clock, Archive, MapPin, Home, Warehouse, Send, ExternalLink,
  FileText, FileCheck2, FileClock // Icons for invoice/receipt status
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  getTransactionsForClient,
  getAllocatedBulkSpacesForClient, 
} from "@/lib/data"; 

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatTransactionTypeDisplayModal = (type: TransactionType): string => {
  switch (type) {
    case "FullAmount": return "Full Amount";
    case "DeliveryOnly": return "Delivery Only";
    default: return type;
  }
};

const getDocumentStatusBadge = (status?: 'NotYet' | 'Created' | 'Sent') => {
  if (!status) return <Badge variant="outline" className="text-xs">N/A</Badge>;
  switch (status) {
    case 'NotYet': return <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">{status}</Badge>;
    case 'Created': return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">{status}</Badge>;
    case 'Sent': return <Badge variant="default" className="text-xs bg-green-100 text-green-700">{status}</Badge>;
    default: return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
};


export function ClientDetailModal({ client, isOpen, onOpenChange }: ClientDetailModalProps) {
  if (!client) return null;

  const transactions = getTransactionsForClient(client.id);
  const flexibleAllocations = getAllocatedBulkSpacesForClient(client.id);

  const getTxStatusIcon = (status: Transaction['status']) => {
    if (status === 'Completed') return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (status === 'Pending') return <Clock className="h-3 w-3 text-yellow-500" />;
    if (status === 'Failed' || status === 'Cancelled') return <AlertCircle className="h-3 w-3 text-red-500" />;
    return null;
  };
  
  const getClientStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Prospect': return 'outline';
      case 'Churned': return 'secondary';
      case 'ReturnCompleted': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl flex items-center justify-between">
            Client Profile: {client.name}
             <Badge 
                variant={getClientStatusVariant(client.status)}
                className={`capitalize text-sm ml-2 ${client.status === 'Active' ? 'bg-primary text-primary-foreground' : client.status === 'Prospect' ? 'border-accent text-accent-foreground' : '' }`}
            >
                {client.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Joined: {format(parseISO(client.joinedDate), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6">
          <div className="space-y-6">
            {/* Client Information Section */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Name: {client.name}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email: {client.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Phone: {client.phone}</div>
                 <div className="flex items-center gap-2">
                  {client.originLocationType === 'Home' ? <Home className="h-4 w-4 text-muted-foreground" /> : <Warehouse className="h-4 w-4 text-muted-foreground" />}
                   Origin Location Type: {client.originLocationType || 'N/A'}
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> 
                  <div>
                    Origin Address: 
                    <p className="font-medium">{client.originStreetAddress || 'N/A'}</p>
                    {(client.originSubDistrict || client.originDistrict || client.originProvince || client.originPostcode) &&
                      <p className="text-xs text-muted-foreground">
                        {client.originSubDistrict}{client.originSubDistrict && client.originDistrict ? ', ' : ''}{client.originDistrict}
                        {(client.originSubDistrict || client.originDistrict) && client.originProvince ? ', ' : ''}{client.originProvince}
                        {client.originPostcode ? ` ${client.originPostcode}` : ''}
                      </p>
                    }
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Flexible Storage Allocations Section */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Flexible Storage Allocations</h3>
              {flexibleAllocations.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead><Building className="inline h-4 w-4 mr-1"/>Branch</TableHead>
                            <TableHead className="text-right"><Archive className="inline h-4 w-4 mr-1"/>Used Space (SQ.M)</TableHead>
                            <TableHead><Tag className="inline h-4 w-4 mr-1"/>Status</TableHead>
                            <TableHead><CalendarDays className="inline h-4 w-4 mr-1"/>Since</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flexibleAllocations.map(alloc => (
                            <TableRow key={alloc.id}>
                              <TableCell>{alloc.branchName}</TableCell>
                              <TableCell className="text-right">{alloc.usedSpaceSqm.toFixed(2)}</TableCell>
                              <TableCell><Badge variant={alloc.status === 'Occupied' ? 'default' : 'outline'}>{alloc.status}</Badge></TableCell>
                              <TableCell>{format(parseISO(alloc.allocationDate), "PP")}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/bookings/new?clientId=${client.id}&bookingType=Return&selectedAllocationId=${alloc.id}&branchId=${alloc.branchId}`}>
                                    <Send className="mr-1 h-3 w-3" /> Request Return
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Detailed billing for each allocation (e.g., monthly charges, payment status) would be shown in a dedicated billing section or linked from here.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active flexible storage allocations for this client.</p>
              )}
            </section>
            
            <Separator />

            {/* Transaction History Section */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Financial Transaction History</h3>
              {transactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Invoice</TableHead>
                        <TableHead className="text-center">Receipt</TableHead>
                        <TableHead className="text-center">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map(tx => ( 
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs">{format(parseISO(tx.date), "PP")}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize text-xs">{formatTransactionTypeDisplayModal(tx.type)}</Badge></TableCell>
                          <TableCell className="text-right text-xs">฿{tx.amount.toFixed(2)}</TableCell>
                          <TableCell className="flex items-center gap-1 text-xs">
                            {getTxStatusIcon(tx.status)}
                            <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'outline' : 'destructive'} className="capitalize text-xs">
                                {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{getDocumentStatusBadge(tx.invoiceStatus)}</TableCell>
                          <TableCell className="text-center">{getDocumentStatusBadge(tx.receiptStatus)}</TableCell>
                          <TableCell className="text-center">
                             <Button variant="link" size="sm" asChild className="text-xs h-auto py-0 px-1">
                                <Link href={`/transactions/${tx.id}`}>View <ExternalLink className="ml-1 h-3 w-3"/></Link>
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {transactions.length > 5 && (
                     <div className="p-2 text-center">
                        <Button variant="link" asChild>
                            <Link href={`/transactions?clientId=${client.id}`}>View All Transactions ({transactions.length})</Link> 
                        </Button>
                     </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions found for this client.</p>
              )}
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 mt-auto border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
