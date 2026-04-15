
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Client, Branch, Transaction, TransactionType } from "@/types";
import { addTransaction } from "@/lib/data";
import { useRouter } from "next/navigation";

const transactionTypes: TransactionType[] = ["FullAmount", "Subscription", "Refund", "DeliveryOnly", "ExtensionFee", "Other"];
const paymentMethods = ["Cash", "CreditCard", "BankTransfer", "Online", "Other"] as const;
const transactionStatuses = ["Pending", "Completed", "Failed", "Cancelled"] as const;

const addTransactionFormSchema = z.object({
  clientId: z.string().min(1, { message: "Client is required." }),
  date: z.date({ required_error: "Transaction date is required." }),
  type: z.enum(transactionTypes, { required_error: "Transaction type is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  method: z.enum(paymentMethods, { required_error: "Payment method is required." }),
  status: z.enum(transactionStatuses, { required_error: "Transaction status is required." }),
  description: z.string().optional(),
  relatedBranchId: z.string().optional(),
  bookingId: z.string().optional(),
  relatedSpaceId: z.string().optional(), // Could be allocation ID or old space ID
});

type AddTransactionFormValues = z.infer<typeof addTransactionFormSchema>;

interface AddTransactionFormProps {
  clients: Client[];
  branches: Branch[];
}

export function AddTransactionForm({ clients, branches }: AddTransactionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(addTransactionFormSchema),
    defaultValues: {
      clientId: "",
      date: new Date(),
      type: undefined,
      amount: undefined,
      method: undefined,
      status: "Pending",
      description: "",
      relatedBranchId: "",
      bookingId: "",
      relatedSpaceId: "",
    },
  });

  function onSubmit(data: AddTransactionFormValues) {
    const newTransactionData: Omit<Transaction, 'id' | 'clientName' | 'currency' | 'invoiceStatus' | 'receiptStatus'> = {
      ...data,
      date: data.date.toISOString(),
      relatedBranchId: data.relatedBranchId === "none" || data.relatedBranchId === "" ? undefined : data.relatedBranchId,
      bookingId: data.bookingId === "" ? undefined : data.bookingId,
      relatedSpaceId: data.relatedSpaceId === "" ? undefined : data.relatedSpaceId,
    };

    try {
      const createdTransaction = addTransaction(newTransactionData);

      toast({
        title: "Transaction Added",
        description: `Transaction for ${createdTransaction.clientName} recorded.`,
      });
      form.reset();
      router.push("/transactions");
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast({
        title: "Error",
        description: "Could not add transaction. Please try again.",
        variant: "destructive",
      });
    }
  }

  const formatTransactionTypeLabel = (type: TransactionType): string => {
    switch (type) {
      case "FullAmount": return "Full Amount";
      case "DeliveryOnly": return "Delivery Only";
      case "ExtensionFee": return "Extension Fee";
      default: return type.replace(/([A-Z])/g, ' $1').trim();
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (THB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1500.00"
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {transactionTypes.map(type => (
                        <SelectItem key={type} value={type}>{formatTransactionTypeLabel(type)}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>{method.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {transactionStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Payment for monthly storage, Delivery fee for booking XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-md font-semibold pt-4 border-t">Optional Linked Information</h3>

        <FormField
          control={form.control}
          name="relatedBranchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Branch (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch if applicable" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="bookingId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Related Booking ID (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Enter Booking ID" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="relatedSpaceId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Related Space/Allocation ID (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Enter Space or Allocation ID" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" className="w-full sm:w-auto">Add Transaction</Button>
      </form>
    </Form>
  );
}
