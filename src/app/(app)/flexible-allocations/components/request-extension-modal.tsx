
"use client";

import * as React from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AllocatedBulkSpace } from "@/types";
import { Separator } from "@/components/ui/separator";

const MOCK_RATE_PER_SQM_PER_MONTH = 700;

const requestExtensionFormSchemaBase = z.object({
  newTotalSpaceSqm: z.coerce.number().positive({ message: "New total space must be a positive number." }),
});

type RequestExtensionFormValues = z.infer<typeof requestExtensionFormSchemaBase>;

interface RequestExtensionModalProps {
  allocation: AllocatedBulkSpace;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (allocationId: string, newTotalSpaceSqm: number, additionalFee: number) => void;
}

export function RequestExtensionModal({ allocation, isOpen, onOpenChange, onConfirm }: RequestExtensionModalProps) {
  const { toast } = useToast();

  // Dynamically create the schema based on the current allocation's used space
  const dynamicRequestExtensionFormSchema = requestExtensionFormSchemaBase.refine(
    (data) => data.newTotalSpaceSqm >= allocation.usedSpaceSqm,
    {
      message: `New space must be greater than or equal to current space of ${allocation.usedSpaceSqm.toFixed(2)} SQ.M.`,
      path: ["newTotalSpaceSqm"],
    }
  );

  const form = useForm<RequestExtensionFormValues>({
    resolver: zodResolver(dynamicRequestExtensionFormSchema),
    defaultValues: {
      newTotalSpaceSqm: allocation.usedSpaceSqm,
    },
  });

  const watchedNewTotalSpaceSqm = form.watch("newTotalSpaceSqm");
  const calculatedAdditionalFee = watchedNewTotalSpaceSqm ? watchedNewTotalSpaceSqm * MOCK_RATE_PER_SQM_PER_MONTH : (allocation.usedSpaceSqm * MOCK_RATE_PER_SQM_PER_MONTH);


  function onSubmit(data: RequestExtensionFormValues) {
    // Redundant check, but good for safety if resolver has issues or is bypassed
    if (data.newTotalSpaceSqm < allocation.usedSpaceSqm) {
        form.setError("newTotalSpaceSqm", { type: "manual", message: `New space cannot be less than current space (${allocation.usedSpaceSqm} SQ.M).`});
        return;
    }
    const fee = data.newTotalSpaceSqm * MOCK_RATE_PER_SQM_PER_MONTH;
    onConfirm(allocation.id, data.newTotalSpaceSqm, fee);
    // Toast is handled by the parent component after successful data update
    onOpenChange(false);
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ newTotalSpaceSqm: allocation.usedSpaceSqm });
    }
  }, [isOpen, allocation, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Space Extension</DialogTitle>
          <DialogDescription>
            Adjust the total space for allocation ID: {allocation.id.substring(0,8)}.
            The additional fee covers one month at the new total space.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 text-sm">
            <p><strong>Client:</strong> {allocation.clientName}</p>
            <p><strong>Branch:</strong> {allocation.branchName}</p>
            <p><strong>Current Space:</strong> {allocation.usedSpaceSqm.toFixed(2)} SQ.M</p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="newTotalSpaceSqm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Total Desired Space (SQ.M)</FormLabel>
                  <FormControl>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12.5"
                        {...field}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Must be {allocation.usedSpaceSqm.toFixed(2)} SQ.M or more.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-sm font-medium">Calculated Additional Fee for Next Month:</p>
                <p className="text-lg font-semibold text-primary">
                    ฿{calculatedAdditionalFee.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Based on {watchedNewTotalSpaceSqm?.toFixed(2) || allocation.usedSpaceSqm.toFixed(2)} SQ.M at ฿{MOCK_RATE_PER_SQM_PER_MONTH}/SQ.M/month.
                </p>
            </div>


            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm Extension Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
