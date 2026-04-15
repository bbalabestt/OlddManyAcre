
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import type { DeliveryOption, VehicleAssignmentData } from "@/types";
import { addDeliveryOption } from "@/lib/data";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Plus, Minus } from "lucide-react";

const deliveryProviders = ["Makesend", "Lalamove", "Other"] as const;
const vehicleBaseTypes = ["Motorcycle", "Van", "Small Truck (4-wheel)", "Medium Truck (6-wheel)", "Large Truck (10-wheel)", "Other"] as const;

const vehicleAssignmentSchema = z.object({
  id: z.string().optional(), // For useFieldArray key
  vehicleType: z.enum(vehicleBaseTypes, { required_error: "Vehicle type is required." }),
  otherVehicleType: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Must be at least 1."),
  numberOfDrivers: z.coerce.number().int().min(1, "Must be at least 1."),
  numberOfAssistants: z.coerce.number().int().min(0, "Cannot be negative.").default(0),
}).refine(data => {
  if (data.vehicleType === "Other" && (!data.otherVehicleType || data.otherVehicleType.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Other Vehicle Type name is required when 'Other' is selected.",
  path: ["otherVehicleType"],
});


const addDeliveryOptionSchema = z.object({
  providerName: z.enum(deliveryProviders, { required_error: "Provider name is required."}),
  otherProviderName: z.string().optional(),
  vehicleAssignments: z.array(vehicleAssignmentSchema).min(1, "At least one vehicle assignment is required."),
  estimatedCost: z.coerce.number().positive({ message: "Estimated cost must be a positive number." }),
  picPhoneNumber: z.string().optional().refine(val => !val || /^[0-9()\-.\s+]{9,}$/.test(val), { // Min 9 digits for phone
    message: "PIC phone number must be valid and at least 9 digits.",
  }),
}).refine(data => {
  if (data.providerName === "Other" && (!data.otherProviderName || data.otherProviderName.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Other Provider Name is required when 'Other' is selected.",
  path: ["otherProviderName"],
});


type AddDeliveryOptionFormValues = z.infer<typeof addDeliveryOptionSchema>;

interface AddDeliveryOptionFormProps {
  bookingId: string;
  currentOptionsCount: number;
}

const getDefaultVehicleAssignment = (): VehicleAssignmentData => ({
  vehicleType: undefined as any,
  otherVehicleType: "",
  quantity: 1,
  numberOfDrivers: 1,
  numberOfAssistants: 0,
});


export function AddDeliveryOptionForm({ bookingId, currentOptionsCount }: AddDeliveryOptionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AddDeliveryOptionFormValues>({
    resolver: zodResolver(addDeliveryOptionSchema),
    defaultValues: {
      providerName: undefined,
      otherProviderName: "",
      vehicleAssignments: [getDefaultVehicleAssignment()],
      estimatedCost: undefined,
      picPhoneNumber: "",
    },
  });

  const watchedProviderName = form.watch("providerName");
  const watchedVehicleAssignments = form.watch("vehicleAssignments");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicleAssignments",
  });

  function onSubmit(data: AddDeliveryOptionFormValues) {
    const finalProviderName = data.providerName === "Other" ? data.otherProviderName! : data.providerName;

    const newOptionData: Omit<DeliveryOption, 'id' | 'createdAt' | 'currency'> = {
      providerName: finalProviderName, // This will be the actual string name
      otherProviderName: data.providerName === "Other" ? data.otherProviderName : undefined, // Store "Other" selection if needed
      vehicleAssignments: data.vehicleAssignments.map(va => ({
        ...va,
        // Ensure vehicleType sent to data layer is the resolved string
        vehicleType: va.vehicleType === "Other" && va.otherVehicleType ? va.otherVehicleType : va.vehicleType,
        otherVehicleType: va.vehicleType === "Other" ? va.otherVehicleType : undefined, // Store actual custom type if "Other"
      })),
      estimatedCost: data.estimatedCost,
      picPhoneNumber: data.picPhoneNumber || undefined,
    };

    try {
      addDeliveryOption({ ...newOptionData, bookingId });
      toast({
        title: "Delivery Option Added",
        description: `Option by ${finalProviderName} added.`,
      });
      form.reset({
        providerName: undefined,
        otherProviderName: "",
        vehicleAssignments: [getDefaultVehicleAssignment()],
        estimatedCost: undefined,
        picPhoneNumber: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to add delivery option:", error);
      toast({
        title: "Error Adding Option",
        description: "Could not add delivery option. Please try again.",
        variant: "destructive",
      });
    }
  }

  const adjustNumericField = (arrayName: "vehicleAssignments", index: number, fieldName: keyof VehicleAssignmentData, adjustment: number, minVal = 0) => {
    const path = `${arrayName}.${index}.${fieldName}` as const;
    const currentValue = form.getValues(path) as number || 0;
    let newValue = currentValue + adjustment;
    if (newValue < minVal) newValue = minVal;
    form.setValue(path, newValue as any, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="providerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Provider</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a provider" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deliveryProviders.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchedProviderName === "Other" && (
          <FormField control={form.control} name="otherProviderName" render={({ field }) => (
            <FormItem><FormLabel>Other Provider Name</FormLabel><FormControl><Input placeholder="Enter provider name" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
        )}

        <div className="space-y-4">
          <FormLabel>Vehicle Assignments</FormLabel>
          {fields.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-md shadow-sm space-y-3 relative">
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
                            <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {vehicleBaseTypes.map(vt => <SelectItem key={vt} value={vt}>{vt}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {watchedVehicleAssignments[index]?.vehicleType === "Other" && (
                    <FormField control={form.control} name={`vehicleAssignments.${index}.otherVehicleType`} render={({ field }) => (
                        <FormItem><FormLabel>Other Vehicle Type Name</FormLabel><FormControl><Input placeholder="Enter custom vehicle type" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
                <FormField
                    control={form.control}
                    name={`vehicleAssignments.${index}.quantity`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity (of this type)</FormLabel>
                         <div className="flex items-center space-x-2">
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "quantity", -1, 1)} disabled={(field.value || 1) <= 1}><Minus className="h-4 w-4" /></Button>
                            <FormControl><Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 1)} value={field.value ?? 1} className="text-center w-full" /></FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "quantity", 1, 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`vehicleAssignments.${index}.numberOfDrivers`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Drivers</FormLabel>
                            <div className="flex items-center space-x-2">
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "numberOfDrivers", -1, 1)} disabled={(field.value || 1) <= 1}><Minus className="h-4 w-4" /></Button>
                                <FormControl><Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 1)} value={field.value ?? 1} className="text-center w-full" /></FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "numberOfDrivers", 1, 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`vehicleAssignments.${index}.numberOfAssistants`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assistants</FormLabel>
                             <div className="flex items-center space-x-2">
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "numberOfAssistants", -1, 0)} disabled={(field.value || 0) <= 0}><Minus className="h-4 w-4" /></Button>
                                <FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} value={field.value ?? 0} className="text-center w-full" /></FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={() => adjustNumericField("vehicleAssignments", index, "numberOfAssistants", 1, 0)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>
          ))}
           <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(getDefaultVehicleAssignment())}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Vehicle Type to this Option
            </Button>
             {form.formState.errors.vehicleAssignments && !Array.isArray(form.formState.errors.vehicleAssignments) && (
                 <FormMessage>{form.formState.errors.vehicleAssignments.message}</FormMessage>
             )}
        </div>

        <FormField
          control={form.control}
          name="picPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIC Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="e.g., 080-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Estimated Cost for this Option (THB)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {currentOptionsCount === 0 ? "Add First Option & Update Status" : "Add Another Option"}
        </Button>
      </form>
    </Form>
  );
}
