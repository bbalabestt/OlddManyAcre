
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
import type { Booking, DeliveryOption } from "@/types";
import { updateBookingCheckoutSent } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { parseISO, intervalToDuration, isValid, isAfter } from "date-fns";

const sendCheckoutPageFormSchema = z.object({
  checkoutType: z.enum(["gateway", "manual"], {
    required_error: "You need to select a checkout page type.",
  }),
});

type SendCheckoutPageFormValues = z.infer<typeof sendCheckoutPageFormSchema>;

interface SendCheckoutPageModalProps {
  booking: Booking | null;
  chosenDeliveryOption: DeliveryOption | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function calculateBillingMonths(startTimeISO?: string, endTimeISO?: string): number {
  if (!startTimeISO || !endTimeISO) return 0;

  const startDate = parseISO(startTimeISO);
  const endDate = parseISO(endTimeISO);

  if (!isValid(startDate) || !isValid(endDate) || !isAfter(endDate, startDate)) {
    return 1; 
  }

  const duration = intervalToDuration({ start: startDate, end: endDate });
  
  let billingMonths = (duration.years || 0) * 12 + (duration.months || 0);
  
  if (duration.days && duration.days > 0) {
    billingMonths += 1;
  } else if (billingMonths === 0 && startDate.getTime() !== endDate.getTime()) {
    billingMonths = 1;
  } else if (billingMonths === 0 && startDate.getTime() === endDate.getTime()) {
    billingMonths = 1;
  }
  
  return Math.max(billingMonths, 1); 
}


export function SendCheckoutPageModal({ booking, chosenDeliveryOption, isOpen, onOpenChange }: SendCheckoutPageModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<SendCheckoutPageFormValues>({
    resolver: zodResolver(sendCheckoutPageFormSchema),
    defaultValues: {
      checkoutType: "gateway",
    },
  });

  if (!booking || !chosenDeliveryOption) return null;

  let storageFee = 0;
  if (booking.bookingType === 'Pick-up' && booking.desiredWidthSqm && booking.desiredLengthSqm && booking.startTime && booking.endTime) {
    const billingMonths = calculateBillingMonths(booking.startTime, booking.endTime);
    storageFee = booking.desiredWidthSqm * booking.desiredLengthSqm * 700 * billingMonths;
  }

  const deliveryFee = chosenDeliveryOption.estimatedCost;
  const deliverySurcharge = deliveryFee * 0.10; // 10% surcharge on delivery fee only
  const totalAmount = storageFee + deliveryFee + deliverySurcharge;

  function onSubmit(data: SendCheckoutPageFormValues) {
    updateBookingCheckoutSent(booking!.id, data.checkoutType as 'gateway' | 'manual');
    toast({
      title: "Checkout Page Link Simulated",
      description: `A link to the ${data.checkoutType} checkout page for booking ${booking!.id.substring(0,8)} would be sent to the client. Total: THB ${totalAmount.toFixed(2)}.`,
    });
    onOpenChange(false);
    router.refresh(); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Checkout Page</DialogTitle>
          <DialogDescription>
            Review the amount and select the type of checkout page to send for booking {booking.id.substring(0,8)}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2 text-sm">
            <p><strong>Client:</strong> {booking.clientName || 'N/A'}</p>
            <p><strong>Delivery Provider:</strong> {chosenDeliveryOption.providerName === "Other" && chosenDeliveryOption.otherProviderName ? chosenDeliveryOption.otherProviderName : chosenDeliveryOption.providerName}</p>
            <Separator />
            <h4 className="font-semibold text-md">Payment Summary:</h4>
            {booking.bookingType === 'Pick-up' && storageFee > 0 && (
                 <div className="flex justify-between">
                    <span>Storage Service Fee:</span>
                    <span>THB {storageFee.toFixed(2)}</span>
                 </div>
            )}
            <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>THB {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Delivery Surcharge (10%):</span>
                <span>THB {deliverySurcharge.toFixed(2)}</span>
            </div>
            <Separator className="my-1"/>
            <p className="font-semibold text-lg flex justify-between">
                <span>Total Amount to Collect:</span>
                <span>THB {totalAmount.toFixed(2)}</span>
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
