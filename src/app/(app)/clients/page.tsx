
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, UserPlus, UserMinus, UserCheck, UserX } from "lucide-react";
import { ClientTable } from "./components/client-table";
import { getClients, countClientsByStatus } from "@/lib/db";
import type { Metadata } from 'next';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Clients',
};

export default async function ClientsPage() {
  const [clients, prospectCount, activeClientCount, churnedClientCount, completedReturnCount] = await Promise.all([
    getClients(),
    countClientsByStatus('Prospect'),
    countClientsByStatus('Active'),
    countClientsByStatus('Churned'),
    countClientsByStatus('ReturnCompleted'),
  ]);

  const stats = [
    { title: "Prospects", value: prospectCount, icon: UserPlus, description: "Registered, no active storage" },
    { title: "Active Clients", value: activeClientCount, icon: Users, description: "Currently using storage" },
    { title: "Churned Clients", value: churnedClientCount, icon: UserMinus, description: "Previously stored, now inactive" },
    { title: "Completed Returns", value: completedReturnCount, icon: UserCheck, description: "Storage cycle completed" },
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Client Management</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
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

      <ClientTable clients={clients} />
    </div>
  );
}
