
import { AddClientForm } from "@/components/forms/add-client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Client',
};

export default function AddNewClientPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
          <CardDescription>Enter the details for the new client.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
