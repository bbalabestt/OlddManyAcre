
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";

const vehicleTypes = ["Van", "Small Truck", "Medium Truck", "Large Truck", "Motorcycle", "Other"] as const;
const deliveryProviders = ["Makesend", "Lalamove", "Other"] as const;

const vehicleAssignmentSchema = z.object({
  id: z.string().optional(), // For useFieldArray key
  vehicleType: z.enum(vehicleTypes, { required_error: "Vehicle type is required." }),
  quantity: z.coerce.number().int().min(1, "Must be at least 1 vehicle."),
  deliveryProviderBrand: z.enum(deliveryProviders, { required_error: "Delivery provider is required." }),
  otherProviderName: z.string().optional(),
  numberOfDrivers: z.coerce.number().int().min(1, "Must be at least 1 driver."),
  numberOfAssistants: z.coerce.number().int().min(0, "Cannot be negative.").default(0),
}).refine(data => {
  if (data.deliveryProviderBrand === "Other" && (!data.otherProviderName || data.otherProviderName.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Provider name is required when 'Other' is selected.",
  path: ["otherProviderName"],
});

const assignDeliveryFormSchema = z.object({
  vehicleAssignments: z.array(vehicleAssignmentSchema).min(1, { message: "At least one vehicle assignment is required." }),
  deliveryCost: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Must be a number." })
        .positive({ message: "Delivery cost must be a positive number."})
        .optional()
  ),
});

export type AssignDeliveryFormValues = z.infer<typeof assignDeliveryFormSchema>;

interface AssignDeliveryModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssign: (bookingId: string, deliveryDetails: AssignDeliveryFormValues) => void;
}

const getDefaultVehicleAssignment = () => ({
  vehicleType: undefined as any, // To allow placeholder to show
  quantity: 1,
  deliveryProviderBrand: undefined as any, // To allow placeholder to show
  otherProviderName: "",
  numberOfDrivers: 1,
  numberOfAssistants: 0
});

export function AssignDeliveryModal({ booking, isOpen, onOpenChange, onAssign }: AssignDeliveryModalProps) {
  const { toast } = useToast();

  const form = useForm<AssignDeliveryFormValues>({
    resolver: zodResolver(assignDeliveryFormSchema),
    defaultValues: {
      vehicleAssignments: [getDefaultVehicleAssignment()],
      deliveryCost: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicleAssignments",
  });

  const watchedVehicleAssignments = form.watch("vehicleAssignments");

  if (!booking) return null;

  function onSubmit(data: AssignDeliveryFormValues) {
    onAssign(booking!.id, data);
    toast({
      title: "Delivery Details Submitted",
      description: `Delivery details for booking ${booking!.id.substring(0,8)} captured.`,
    });
    form.reset({ vehicleAssignments: [getDefaultVehicleAssignment()], deliveryCost: undefined });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset({ vehicleAssignments: [getDefaultVehicleAssignment()], deliveryCost: undefined });
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Delivery for Booking {booking.id.substring(0,8)}</DialogTitle>
          <DialogDescription>
            Add vehicle types, delivery providers, personnel, and total delivery cost.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 flex-grow overflow-auto pr-2">
            <div className="space-y-6">
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md shadow-sm relative space-y-3">
                  <h4 className="text-sm font-medium mb-2">Vehicle Assignment #{index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 h-7 w-7"
                      aria-label="Remove vehicle assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name={`vehicleAssignments.${index}.vehicleType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`vehicleAssignments.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (of this type)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name={`vehicleAssignments.${index}.deliveryProviderBrand`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Provider</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deliveryProviders.map(provider => (
                              <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchedVehicleAssignments && watchedVehicleAssignments[index]?.deliveryProviderBrand === "Other" && (
                     <FormField
                        control={form.control}
                        name={`vehicleAssignments.${index}.otherProviderName`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Other Provider Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Enter provider name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`vehicleAssignments.${index}.numberOfDrivers`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Drivers</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`vehicleAssignments.${index}.numberOfAssistants`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Assistants</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(getDefaultVehicleAssignment())}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Vehicle Type
            </Button>
             {form.formState.errors.vehicleAssignments && !Array.isArray(form.formState.errors.vehicleAssignments) && (
                 <FormMessage>{form.formState.errors.vehicleAssignments.message}</FormMessage>
             )}

            <FormField
              control={form.control}
              name="deliveryCost"
              render={({ field }) => (
                <FormItem className="mt-4 pt-4 border-t">
                  <FormLabel>Total Delivery Cost (THB) (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6 mt-auto sticky bottom-0 bg-background pb-0 z-10">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm Assignment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
