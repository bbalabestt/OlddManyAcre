
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
import { addAllocatedBulkSpace, addClient as globalAddClient } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronsUpDown, CheckCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddClientForm } from "./add-client-form";


const addAllocationFormSchema = z.object({
  clientId: z.string().optional(),
  branchId: z.string().min(1, { message: "Branch location is required." }),
  usedSpaceSqm: z.coerce.number().positive({ message: "Used space must be a positive number." }),
  initialPaymentAmount: z.coerce.number().positive({ message: "Initial payment must be a positive number." }).optional(),
  notes: z.string().optional(),
  internalUnitIdentifier: z.string().optional(),
}).refine(data => {
  if (data.clientId && data.clientId !== "" && (data.initialPaymentAmount === undefined || data.initialPaymentAmount <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Initial Payment Amount is required and must be positive if a client is selected.",
  path: ["initialPaymentAmount"],
});


type AddAllocationFormValues = z.infer<typeof addAllocationFormSchema>;

interface AddAllocationFormProps {
  clients: Client[];
  branches: Branch[];
}

export function AddAllocationForm({ clients: initialClients, branches }: AddAllocationFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [internalClients, setInternalClients] = useState<Client[]>(initialClients.sort((a, b) => a.name.localeCompare(b.name)));
  const [isClientComboboxOpen, setIsClientComboboxOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const form = useForm<AddAllocationFormValues>({
    resolver: zodResolver(addAllocationFormSchema),
    defaultValues: {
      clientId: "",
      branchId: "",
      usedSpaceSqm: undefined,
      initialPaymentAmount: undefined,
      notes: "",
      internalUnitIdentifier: "",
    },
  });

  const watchedClientId = form.watch("clientId");

  const handleClientCreated = (newClient: Client) => {
    setInternalClients(prev => [...prev, newClient].sort((a,b) => a.name.localeCompare(b.name)));
    form.setValue("clientId", newClient.id, { shouldValidate: true });
    setIsAddClientModalOpen(false);
  };

  function onSubmit(data: AddAllocationFormValues) {
    console.log("New Allocation Data:", data);

    const newAllocationData: Omit<AllocatedBulkSpace, 'id' | 'allocationDate' | 'clientName' | 'branchName' | 'status'> & { status?: AllocatedBulkSpace['status'], clientId?: string, additionalFeeForExtension?: number, internalUnitIdentifier?: string } = {
      clientId: data.clientId || undefined,
      branchId: data.branchId,
      usedSpaceSqm: data.usedSpaceSqm,
      notes: data.notes,
      internalUnitIdentifier: data.internalUnitIdentifier,
    };

    if (data.clientId && data.clientId !== "") {
      newAllocationData.additionalFeeForExtension = data.initialPaymentAmount;
    }

    try {
      const createdAllocation = addAllocatedBulkSpace(newAllocationData as any);

      toast({
        title: "Allocation Created",
        description: `Space for ${createdAllocation.clientName} at ${createdAllocation.branchName}. Status: ${createdAllocation.status}. ${createdAllocation.additionalFeeForExtension ? `Initial Fee: ฿${createdAllocation.additionalFeeForExtension.toFixed(2)}.` : ''}`,
      });
      form.reset();
      router.push("/flexible-allocations");
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Customer (Optional)</FormLabel>
                <Popover open={isClientComboboxOpen} onOpenChange={setIsClientComboboxOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isClientComboboxOpen}
                        className={cn(
                          "w-full justify-between",
                          !field.value && field.value !== "" && "text-muted-foreground"
                        )}
                      >
                        {field.value && field.value !== ""
                          ? internalClients.find(client => client.id === field.value)?.name
                          : field.value === ""
                            ? "-- No Specific Client (System Reserved) --"
                            : "Select a customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search client..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              key="no-client"
                              value=""
                              onSelect={() => {
                                form.setValue("clientId", "", { shouldValidate: true });
                                setIsClientComboboxOpen(false);
                              }}
                            >
                              <CheckCircle
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === "" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              -- No Specific Client (System Reserved) --
                          </CommandItem>
                          {internalClients.map((client) => (
                            <CommandItem
                              value={client.name}
                              key={client.id}
                              onSelect={() => {
                                form.setValue("clientId", client.id, { shouldValidate: true });
                                setIsClientComboboxOpen(false);
                              }}
                            >
                              <CheckCircle
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  client.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {client.name} ({client.email})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setIsAddClientModalOpen(true);
                              setIsClientComboboxOpen(false);
                            }}
                            className="cursor-pointer text-primary hover:bg-accent"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create New Client Profile
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>If no client is selected, the space will be marked as "System Reserved". If a client is selected, it will require an initial payment and go to "Awaiting Payment".</FormDescription>
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.addressDetail}, {branch.province}
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
                    step="0.01"
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Enter the total square meters to be allocated.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedClientId && watchedClientId !== "" && (
            <FormField
              control={form.control}
              name="initialPaymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Payment Amount (THB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2500.00"
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Enter the amount for the first payment (e.g., first month's rent).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="internalUnitIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Unit ID(s) (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., U01, AB-101" {...field} />
                </FormControl>
                <FormDescription>Assign an internal identifier or unit number(s) for this allocation.</FormDescription>
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

      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Client Profile</DialogTitle>
            <DialogDescription>
              Fill in the details for the new client. They will be automatically selected after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AddClientForm
                onClientCreated={handleClientCreated}
                isInModal={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
