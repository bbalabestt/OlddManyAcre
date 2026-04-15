
"use client";

import type { Client } from "@/types";
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
import { Eye, Edit, Trash2, MoreHorizontal, UserCircle2, Mail, KeyRound, CalendarDays, Home, Warehouse } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns'; // Added format and parseISO
import { useState } from "react";
import { ClientDetailModal } from "./client-detail-modal";
import { useToast } from "@/hooks/use-toast";


interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleEdit = (clientId: string) => {
    console.log("Edit client:", clientId);
    toast({ title: "Edit Client", description: `Functionality to edit client ${clientId} not yet implemented.`});
  };

  const handleDelete = (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to remove client "${clientName}"? This action cannot be undone.`)) {
      console.log("Delete client:", clientId);
      toast({ title: "Remove Client", description: `Client ${clientName} would be removed. (Not implemented)`});
    }
  };
  
  const handleSendResetPassword = (clientEmail: string, clientName: string) => {
    console.log("Send reset password to:", clientEmail);
    toast({ title: "Reset Password", description: `A password reset link would be sent to ${clientName} at ${clientEmail}. (Not implemented)`});
  };

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
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
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Joined Date</TableHead>
                <TableHead className="hidden lg:table-cell">Origin Type</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} onClick={() => handleRowClick(client)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8" data-ai-hint="person user">
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${client.name.charAt(0)}`} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        {client.name}
                        <div className="text-xs text-muted-foreground lg:hidden">
                          Joined: {format(parseISO(client.joinedDate), "MMM d, yyyy")}
                        </div>
                         <div className="text-xs text-muted-foreground lg:hidden">
                           Origin: {client.originLocationType}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{client.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell">{format(parseISO(client.joinedDate), "PP")}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                     <Badge variant="outline" className="capitalize">
                        {client.originLocationType === 'Home' ? <Home className="mr-1 h-3 w-3"/> : <Warehouse className="mr-1 h-3 w-3"/>}
                        {client.originLocationType}
                     </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge 
                        variant={getClientStatusVariant(client.status)}
                        className={client.status === 'Active' ? 'bg-primary text-primary-foreground' : client.status === 'Prospect' ? 'border-accent text-accent-foreground' : ''}
                    >
                        {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleRowClick(client)}>
                          <UserCircle2 className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSendResetPassword(client.email, client.name)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Send Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(client.id, client.name)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No clients found. <Link href="/clients/new" className="text-primary hover:underline">Add your first client!</Link>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
