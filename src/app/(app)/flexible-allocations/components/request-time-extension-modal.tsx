
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
import type { AllocatedBulkSpace } from "@/types";
import { Separator } from "@/components/ui/separator";

const MOCK_RATE_PER_SQM_PER_MONTH = 700; // Define rate, ideally this would come from a config or props

const requestTimeExtensionFormSchema = z.object({
  additionalMonths: z.coerce.number().int().min(1, "Must extend by at least 1 month.").max(12, "Cannot extend more than 12 months at a time."),
});

type RequestTimeExtensionFormValues = z.infer<typeof requestTimeExtensionFormSchema>;

interface RequestTimeExtensionModalProps {
  allocation: AllocatedBulkSpace;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (allocationId: string, additionalMonths: number, calculatedFee: number) => void;
}

export function RequestTimeExtensionModal({ allocation, isOpen, onOpenChange, onConfirm }: RequestTimeExtensionModalProps) {
  const form = useForm<RequestTimeExtensionFormValues>({
    resolver: zodResolver(requestTimeExtensionFormSchema),
    defaultValues: {
      additionalMonths: 1, // Default to 1 month extension
    },
  });

  const watchedAdditionalMonths = form.watch("additionalMonths");

  const calculatedAdditionalFee = React.useMemo(() => {
    if (!watchedAdditionalMonths || isNaN(watchedAdditionalMonths) || watchedAdditionalMonths <= 0) {
      return 0;
    }
    return allocation.usedSpaceSqm * MOCK_RATE_PER_SQM_PER_MONTH * watchedAdditionalMonths;
  }, [watchedAdditionalMonths, allocation.usedSpaceSqm]);

  function onSubmit(data: RequestTimeExtensionFormValues) {
    const fee = allocation.usedSpaceSqm * MOCK_RATE_PER_SQM_PER_MONTH * data.additionalMonths;
    onConfirm(allocation.id, data.additionalMonths, fee);
    onOpenChange(false);
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ additionalMonths: 1 });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Time Extension</DialogTitle>
          <DialogDescription>
            Extend the duration for allocation ID: {allocation.id.substring(0,8)}.
            The fee covers the specified number of additional months.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 text-sm">
            <p><strong>Client:</strong> {allocation.clientName}</p>
            <p><strong>Branch:</strong> {allocation.branchName}</p>
            <p><strong>Current Space:</strong> {allocation.usedSpaceSqm.toFixed(2)} SQ.M</p>
            <p><strong>Current Unit ID(s):</strong> {allocation.internalUnitIdentifier || "N/A"}</p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="additionalMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Additional Months</FormLabel>
                  <FormControl>
                    <Input
                        type="number"
                        step="1"
                        min="1"
                        max="12"
                        placeholder="e.g., 3"
                        {...field}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                        value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Extend by 1 to 12 months.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-sm font-medium">Calculated Additional Fee for Extension Period:</p>
                <p className="text-lg font-semibold text-primary">
                    ฿{calculatedAdditionalFee.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Based on {allocation.usedSpaceSqm.toFixed(2)} SQ.M at ฿{MOCK_RATE_PER_SQM_PER_MONTH}/SQ.M/month for {watchedAdditionalMonths || 0} month(s).
                </p>
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={calculatedAdditionalFee <= 0}>Confirm Time Extension</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
