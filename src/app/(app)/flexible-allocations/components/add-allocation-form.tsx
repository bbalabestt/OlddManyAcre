
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Client, Branch, AllocatedBulkSpace } from "@/types";
import { addAllocatedBulkSpace } from "@/lib/data"; // Assuming a function to add to mock data
import { useRouter } from "next/navigation";


const addAllocationFormSchema = z.object({
  clientId: z.string().min(1, { message: "Customer is required." }),
  branchId: z.string().min(1, { message: "Branch location is required." }),
  usedSpaceSqm: z.coerce.number().positive({ message: "Used space must be a positive number." }),
  notes: z.string().optional(),
});

type AddAllocationFormValues = z.infer<typeof addAllocationFormSchema>;

interface AddAllocationFormProps {
  clients: Client[];
  branches: Branch[];
}

export function AddAllocationForm({ clients, branches }: AddAllocationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<AddAllocationFormValues>({
    resolver: zodResolver(addAllocationFormSchema),
    defaultValues: {
      clientId: "",
      branchId: "",
      usedSpaceSqm: undefined,
      notes: "",
    },
  });

  function onSubmit(data: AddAllocationFormValues) {
    // Placeholder for actual submission logic
    console.log("New Allocation Data:", data);
    
    // Add to mock data (or call API in real app)
    // The addAllocatedBulkSpace function in data.ts will handle setting clientName, branchName, id, allocationDate, and default status.
    const newAllocationData: Omit<AllocatedBulkSpace, 'id' | 'allocationDate' | 'clientName' | 'branchName' | 'status'> & { status?: 'Occupied' | 'Reserved' } = {
      clientId: data.clientId,
      branchId: data.branchId,
      usedSpaceSqm: data.usedSpaceSqm,
      notes: data.notes,
    };

    try {
      // In a real app, this would be an async call to your backend
      const createdAllocation = addAllocatedBulkSpace(newAllocationData as any); // Casting as 'any' for mock simplicity
      
      toast({
        title: "Allocation Added",
        description: `Space allocated to ${createdAllocation.clientName} at ${createdAllocation.branchName}.`,
      });
      form.reset();
      router.push("/flexible-allocations"); // Redirect to the allocations list
    } catch (error) {
      console.error("Failed to add allocation:", error);
      toast({
        title: "Error",
        description: "Could not add allocation. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="usedSpaceSqm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual Used Space (SQ.M)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 15.5" 
                  {...field} 
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                 />
              </FormControl>
              <FormDescription>Enter the total square meters used by the customer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any specific details about this allocation..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto">Add Allocation</Button>
      </form>
    </Form>
  );
}
