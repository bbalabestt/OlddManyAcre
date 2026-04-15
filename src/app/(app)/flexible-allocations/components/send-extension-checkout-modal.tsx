
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { AllocatedBulkSpace } from "@/types";
// import { markExtensionCheckoutSent } from "@/lib/data"; // Parent will call this now
import { Separator } from "@/components/ui/separator";
// import { useRouter } from "next/navigation"; // Not strictly needed if parent handles refresh

const sendExtensionCheckoutFormSchema = z.object({
  checkoutType: z.enum(["gateway", "manual"], {
    required_error: "You need to select a checkout page type.",
  }),
});

type SendExtensionCheckoutFormValues = z.infer<typeof sendExtensionCheckoutFormSchema>;

interface SendExtensionCheckoutModalProps {
  allocation: AllocatedBulkSpace | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCheckoutSent: (checkoutType: 'gateway' | 'manual') => void; // Modified to pass type
}

export function SendExtensionCheckoutModal({ allocation, isOpen, onOpenChange, onCheckoutSent }: SendExtensionCheckoutModalProps) {
  // const { toast } = useToast(); // Toast handled by parent
  // const router = useRouter();
  
  const form = useForm<SendExtensionCheckoutFormValues>({
    resolver: zodResolver(sendExtensionCheckoutFormSchema),
    defaultValues: {
      checkoutType: "gateway",
    },
  });

  if (!allocation) return null;

  const additionalFee = allocation.additionalFeeForExtension || 0;

  function onSubmit(data: SendExtensionCheckoutFormValues) {
    // Parent (e.g., ExtendAllocationsTable or FlexibleAllocationDetailSidePanel)
    // will call markExtensionCheckoutSent from lib/data.ts
    onCheckoutSent(data.checkoutType as 'gateway' | 'manual');
    onOpenChange(false); // Close the modal
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Extension Checkout Page</DialogTitle>
          <DialogDescription>
            Review the additional fee and select the checkout page type for allocation {allocation.id.substring(0,8)}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2 text-sm">
            <p><strong>Client:</strong> {allocation.clientName}</p>
            <p><strong>Branch:</strong> {allocation.branchName}</p>
            <p><strong>Current Space:</strong> {allocation.usedSpaceSqm.toFixed(2)} SQ.M</p>
            {allocation.requestedExtendedSpaceSqm && (
              <p><strong>New Total Requested Space:</strong> {allocation.requestedExtendedSpaceSqm.toFixed(2)} SQ.M</p>
            )}
            <Separator />
            <p className="font-semibold text-lg flex justify-between">
                <span>Additional Fee Due:</span>
                <span>THB {additionalFee.toFixed(2)}</span>
            </p>
        </div>
        
        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="checkoutType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select Checkout Page Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="gateway" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Gateway Payment (Online QR, Credit/Debit)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="manual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Manual Payment (Bank Transfer instructions)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Send Checkout Page</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
