
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/types";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, type ChangeEvent } from "react";
import { AlertTriangle, UploadCloud, Trash2 } from "lucide-react";
import { addAllocatedBulkSpace } from "@/lib/data";

const confirmSpaceUsageFormSchema = z.object({
  actualUsedSpaceSqm: z.coerce.number().positive({ message: "Actual used space must be a positive number." }),
  internalUnitIdentifier: z.string().optional(),
});

export type ConfirmSpaceUsageFormValues = z.infer<typeof confirmSpaceUsageFormSchema>;

interface ConfirmSpaceUsageModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (bookingId: string, actualSpace: number) => void;
}

export function ConfirmSpaceUsageModal({ booking, isOpen, onOpenChange, onConfirm }: ConfirmSpaceUsageModalProps) {
  const { toast } = useToast();
  const [showInvoiceButton, setShowInvoiceButton] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ConfirmSpaceUsageFormValues>({
    resolver: zodResolver(confirmSpaceUsageFormSchema),
    defaultValues: {
      actualUsedSpaceSqm: undefined,
      internalUnitIdentifier: "",
    },
  });

  const actualUsedSpaceSqm = form.watch("actualUsedSpaceSqm");

  useEffect(() => {
    if (booking && actualUsedSpaceSqm !== undefined) {
      const requestedArea = (booking.desiredWidthSqm && booking.desiredLengthSqm)
        ? booking.desiredWidthSqm * booking.desiredLengthSqm
        : 0;
      if (requestedArea > 0 && actualUsedSpaceSqm > requestedArea) {
        setShowInvoiceButton(true);
      } else {
        setShowInvoiceButton(false);
      }
    } else {
      setShowInvoiceButton(false);
    }
  }, [actualUsedSpaceSqm, booking]);


  useEffect(() => {
    if (isOpen) {
      form.reset({
        actualUsedSpaceSqm: undefined,
        internalUnitIdentifier: booking?.suggestedInternalUnitIdentifier || ""
      });
      setShowInvoiceButton(false);
      setSelectedImageFiles([]);
      setImagePreviews([]);
    }
  }, [isOpen, form, booking]);

  if (!booking) return null;

  const requestedAreaDisplay = (booking.desiredWidthSqm && booking.desiredLengthSqm)
    ? `${booking.desiredWidthSqm}m x ${booking.desiredLengthSqm}m = ${(booking.desiredWidthSqm * booking.desiredLengthSqm).toFixed(2)} SQ.M`
    : "Not specified by client";

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedImageFiles(prevFiles => [...prevFiles, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevPreviews[index]); // Clean up object URL
      return newPreviews;
    });
  };


  function onSubmit(data: ConfirmSpaceUsageFormValues) {
    if (!booking || !booking.clientId || !booking.branchId) {
        toast({
            title: "Error",
            description: "Booking client or branch ID is missing. Cannot create allocation.",
            variant: "destructive"
        });
        return;
    }
    try {
      const imageNames = selectedImageFiles.map(file => file.name);
      addAllocatedBulkSpace({
        clientId: booking.clientId,
        branchId: booking.branchId,
        usedSpaceSqm: data.actualUsedSpaceSqm,
        notes: `Allocation created from booking ${booking.id.substring(0,8)}. Requested: ${requestedAreaDisplay}. Client Notes: ${booking.customerNotes || 'N/A'}. Staff Notes: ${booking.staffNotes || 'N/A'}`,
        relatedBookingId: booking.id,
        allocatedSpaceImageNames: imageNames,
        internalUnitIdentifier: data.internalUnitIdentifier || undefined,
      });

      toast({
        title: "Flexible Allocation Created",
        description: `Space of ${data.actualUsedSpaceSqm} SQ.M (Unit: ${data.internalUnitIdentifier || 'N/A'}) allocated for booking ${booking.id.substring(0,8)}. ${imageNames.length > 0 ? `${imageNames.length} image(s) noted.` : '' }`,
      });

      onConfirm(booking.id, data.actualUsedSpaceSqm);

    } catch (error) {
        console.error("Failed to create allocation or update booking:", error);
        toast({
            title: "Allocation/Booking Update Error",
            description: "Could not complete the process. Check console for details.",
            variant: "destructive"
        });
    } finally {
        onOpenChange(false);
    }
  }

  const handleSendInvoice = () => {
    toast({
        title: "Invoice Action Triggered",
        description: `(Placeholder) Invoice for overage for booking ${booking!.id.substring(0,8)} would be sent.`,
        variant: "default",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Space Usage & Complete Booking</DialogTitle>
          <DialogDescription>
            Enter actual space used for booking ID: {booking.id.substring(0,8)}. This creates an allocation and completes the booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
            <p><strong>Client:</strong> {booking.clientName || 'N/A'}</p>
            <p><strong>Branch:</strong> {booking.branchName || 'N/A'}</p>
            <p><strong>Requested Space:</strong> {requestedAreaDisplay}</p>
            {booking.suggestedInternalUnitIdentifier && <p><strong>Suggested Unit ID(s):</strong> {booking.suggestedInternalUnitIdentifier}</p>}
            {booking.customerNotes && <p><strong>Customer Item Notes:</strong> {booking.customerNotes}</p>}
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="actualUsedSpaceSqm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Used Space (SQ.M)</FormLabel>
                  <FormControl>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 4.5"
                        {...field}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internalUnitIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Unit ID(s) (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., U01, U01-U05" {...field} />
                  </FormControl>
                  <FormDescription>Enter/confirm the unit ID(s) for this allocation. Suggested ID (if any) is pre-filled.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Upload Images of Allocated Space (Optional)</FormLabel>
              <FormControl>
                <label htmlFor="allocatedSpaceImages" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <span className="relative rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                        Click to upload files
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                  <Input id="allocatedSpaceImages" name="allocatedSpaceImages" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                </label>
              </FormControl>
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
               {selectedImageFiles.length > 0 && <FormDescription className="text-xs mt-1">{selectedImageFiles.length} image(s) selected.</FormDescription>}
            </FormItem>


            {showInvoiceButton && (
                 <div className="p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                        Actual space used is greater than requested. An additional invoice may be required.
                    </p>
                </div>
            )}

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              {showInvoiceButton && (
                <Button type="button" variant="outline" onClick={handleSendInvoice}>
                  Send Invoice for Overage
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm & Complete Booking</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
