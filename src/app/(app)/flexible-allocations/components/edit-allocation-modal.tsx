
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
import { Textarea } from "@/components/ui/textarea";
import type { AllocatedBulkSpace } from "@/types";
import { Separator } from "@/components/ui/separator";

const editAllocationFormSchema = z.object({
  unitIdString: z.string().optional(), // Allow empty for 0 units
  notes: z.string().optional(),
});

type EditAllocationFormValues = z.infer<typeof editAllocationFormSchema>;

interface EditAllocationModalProps {
  allocation: AllocatedBulkSpace;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (allocationId: string, newUnitIdString: string, newUsedSpaceSqm: number, newNotes: string | undefined) => void;
}

export function EditAllocationModal({ allocation, isOpen, onOpenChange, onConfirm }: EditAllocationModalProps) {
  const form = useForm<EditAllocationFormValues>({
    resolver: zodResolver(editAllocationFormSchema),
    defaultValues: {
      unitIdString: allocation.internalUnitIdentifier || "",
      notes: allocation.notes || "",
    },
  });

  const watchedUnitIdString = form.watch("unitIdString");

  const calculatedNewUsedSpaceSqm = React.useMemo(() => {
    if (!watchedUnitIdString || watchedUnitIdString.trim() === "") {
      return 0;
    }
    const units = watchedUnitIdString
      .split(',')
      .map(unit => unit.trim())
      .filter(unit => unit !== "");
    return units.length * 1; // Each unit is 1 SQ.M
  }, [watchedUnitIdString]);

  function onSubmit(data: EditAllocationFormValues) {
    const finalUnitIdString = data.unitIdString || "";
    onConfirm(allocation.id, finalUnitIdString, calculatedNewUsedSpaceSqm, data.notes);
    onOpenChange(false);
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ 
        unitIdString: allocation.internalUnitIdentifier || "",
        notes: allocation.notes || "",
      });
    }
  }, [isOpen, allocation, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Allocation Details</DialogTitle>
          <DialogDescription>
            Modify Unit ID(s), Notes, and recalculate Used Space for allocation ID: {allocation.id.substring(0,8)}.
            Total used space is automatically calculated (1 SQ.M per unique unit ID).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 text-sm">
            <p><strong>Client:</strong> {allocation.clientName}</p>
            <p><strong>Branch:</strong> {allocation.branchName}</p>
            <p><strong>Current Unit ID(s):</strong> {allocation.internalUnitIdentifier || "N/A"}</p>
            <p><strong>Current Space:</strong> {allocation.usedSpaceSqm.toFixed(2)} SQ.M</p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="unitIdString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit ID(s) (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                        placeholder="e.g., U01,U02,AB-103"
                        {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter one or more unit identifiers. Each valid unit counts as 1 SQ.M.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-sm font-medium">Calculated New Total Used Space:</p>
                <p className="text-lg font-semibold text-primary">
                    {calculatedNewUsedSpaceSqm.toFixed(2)} SQ.M
                </p>
                <p className="text-xs text-muted-foreground">
                    Based on {calculatedNewUsedSpaceSqm} unit(s) entered.
                </p>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific details about this allocation..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm & Update Details</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
