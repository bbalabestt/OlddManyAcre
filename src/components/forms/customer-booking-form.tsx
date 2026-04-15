
"use client";

import React, { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, intervalToDuration, addMonths, isAfter, isEqual, isBefore } from "date-fns";
import { CalendarIcon, AlertTriangle, Plus, Minus, PlusCircle, Trash2, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockBranches } from "@/lib/data"; 

const positiveNumberSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val), 
  z.coerce.number({ invalid_type_error: "Must be a number." })
    .positive({ message: "Must be a positive number." })
    .optional()
);

const itemSchema = z.object({
  type: z.string().min(1, "Item type is required."),
  quantity: z.coerce.number({invalid_type_error: "Quantity must be a number."}).int().positive({ message: "Quantity must be at least 1." }).min(1, "Quantity must be at least 1."),
});

const bookingFormSchema = z.object({
  // Step 1: Space & Dates
  desiredWidth: positiveNumberSchema,
  desiredLength: positiveNumberSchema,
  branchId: z.string().optional(), 
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  // Step 2: Item Details
  items: z.array(itemSchema).optional().default([]),
  // Step 3: Delivery Services
  needsManpower: z.boolean().default(false).optional(),
  pickupElevator: z.enum(["yes", "no", "stairs_only", "na"]).default("na").optional(),
  needsReassembly: z.boolean().default(false).optional(),
  needsWrapping: z.boolean().default(false).optional(),
  // Step 4: Payment
  paymentPreference: z.enum(["full", "monthly"]).default("full"),
}).refine(data => { // First refinement: basic date order
  if (!data.startDate || !data.endDate) return true; 
  return data.endDate > data.startDate;
}, {
  message: "End date must be after start date.",
  path: ["endDate"],
}).refine(data => { // Second refinement: 1-month minimum
  if (!data.startDate || !data.endDate || data.endDate <= data.startDate) {
    return true; 
  }
  const oneMonthAfterStartDate = addMonths(data.startDate, 1);
  return isEqual(data.endDate, oneMonthAfterStartDate) || isAfter(data.endDate, oneMonthAfterStartDate);
}, {
  message: "Minimum booking duration is 1 month. End date must be at least one month after the start date.",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const ITEM_TYPES = [
  { value: "box_small", label: "Box (Small)" },
  { value: "box_medium", label: "Box (Medium)" },
  { value: "box_large", label: "Box (Large)" },
  { value: "suitcase", label: "Suitcase" },
  { value: "chair", label: "Chair" },
  { value: "table", label: "Table" },
  { value: "sofa", label: "Sofa" },
  { value: "bed_single", label: "Bed (Single)" },
  { value: "bed_double_queen", label: "Bed (Double/Queen)" },
  { value: "bed_king", label: "Bed (King)" },
  { value: "mattress", label: "Mattress" },
  { value: "appliance_small", label: "Appliance (Small)" },
  { value: "appliance_large", label: "Appliance (Large)" },
  { value: "bike", label: "Bike" },
  { value: "sports_equipment", label: "Sports Equipment" },
  { value: "other", label: "Other (Specify in notes if needed)" },
];

const totalSteps = 4;

export function CustomerBookingForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const currentYear = new Date().getFullYear();
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [tempSelectedBranchInModal, setTempSelectedBranchInModal] = useState<string | undefined>(undefined);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      desiredWidth: undefined,
      desiredLength: undefined,
      branchId: undefined, 
      items: [],
      needsManpower: false,
      pickupElevator: "na",
      needsReassembly: false,
      needsWrapping: false,
      paymentPreference: "full",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedBranchId = form.watch("branchId");
  const currentSelectedBranchDetails = useMemo(() => {
    return mockBranches.find(branch => branch.id === watchedBranchId);
  }, [watchedBranchId]);
  

  async function processStep(data: BookingFormValues) {
    console.log(`Step ${currentStep} data:`, data);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Final Booking Submission (Placeholder):", data);
      toast({
        title: "Booking Request Submitted (Placeholder)",
        description: "We will review your request and get back to you soon.",
      });
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                currentStep === step
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step
                  ? "bg-primary/50 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step ? "✓" : step}
            </div>
            {step < totalSteps && <div className={cn("h-0.5 w-8", currentStep > step ? "bg-primary" : "bg-muted")} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const adjustNumberValue = (
    fieldName: "desiredWidth" | "desiredLength",
    adjustment: number
  ) => {
    const currentValue = form.getValues(fieldName) || 0;
    let newValue = parseFloat((currentValue + adjustment).toFixed(1));
    if (newValue < 0.1 && adjustment < 0) newValue = 0.1; 
    if (newValue < 0 && adjustment > 0) newValue = 0.1; 
    form.setValue(fieldName, newValue > 0 ? newValue : undefined, { shouldValidate: true });
  };

  const getItemLabel = (value: string) => {
    return ITEM_TYPES.find(item => item.value === value)?.label || value;
  };

  const getSelectedBranchNameForSummary = () => {
    if (!watchedBranchId) return "Widing will suggest";
    const selectedBranch = mockBranches.find(branch => branch.id === watchedBranchId);
    return selectedBranch ? selectedBranch.name : "Invalid Branch";
  };
  
  const openBranchModal = () => {
    setTempSelectedBranchInModal(form.getValues("branchId")); 
    setIsBranchModalOpen(true);
  };

  const confirmBranchFromModal = () => {
    form.setValue("branchId", tempSelectedBranchInModal, { shouldValidate: true });
    setIsBranchModalOpen(false);
  };
  
  const handleBranchSelect = (branchId?: string) => {
    form.setValue("branchId", branchId, { shouldValidate: true });
    setTempSelectedBranchInModal(branchId); 
    if (isBranchModalOpen) { 
        setIsBranchModalOpen(false);
    }
  };


  const calculateBillingMonths = () => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");

    if (!startDate || !endDate || endDate <= startDate) {
      return 0;
    }

    const duration = intervalToDuration({ start: startDate, end: endDate });
    let billingMonths = (duration.years || 0) * 12 + (duration.months || 0);
    
    if (duration.days && duration.days > 0) {
      billingMonths += 1;
    } else if (billingMonths === 0 && (startDate.getTime() !== endDate.getTime())) {
      billingMonths = 1;
    }
    
    return billingMonths;
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processStep)} className="space-y-8">
        {renderStepIndicator()}

        {currentStep === 1 && (
          <section id="step-1-space-dates" className="space-y-6">
            <CardTitle className="text-lg font-medium">Space, Branch & Dates</CardTitle>
            <FormDescription>
              Enter the desired dimensions for your storage space in meters.
              If you're unsure, you can leave these blank and describe your needs in the 'Item Details' step.
              You can also select a preferred branch, or let us suggest one.
              Minimum booking duration is 1 month.
            </FormDescription>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="desiredWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Width (m)</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustNumberValue("desiredWidth", -0.5)}
                        disabled={field.value !== undefined && field.value <= 0.1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          className="text-center w-full"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustNumberValue("desiredWidth", 0.5)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>Approx. width in meters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desiredLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Length (m)</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustNumberValue("desiredLength", -0.5)}
                         disabled={field.value !== undefined && field.value <= 0.1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 3.0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          className="text-center w-full"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustNumberValue("desiredLength", 0.5)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>Approx. length in meters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Preferred Branch</FormLabel>
              <FormDescription className="mb-2">Select a branch or let us choose the best fit for you.</FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Card
                  className={cn(
                    "cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center justify-center p-4 text-center h-full",
                    watchedBranchId === undefined && "ring-2 ring-primary shadow-lg border-primary"
                  )}
                  onClick={() => handleBranchSelect(undefined)}
                >
                  <CardHeader className="pb-2">
                     <CardTitle className="text-base flex items-center justify-center gap-2">
                        Let Widing Decide
                        {watchedBranchId === undefined && <CheckCircle className="h-5 w-5 text-primary" />}
                    </CardTitle>
                  </CardHeader>
                   <CardContent className="text-xs text-muted-foreground flex-grow flex items-center">
                    We'll find the most suitable branch based on your needs and availability.
                  </CardContent>
                </Card>

                {currentSelectedBranchDetails ? (
                  <Card
                    className={cn(
                      "cursor-pointer hover:shadow-lg transition-shadow h-full",
                      "ring-2 ring-primary shadow-lg border-primary" 
                    )}
                    onClick={openBranchModal} 
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {currentSelectedBranchDetails.name}
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription className="text-xs">{currentSelectedBranchDetails.addressDetail}, {currentSelectedBranchDetails.province}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      <p>Capacity: {currentSelectedBranchDetails.totalCapacity}</p>
                      <span className="block mt-1 text-primary/80 text-[10px]">(Click to change)</span>
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    onClick={openBranchModal}
                    className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center justify-center p-4 text-center border-dashed h-full"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Search className="h-5 w-5"/>
                        View & Select Branch
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground flex-grow flex items-center">
                       {mockBranches.length > 0 ? `${mockBranches.length} locations available. Click to see all.` : "No branches available."}
                    </CardContent>
                  </Card>
                )}
              </div>
               {form.formState.errors.branchId && (
                  <FormMessage className="mt-2">{form.formState.errors.branchId.message}</FormMessage>
                )}
            </div>


            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Storage Start Date</FormLabel>
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
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                          initialFocus
                          fromYear={currentYear}
                          toYear={currentYear + 5}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Storage End Date</FormLabel>
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
                          disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setHours(0,0,0,0)))}
                          initialFocus
                          fromYear={form.getValues("startDate")?.getFullYear() ?? currentYear}
                          toYear={(form.getValues("startDate")?.getFullYear() ?? currentYear) + 10}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section id="step-2-item-details" className="space-y-6">
            <CardTitle className="text-lg font-medium">Item Details (Optional)</CardTitle>
            <FormDescription>
              List the items you plan to store. This helps us estimate space if you haven't specified dimensions.
            </FormDescription>
            
            <div className="space-y-4">
              {fields.map((itemField, index) => (
                <div key={itemField.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border rounded-md shadow-sm">
                  <FormField
                    control={form.control}
                    name={`items.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-grow w-full sm:w-auto">
                        <FormLabel>Item Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ITEM_TYPES.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-28">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="1"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => remove(index)}
                    className="w-full mt-2 sm:w-auto sm:mt-0 flex-shrink-0"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ type: "", quantity: 1 })}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
             {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
              <FormMessage>{form.formState.errors.items.message}</FormMessage>
            )}
          </section>
        )}

        {currentStep === 3 && (
          <section id="step-3-delivery-services" className="space-y-6">
            <CardTitle className="text-lg font-medium">Delivery & Moving Services (Optional)</CardTitle>
             <FormDescription>Let us know if you need assistance with moving your items.</FormDescription>
            <FormField
              control={form.control}
              name="needsManpower"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Manpower Assistance Needed</FormLabel>
                    <FormDescription>Do you need our team to help load/unload your items?</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="pickupElevator"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Elevator at Pickup Location?</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="na">Not Applicable / Self-Move</SelectItem>
                            <SelectItem value="yes">Yes, elevator is available</SelectItem>
                            <SelectItem value="no">No elevator, ground floor access</SelectItem>
                            <SelectItem value="stairs_only">No elevator, stairs involved</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormControl>
                    <FormDescription>This helps us estimate effort if manpower is requested.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="needsReassembly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Furniture Disassembly/Re-assembly</FormLabel>
                    <FormDescription>Do you have items that need to be disassembled for transport and re-assembled?</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needsWrapping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Special Wrapping / Protection</FormLabel>
                    <FormDescription>Do your items require special wrapping materials (e.g., bubble wrap, furniture blankets)?</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </section>
        )}

        {currentStep === 4 && (
          <section id="step-4-review-payment" className="space-y-6">
            <CardTitle className="text-lg font-medium">Review & Payment Options</CardTitle>
            
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-base">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>
                      <strong>Desired Dimensions:</strong> 
                      {form.getValues("desiredWidth") ? `${form.getValues("desiredWidth")}m (W)` : "N/A"}
                      {form.getValues("desiredWidth") && form.getValues("desiredLength") ? " x " : ""}
                      {form.getValues("desiredLength") ? `${form.getValues("desiredLength")}m (L)` : (form.getValues("desiredWidth") ? "" : "N/A")}
                    </p>
                    <p><strong>Preferred Branch:</strong> {getSelectedBranchNameForSummary()}</p>
                    <p><strong>Start Date:</strong> {form.getValues("startDate") ? format(form.getValues("startDate"), "PPP") : "N/A"}</p>
                    <p><strong>End Date:</strong> {form.getValues("endDate") ? format(form.getValues("endDate"), "PPP") : "N/A"}</p>
                    
                    <Separator className="my-2"/>
                    <p>
                      <strong>Total Storage Duration:</strong> {calculateBillingMonths()} billing month(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Note: You will be charged on a monthly basis. A deposit may be required based on the total duration. Minimum 1 month booking.
                    </p>
                    
                    {form.getValues("items") && form.getValues("items").length > 0 && (
                      <>
                        <Separator className="my-2"/>
                        <p className="font-medium">Items to Store:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                          {form.getValues("items").map((item, index) => (
                            <li key={index}>
                              {getItemLabel(item.type)}: {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <Separator className="my-2"/>
                    <p className="font-medium">Delivery Services:</p>
                    <ul className="list-disc list-inside pl-4">
                        <li>Manpower: {form.getValues("needsManpower") ? "Yes" : "No"}</li>
                        <li>Elevator at Pickup: {form.getValues("pickupElevator")}</li>
                        <li>Re-assembly: {form.getValues("needsReassembly") ? "Yes" : "No"}</li>
                        <li>Wrapping: {form.getValues("needsWrapping") ? "Yes" : "No"}</li>
                    </ul>
                </CardContent>
            </Card>

            <div className="p-4 border border-dashed border-accent rounded-md bg-accent/10 text-accent-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-semibold">Next Steps:</h4>
              </div>
              <p className="text-sm mt-1">
                Based on your requirements, we will find suitable branches and provide you with a quote. 
                Storage costs and any applicable delivery fees will be calculated and presented to you for confirmation.
              </p>
              <p className="text-sm mt-2"><strong>Storage Cost:</strong> To Be Determined (TBD)</p>
              <p className="text-sm"><strong>Delivery Fee:</strong> TBD (if applicable)</p>
            </div>
            
            <FormField
              control={form.control}
              name="paymentPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Preference</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="full" />
                        </FormControl>
                        <FormLabel className="font-normal">Pay in Full (for the entire duration)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="monthly" />
                        </FormControl>
                        <FormLabel className="font-normal">Pay Monthly</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>Actual payment will be processed after cost confirmation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        )}

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button type="submit" className={cn(currentStep === 1 && "ml-auto")}>
            {currentStep < totalSteps ? "Next Step" : "Submit Booking Request"}
          </Button>
        </div>
      </form>

      <Dialog open={isBranchModalOpen} onOpenChange={setIsBranchModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select a Branch</DialogTitle>
            <DialogDescription>Choose your preferred branch location from the list below.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3 -mr-3">
              <div className="space-y-3 py-1">
                  {mockBranches.map((branch) => (
                  <Card
                      key={branch.id}
                      className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow",
                      tempSelectedBranchInModal === branch.id && "ring-2 ring-primary shadow-md border-primary"
                      )}
                      onClick={() => setTempSelectedBranchInModal(branch.id)}
                  >
                      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                        <CardTitle className="text-sm font-medium">{branch.name}</CardTitle>
                        {tempSelectedBranchInModal === branch.id && <CheckCircle className="h-5 w-5 text-primary" />}
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                        <p>{branch.addressDetail}, {branch.province}</p>
                        <p className="mt-1">Total Capacity: {branch.totalCapacity}</p>
                      </CardContent>
                  </Card>
                  ))}
              </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBranchModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmBranchFromModal}>Confirm Selection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Form>
  );
}

