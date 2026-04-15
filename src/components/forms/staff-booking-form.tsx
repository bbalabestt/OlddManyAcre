
"use client";

import React, { useState, useMemo, ChangeEvent, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFieldArray, type FieldPath } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format, intervalToDuration, addMonths as dateFnsAddMonths, isAfter, isEqual, isBefore, addDays, parseISO, addHours as dateAddHours } from "date-fns";
import { CalendarIcon, Plus, Minus, PlusCircle, Trash2, CheckCircle, ChevronsUpDown, UserPlus, MapPin, Archive, Package, AlertTriangle, Phone, Clock, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Client, Branch, Booking, BookingType, AllocatedBulkSpace } from "@/types";
import { addBooking, getClientById, mockClients as initialMockClients, addClient as globalAddClient, getAllocatedBulkSpacesForClient, getBranchById as fetchBranchById } from "@/lib/data";
import { useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddClientForm } from "./add-client-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const positiveNumberSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number({ invalid_type_error: "Must be a number." })
    .positive({ message: "Must be a positive number." })
    .optional()
);

const itemSchema = z.object({
  type: z.string().min(1, "Item type is required."),
  quantity: z.coerce.number({invalid_type_error: "Quantity must be a number."}).int().min(1, "Quantity must be at least 1."),
});

const staffBookingFormSchema = z.object({
  // Step 1
  clientId: z.string().min(1, "Client selection is required."),
  bookingType: z.enum(["Pick-up", "Return"], { required_error: "Booking type is required."}),
  branchId: z.string().min(1, "Branch selection is required."),
  isAddingToExistingStorage: z.boolean().optional().default(false),
  linkedAllocationId: z.string().optional(),
  selectedAllocationId: z.string().optional(), 

  // Step 2
  startDate: z.date({ required_error: "Service start date or Requested Return Date is required." }),
  endDate: z.date().optional(),
  desiredWidthSqm: positiveNumberSchema,
  desiredLengthSqm: positiveNumberSchema,

  // Step 3
  items: z.array(itemSchema).optional().default([]),
  itemImageNames: z.array(z.string()).optional().default([]),

  // Step 4
  hasDockingArea: z.boolean().optional(),
  hasCarParkingFee: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  hasBigFurniture: z.boolean().optional(),
  bigFurnitureMaxWidthCm: positiveNumberSchema,
  bigFurnitureMaxHeightCm: positiveNumberSchema,
  needsWrapping: z.boolean().optional().default(false),
  needsDisassemblyReassembly: z.boolean().optional().default(false),
  needsExtraManpower: z.boolean().optional().default(false),
  customerNotes: z.string().optional(),
  staffNotes: z.string().optional(),

  originPhoneNumber: z.string().optional().refine(val => !val || /^[0-9+-]{9,}$/.test(val), { message: "Valid phone number (min 9 digits) required."}),
  originAvailableTimeSlots: z.string().optional(),
  originGoogleMapsLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),


  destinationSameAsOrigin: z.boolean().optional().default(false),
  destinationStreetAddress: z.string().optional(),
  destinationProvince: z.string().optional(),
  destinationDistrict: z.string().optional(),
  destinationSubDistrict: z.string().optional(),
  destinationPostcode: z.string().optional().refine(val => val === undefined || val === "" || /^\d{5}$/.test(val), {
    message: "Postcode must be 5 digits if provided.",
  }),
  destinationPhoneNumber: z.string().optional().refine(val => !val || /^[0-9+-]{9,}$/.test(val), { message: "Valid phone number (min 9 digits) required."}),
  destinationAvailableTimeSlots: z.string().optional(),
  destinationGoogleMapsLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
})
.superRefine((data, ctx) => {
  // Date order for Pick-up (New Storage)
  if (data.bookingType === 'Pick-up' && !data.isAddingToExistingStorage && data.endDate && data.startDate) {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date.", path: ["endDate"] });
    }
    const oneMonthAfterStartDate = dateFnsAddMonths(data.startDate, 1);
    if (!(isEqual(data.endDate, oneMonthAfterStartDate) || isAfter(data.endDate, oneMonthAfterStartDate))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimum storage duration for Pick-up is 1 month.", path: ["endDate"] });
    }
  }

  // Start date validation (at least 2 days from today)
  if (data.startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = addDays(today, 2);
    if (isBefore(data.startDate, dayAfterTomorrow)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Service start date (or Requested Return Date) must be at least two days from today.", path: ["startDate"] });
    }
  }

  // Big furniture dimensions
  if (data.hasBigFurniture === true) {
    if (data.bigFurnitureMaxWidthCm === undefined || data.bigFurnitureMaxWidthCm <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Max width is required and must be positive.", path: ["bigFurnitureMaxWidthCm"] });
    }
    if (data.bigFurnitureMaxHeightCm === undefined || data.bigFurnitureMaxHeightCm <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Max height is required and must be positive.", path: ["bigFurnitureMaxHeightCm"] });
    }
  }

  // Selected allocation for Returns
  if (data.bookingType === 'Return' && !data.selectedAllocationId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An active allocation must be selected for a 'Return' booking.", path: ["selectedAllocationId"] });
  }

  // End date for new Pick-ups
  if (data.bookingType === 'Pick-up' && !data.isAddingToExistingStorage && !data.endDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Service end date is required for new Pick-up bookings.", path: ["endDate"] });
  }

  // Linked allocation for adding to existing Pick-ups
  if (data.bookingType === 'Pick-up' && data.isAddingToExistingStorage === true && !data.linkedAllocationId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An existing allocation must be selected to add items to.", path: ["linkedAllocationId"] });
  }

  // Custom destination address for Returns
  if (data.bookingType === 'Return' && data.destinationSameAsOrigin === false) {
    if (!data.destinationStreetAddress || data.destinationStreetAddress.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street address is required for custom destination.", path: ["destinationStreetAddress"] });
    }
    if (!data.destinationProvince || data.destinationProvince.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province is required for custom destination.", path: ["destinationProvince"] });
    }
    if (!data.destinationDistrict || data.destinationDistrict.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "District is required for custom destination.", path: ["destinationDistrict"] });
    }
    if (!data.destinationSubDistrict || data.destinationSubDistrict.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sub-district is required for custom destination.", path: ["destinationSubDistrict"] });
    }
    if (!data.destinationPostcode || !/^\d{5}$/.test(data.destinationPostcode)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid 5-digit postcode is required for custom destination.", path: ["destinationPostcode"] });
    }
     if (!data.destinationPhoneNumber || data.destinationPhoneNumber.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination phone number is required for custom destination.", path: ["destinationPhoneNumber"] });
    }
  }
   // Origin phone for Pick-up
  if (data.bookingType === 'Pick-up' && (!data.originPhoneNumber || data.originPhoneNumber.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Client's origin phone number is required for Pick-up bookings.", path: ["originPhoneNumber"] });
  }
});


type StaffBookingFormValues = z.infer<typeof staffBookingFormSchema>;

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
  { value: "other", label: "Other (Specify in staff notes)" },
];

const thaiAddressData: Record<string, Record<string, Record<string, string>>> = {
  "Bangkok": {
    "Phra Nakhon": { "Wat Ratchabophit": "10200", "San Chaopho Suea": "10200", "Sao Chingcha": "10200" },
    "Dusit": { "Dusit": "10300", "Wachiraphayaban": "10300", "Suan Chitlada": "10300" },
    "Pathum Wan": { "Pathum Wan": "10330", "Lumphini": "10330", "Rong Mueang": "10330" },
  },
  "Nonthaburi": {
    "Mueang Nonthaburi": { "Suan Yai": "11000", "Talat Khwan": "11000", "Bang Khen": "11000" },
    "Pak Kret": { "Pak Kret": "11120", "Bang Talat": "11120", "Ko Kret": "11120", "Bang Phlap": "11120" },
    "Bang Bua Thong": { "Sano Loi": "11110", "Bang Rak Phatthana": "11110", "Phimonrat": "11110" },
  },
  "Chiang Mai": {
    "Mueang Chiang Mai": { "Si Phum": "50200", "Chang Moi": "50300", "Suthep": "50200"},
    "San Kamphaeng": { "San Kamphaeng": "50130", "Ton Pao": "50130", "Mae Pu Kha": "50130"},
  }
};


const totalSteps = 5;

interface StaffBookingFormProps {
  clients: Client[];
  branches: Branch[];
}

export function StaffBookingForm({ clients: initialClients, branches }: StaffBookingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const currentYear = new Date().getFullYear();
  const [internalClients, setInternalClients] = useState<Client[]>(initialClients.sort((a, b) => a.name.localeCompare(b.name)));
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isClientComboboxOpen, setIsClientComboboxOpen] = useState(false);

  const [destProvinceOptions, setDestProvinceOptions] = useState<string[]>([]);
  const [destDistrictOptions, setDestDistrictOptions] = useState<string[]>([]);
  const [destSubDistrictOptions, setDestSubDistrictOptions] = useState<string[]>([]);


  const form = useForm<StaffBookingFormValues>({
    resolver: zodResolver(staffBookingFormSchema),
    defaultValues: {
      clientId: undefined,
      bookingType: undefined,
      branchId: undefined,
      isAddingToExistingStorage: false,
      linkedAllocationId: undefined,
      selectedAllocationId: undefined,
      startDate: undefined,
      endDate: undefined,
      desiredWidthSqm: undefined,
      desiredLengthSqm: undefined,
      items: [],
      itemImageNames: [],
      hasDockingArea: undefined,
      hasCarParkingFee: undefined,
      hasElevator: undefined,
      hasBigFurniture: undefined,
      bigFurnitureMaxWidthCm: undefined,
      bigFurnitureMaxHeightCm: undefined,
      needsWrapping: false,
      needsDisassemblyReassembly: false,
      needsExtraManpower: false,
      customerNotes: "",
      staffNotes: "",

      originPhoneNumber: "",
      originAvailableTimeSlots: "",
      originGoogleMapsLink: "",

      destinationSameAsOrigin: false,
      destinationStreetAddress: "",
      destinationProvince: "",
      destinationDistrict: "",
      destinationSubDistrict: "",
      destinationPostcode: "",
      destinationPhoneNumber: "",
      destinationAvailableTimeSlots: "",
      destinationGoogleMapsLink: "",
    },
    mode: "onChange", 
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedBookingType = form.watch("bookingType");
  const watchedHasBigFurniture = form.watch("hasBigFurniture");
  const watchedClientId = form.watch("clientId");
  const selectedImageNames = form.watch("itemImageNames");
  const watchedDestinationSameAsOrigin = form.watch("destinationSameAsOrigin");
  const watchedIsAddingToExistingStorage = form.watch("isAddingToExistingStorage");
  const watchedBranchId = form.watch("branchId");

  const watchedDestProvince = form.watch("destinationProvince");
  const watchedDestDistrict = form.watch("destinationDistrict");
  const watchedDestSubDistrict = form.watch("destinationSubDistrict");
  const watchedSelectedAllocationId = form.watch("selectedAllocationId");
  const watchedLinkedAllocationId = form.watch("linkedAllocationId");


  const clientAllocations = useMemo(() => {
    if (watchedClientId && watchedBookingType === 'Return') {
      return getAllocatedBulkSpacesForClient(watchedClientId, ['Occupied', 'Reserved']);
    }
    return [];
  }, [watchedClientId, watchedBookingType]);

  const branchAllocations = useMemo(() => {
    if (watchedClientId && watchedBookingType === 'Pick-up' && watchedBranchId) {
      return getAllocatedBulkSpacesForClient(watchedClientId, ['Occupied', 'Reserved'])
        .filter(alloc => alloc.branchId === watchedBranchId);
    }
    return [];
  }, [watchedClientId, watchedBookingType, watchedBranchId]);


  useEffect(() => {
    const prefillClientId = searchParams.get('clientId');
    const prefillBookingType = searchParams.get('bookingType') as BookingType | null;
    const prefillAllocationId = searchParams.get('selectedAllocationId');
    const prefillBranchIdFromParams = searchParams.get('branchId');
    let shouldRefreshRouter = false;

    if (prefillClientId) {form.setValue('clientId', prefillClientId, { shouldValidate: false }); shouldRefreshRouter = true;}
    if (prefillBookingType) {form.setValue('bookingType', prefillBookingType, { shouldValidate: false });  shouldRefreshRouter = true;}

    if (prefillAllocationId && prefillBookingType === 'Return') {
      form.setValue('selectedAllocationId', prefillAllocationId, { shouldValidate: false });
       shouldRefreshRouter = true;
    }
     if (prefillBranchIdFromParams && !(prefillAllocationId && prefillBookingType === 'Return')) {
      form.setValue('branchId', prefillBranchIdFromParams, { shouldValidate: false });
       shouldRefreshRouter = true;
    }
    
    if (shouldRefreshRouter) {
        setTimeout(() => router.replace('/bookings/new', { scroll: false }), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => {
    setDestProvinceOptions(Object.keys(thaiAddressData));
  }, []);

  useEffect(() => {
    if (watchedDestProvince && thaiAddressData[watchedDestProvince]) {
      setDestDistrictOptions(Object.keys(thaiAddressData[watchedDestProvince]));
    } else {
      setDestDistrictOptions([]);
    }
    if (!watchedDestinationSameAsOrigin && watchedBookingType === 'Return') {
        form.setValue("destinationDistrict", "", { shouldValidate: false });
        form.setValue("destinationSubDistrict", "", { shouldValidate: false });
        form.setValue("destinationPostcode", "", { shouldValidate: false });
    }
  }, [watchedDestProvince, form, watchedDestinationSameAsOrigin, watchedBookingType]);

  useEffect(() => {
    if (watchedDestProvince && watchedDestDistrict && thaiAddressData[watchedDestProvince]?.[watchedDestDistrict]) {
      setDestSubDistrictOptions(Object.keys(thaiAddressData[watchedDestProvince][watchedDestDistrict]));
    } else {
      setDestSubDistrictOptions([]);
    }
     if (!watchedDestinationSameAsOrigin && watchedBookingType === 'Return') {
        form.setValue("destinationSubDistrict", "", { shouldValidate: false });
        form.setValue("destinationPostcode", "", { shouldValidate: false });
     }
  }, [watchedDestDistrict, watchedDestProvince, form, watchedDestinationSameAsOrigin, watchedBookingType]);

  useEffect(() => {
    if (watchedDestProvince && watchedDestDistrict && watchedDestSubDistrict && thaiAddressData[watchedDestProvince]?.[watchedDestDistrict]?.[watchedDestSubDistrict]) {
      const postcode = thaiAddressData[watchedDestProvince][watchedDestDistrict][watchedDestSubDistrict];
       if (!watchedDestinationSameAsOrigin && watchedBookingType === 'Return') {
          form.setValue("destinationPostcode", postcode, { shouldValidate: false });
       }
    } else {
      if (!watchedDestSubDistrict && !watchedDestinationSameAsOrigin && watchedBookingType === 'Return') {
          form.setValue("destinationPostcode", "", { shouldValidate: false });
      }
    }
  }, [watchedDestSubDistrict, watchedDestDistrict, watchedDestProvince, form, watchedDestinationSameAsOrigin, watchedBookingType]);

  useEffect(() => {
    if (watchedDestSubDistrict && !watchedDestinationSameAsOrigin && watchedBookingType === 'Return') {
      let found = false;
      for (const prov of Object.keys(thaiAddressData)) {
        for (const dist of Object.keys(thaiAddressData[prov])) {
          if (thaiAddressData[prov][dist][watchedDestSubDistrict]) {
            if (form.getValues("destinationDistrict") !== dist) {
              form.setValue("destinationDistrict", dist, { shouldValidate: false });
            }
            if (form.getValues("destinationProvince") !== prov) {
              form.setValue("destinationProvince", prov, { shouldValidate: false });
            }
            const postcode = thaiAddressData[prov][dist][watchedDestSubDistrict];
             if (form.getValues("destinationPostcode") !== postcode) {
                 form.setValue("destinationPostcode", postcode, { shouldValidate: false });
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDestSubDistrict, watchedDestinationSameAsOrigin, watchedBookingType]);

  useEffect(() => {
    if (watchedClientId) {
      const client = getClientById(watchedClientId);
      if (client?.phone && form.getValues('bookingType') === 'Pick-up') {
        form.setValue("originPhoneNumber", client.phone, { shouldValidate: false });
      }
      if (watchedBookingType === 'Return' && watchedDestinationSameAsOrigin && client) {
        form.setValue("destinationStreetAddress", client.originStreetAddress || "", { shouldValidate: false });
        form.setValue("destinationProvince", client.originProvince || "", { shouldValidate: false });
        form.setValue("destinationDistrict", client.originDistrict || "", { shouldValidate: false });
        form.setValue("destinationSubDistrict", client.originSubDistrict || "", { shouldValidate: false });
        form.setValue("destinationPostcode", client.originPostcode || "", { shouldValidate: false });
        form.setValue("destinationPhoneNumber", client.phone || "", { shouldValidate: false }); // Also copy phone
        form.clearErrors(["destinationStreetAddress", "destinationProvince", "destinationDistrict", "destinationSubDistrict", "destinationPostcode", "destinationPhoneNumber"]);
      }
    }
     if (watchedBookingType === 'Return' && !watchedDestinationSameAsOrigin) { // Clear destination if not same as origin
        form.setValue("destinationStreetAddress", "", { shouldValidate: false });
        form.setValue("destinationProvince", "", { shouldValidate: false });
        form.setValue("destinationDistrict", "", { shouldValidate: false });
        form.setValue("destinationSubDistrict", "", { shouldValidate: false });
        form.setValue("destinationPostcode", "", { shouldValidate: false });
        form.setValue("destinationPhoneNumber", "", { shouldValidate: false });
    }
  }, [watchedDestinationSameAsOrigin, watchedClientId, form, watchedBookingType]);


   useEffect(() => {
    if (watchedBookingType === 'Return') {
        const currentSelectedAllocId = form.getValues('selectedAllocationId');
        if (currentSelectedAllocId && !clientAllocations.find(a => a.id === currentSelectedAllocId)) {
            form.setValue('selectedAllocationId', undefined, {shouldValidate: false});
            form.setValue('branchId', undefined, {shouldValidate: false}); 
        }
    }
  }, [watchedClientId, clientAllocations, watchedBookingType, form]); 

  useEffect(() => {
    if (watchedBookingType === 'Pick-up') {
      if (form.getValues('isAddingToExistingStorage') && form.getValues('linkedAllocationId') && !branchAllocations.find(a => a.id === form.getValues('linkedAllocationId'))) {
        form.setValue('linkedAllocationId', undefined, { shouldValidate: false });
      }
    }
  }, [watchedClientId, watchedBranchId, branchAllocations, watchedBookingType, form]);


  useEffect(() => {
    if (watchedBookingType === 'Return' && watchedSelectedAllocationId) {
      const selectedAlloc = clientAllocations.find(alloc => alloc.id === watchedSelectedAllocationId);
      if (selectedAlloc && form.getValues('branchId') !== selectedAlloc.branchId) {
        form.setValue('branchId', selectedAlloc.branchId, { shouldValidate: false });
      }
    }
  }, [watchedSelectedAllocationId, clientAllocations, watchedBookingType, form]);


  const handleCreateBooking = (data: StaffBookingFormValues) => {
    console.log("Final Staff Booking Submission:", data);

    let effectiveEndDate: Date;
    if (data.bookingType === 'Pick-up' && !data.isAddingToExistingStorage) {
      if (!data.endDate) {
        toast({ title: "Error", description: "End date is missing for Pick-up booking.", variant: "destructive" });
        return;
      }
      effectiveEndDate = data.endDate;
    } else {
      if (!data.startDate) {
        toast({ title: "Error", description: "Service/Return date is missing.", variant: "destructive" });
        return;
      }
      effectiveEndDate = dateAddHours(data.startDate, 2);
    }


    try {
      const bookingPayload: Omit<Booking, 'id' | 'clientName' | 'branchName' | 'driverName' | 'vehicleInfo' | 'status' | 'createdAt' | 'thumbnailImageUrl' | 'checkoutPageSent'> & { startTime: Date, endTime: Date } = {
        clientId: data.clientId,
        branchId: data.branchId,
        bookingType: data.bookingType as BookingType,
        startTime: data.startDate as Date,
        endTime: effectiveEndDate,
        chosenDeliveryOptionId: undefined, 

        isAddingToExistingStorage: data.bookingType === 'Pick-up' ? data.isAddingToExistingStorage : undefined,
        linkedAllocationId: data.bookingType === 'Pick-up' && data.isAddingToExistingStorage ? data.linkedAllocationId : undefined,

        desiredWidthSqm: data.bookingType === 'Pick-up' && !data.isAddingToExistingStorage ? data.desiredWidthSqm : undefined,
        desiredLengthSqm: data.bookingType === 'Pick-up' && !data.isAddingToExistingStorage ? data.desiredLengthSqm : undefined,
        items: data.bookingType === 'Pick-up' ? data.items || [] : undefined,
        itemImageNames: data.bookingType === 'Pick-up' ? data.itemImageNames || [] : undefined,

        selectedAllocationId: data.bookingType === 'Return' ? data.selectedAllocationId : undefined,
        suggestedInternalUnitIdentifier: undefined, 


        hasDockingArea: data.hasDockingArea,
        hasCarParkingFee: data.hasCarParkingFee,
        hasElevator: data.hasElevator,
        hasBigFurniture: data.hasBigFurniture,
        bigFurnitureMaxWidthCm: data.hasBigFurniture ? data.bigFurnitureMaxWidthCm : undefined,
        bigFurnitureMaxHeightCm: data.hasBigFurniture ? data.bigFurnitureMaxHeightCm : undefined,
        needsWrapping: data.needsWrapping,
        needsDisassemblyReassembly: data.needsDisassemblyReassembly,
        needsExtraManpower: data.needsExtraManpower,
        customerNotes: data.customerNotes,
        staffNotes: data.staffNotes,

        originPhoneNumber: data.originPhoneNumber,
        originAvailableTimeSlots: data.originAvailableTimeSlots,
        originGoogleMapsLink: data.originGoogleMapsLink,
        
        destinationSameAsOrigin: data.bookingType === 'Return' ? data.destinationSameAsOrigin : undefined,
        destinationStreetAddress: data.bookingType === 'Return' ? (data.destinationSameAsOrigin ? getClientById(data.clientId)?.originStreetAddress : data.destinationStreetAddress) : undefined,
        destinationProvince: data.bookingType === 'Return' ? (data.destinationSameAsOrigin ? getClientById(data.clientId)?.originProvince : data.destinationProvince) : undefined,
        destinationDistrict: data.bookingType === 'Return' ? (data.destinationSameAsOrigin ? getClientById(data.clientId)?.originDistrict : data.destinationDistrict) : undefined,
        destinationSubDistrict: data.bookingType === 'Return' ? (data.destinationSameAsOrigin ? getClientById(data.clientId)?.originSubDistrict : data.destinationSubDistrict) : undefined,
        destinationPostcode: data.bookingType === 'Return' ? (data.destinationSameAsOrigin ? getClientById(data.clientId)?.originPostcode : data.destinationPostcode) : undefined,
        destinationPhoneNumber: data.destinationPhoneNumber,
        destinationAvailableTimeSlots: data.destinationAvailableTimeSlots,
        destinationGoogleMapsLink: data.destinationGoogleMapsLink,
      };
      addBooking(bookingPayload as any);
      toast({
        title: "Booking Created",
        description: `The new ${data.bookingType} booking has been successfully created with 'Pending' status.`,
      });
      form.reset();
      router.push("/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "Could not create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

const handleNextStep = async () => {
    let fieldsToValidate: FieldPath<StaffBookingFormValues>[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['clientId', 'bookingType', 'branchId'];
      const currentBookingType = form.getValues('bookingType');
      const currentIsAddingToExisting = form.getValues('isAddingToExistingStorage');

      if (currentBookingType === 'Return') {
        fieldsToValidate.push('selectedAllocationId');
      }
      if (currentBookingType === 'Pick-up' && currentIsAddingToExisting === true) {
        fieldsToValidate.push('linkedAllocationId');
      }
    } else if (currentStep === 2) {
      fieldsToValidate = ['startDate'];
      if (form.getValues('bookingType') === 'Pick-up' && !form.getValues('isAddingToExistingStorage')) {
        fieldsToValidate.push('endDate');
      }
    } else if (currentStep === 3) {
      // Item validation is handled by Zod schema for each item (if items exist).
      // Overall array validation (like minLength) is handled by the main schema.
    } else if (currentStep === 4) {
      if (form.getValues('hasBigFurniture') === true) {
        fieldsToValidate.push('bigFurnitureMaxWidthCm', 'bigFurnitureMaxHeightCm');
      }
       if (form.getValues('bookingType') === 'Pick-up') {
        fieldsToValidate.push('originPhoneNumber');
      }
      if (form.getValues('bookingType') === 'Return' && form.getValues('destinationSameAsOrigin') === false) {
        fieldsToValidate.push(
            'destinationStreetAddress', 'destinationProvince',
            'destinationDistrict', 'destinationSubDistrict', 'destinationPostcode',
            'destinationPhoneNumber'
        );
      } else if (form.getValues('bookingType') === 'Return' && form.getValues('destinationSameAsOrigin') === true) {
        // No specific destination fields to validate here if same as origin, phone comes from client.
        // Only validate destinationPhoneNumber if NOT same as origin and it's empty
      }
    }

    const isValidForNextStep = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    
    if (isValidForNextStep && currentStep < totalSteps) {
      const nextStepVal = currentStep + 1;
      setCurrentStep(nextStepVal);
      setMaxReachedStep(Math.max(maxReachedStep, nextStepVal));
    } else if (!isValidForNextStep) {
        const errorPaths: FieldPath<StaffBookingFormValues>[] = Object.keys(form.formState.errors) as FieldPath<StaffBookingFormValues>[];
        
        if (errorPaths.length > 0) {
            const firstRelevantError = fieldsToValidate.find(f => errorPaths.includes(f)) || errorPaths[0];
            if (firstRelevantError) {
              try { form.setFocus(firstRelevantError); } catch (e) { /* ignore if focusing fails */ }
              toast({
                  title: `Validation Error in Step ${currentStep}`,
                  description: `Please correct: ${String(firstRelevantError)}. Check the form for details.`,
                  variant: "destructive",
              });
            } else {
                 toast({
                    title: `Validation Error in Step ${currentStep}`,
                    description: "Please ensure all required fields are correctly filled or check previous steps for unresolved issues (e.g., dependent selections like choosing an allocation for 'Return' bookings).",
                    variant: "destructive",
                });
            }
        } else { // Should not happen if isValidForNextStep is false, but as a fallback
            toast({
                title: `Validation Error in Step ${currentStep}`,
                description: "Please review the current step for any missing or incorrect information. Also check previous steps for unresolved issues.",
                variant: "destructive",
            });
        }
    }
  };


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepIndicatorClick = (step: number) => {
    if (step <= maxReachedStep) {
      setCurrentStep(step);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <button
              type="button"
              onClick={() => handleStepIndicatorClick(step)}
              disabled={step > maxReachedStep}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentStep === step
                  ? "bg-primary text-primary-foreground"
                  : step <= maxReachedStep
                    ? "bg-primary/50 text-primary-foreground hover:bg-primary/70"
                    : "bg-muted text-muted-foreground",
                step <= maxReachedStep && "cursor-pointer",
                step > maxReachedStep && "cursor-not-allowed"
              )}
              aria-label={`Go to step ${step}`}
            >
              {currentStep > step || (step < currentStep && step <= maxReachedStep) ? <CheckCircle className="h-5 w-5"/> : step}
            </button>
            {step < totalSteps && <div className={cn("h-0.5 w-8", currentStep > step || step <= maxReachedStep -1 ? "bg-primary" : "bg-muted")} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const adjustDimensionValue = (
    fieldName: "desiredWidthSqm" | "desiredLengthSqm",
    adjustment: number
  ) => {
    const currentValue = form.getValues(fieldName) || 0;
    let newValue = parseFloat((currentValue + adjustment).toFixed(1));
    if (newValue < 0.1 && adjustment < 0) newValue = 0.1;
    if (newValue < 0 && adjustment > 0) newValue = 0.1;
    form.setValue(fieldName, newValue > 0 ? newValue : undefined, { shouldValidate: true });
  };

  const adjustItemQuantity = (index: number, adjustment: number) => {
    const fieldName = `items.${index}.quantity` as const;
    const currentValue = form.getValues(fieldName) || 1;
    let newValue = currentValue + adjustment;
    if (newValue < 1) newValue = 1;
    form.setValue(fieldName, newValue, { shouldValidate: true });
  };


  const getItemLabel = (value: string) => {
    return ITEM_TYPES.find(item => item.value === value)?.label || value;
  };

  const calculateBillingMonths = () => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");

    if (watchedBookingType === 'Return' || !endDate || (watchedBookingType === 'Pick-up' && watchedIsAddingToExistingStorage)) {
        return 0;
    }

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

  const selectedClient = useMemo(() => internalClients.find(c => c.id === watchedClientId), [watchedClientId, internalClients]);
  const selectedBranch = useMemo(() => {
    const branchIdValue = form.getValues("branchId");
    return branches.find(b => b.id === branchIdValue);
  }, [form, branches]); 

  const selectedAllocationDetails = useMemo(() => {
    if (watchedBookingType === 'Return') return clientAllocations.find(a => a.id === watchedSelectedAllocationId);
    if (watchedBookingType === 'Pick-up' && watchedIsAddingToExistingStorage) return branchAllocations.find(a => a.id === watchedLinkedAllocationId);
    return undefined;
  }, [watchedSelectedAllocationId, watchedLinkedAllocationId, clientAllocations, branchAllocations, watchedBookingType, watchedIsAddingToExistingStorage]);


  const handleClientCreated = (newClient: Client) => {
    setInternalClients(prev => [...prev, newClient].sort((a,b) => a.name.localeCompare(b.name)));
    form.setValue("clientId", newClient.id, { shouldValidate: true });
    setIsAddClientModalOpen(false);
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleCreateBooking)} className="space-y-8">
        {renderStepIndicator()}

        {currentStep === 1 && (
          <section id="step-1-client-branch-type-allocation" className="space-y-6">
            <CardTitle className="text-lg font-medium">Client, Booking Type, Branch & Allocation</CardTitle>
             <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Client</FormLabel>
                  <Popover open={isClientComboboxOpen} onOpenChange={setIsClientComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isClientComboboxOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? internalClients.find(
                                (client) => client.id === field.value
                              )?.name
                            : "Select client..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search client..." />
                        <CommandList>
                          <CommandEmpty>No client found.</CommandEmpty>
                          <CommandGroup>
                            {internalClients.map((client) => (
                              <CommandItem
                                value={client.name}
                                key={client.id}
                                onSelect={() => {
                                  form.setValue("clientId", client.id, { shouldValidate: true });
                                  setIsClientComboboxOpen(false);
                                }}
                              >
                                <CheckCircle
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    client.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {client.name} ({client.email})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                           <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        setIsAddClientModalOpen(true);
                                        setIsClientComboboxOpen(false);
                                    }}
                                    className="cursor-pointer text-primary hover:bg-accent"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create New Client Profile
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
           <FormField
              control={form.control}
              name="bookingType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Booking Type</FormLabel>
                  <FormControl>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        type="button"
                        variant={field.value === "Pick-up" ? "default" : "outline"}
                        onClick={() => {
                            form.setValue("bookingType", "Pick-up", { shouldValidate: true });
                            form.setValue("selectedAllocationId", undefined, {shouldValidate: false});
                            form.clearErrors("selectedAllocationId");
                        }}
                        className="flex-1 py-3 h-auto"
                      >
                        <div className="flex flex-col items-center sm:items-start">
                          <span>Pick-up</span>
                          <span className="text-xs opacity-80 hidden sm:inline">(Client items to Warehouse)</span>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "Return" ? "default" : "outline"}
                        onClick={() => {
                            form.setValue("bookingType", "Return", { shouldValidate: true });
                            form.setValue("isAddingToExistingStorage", false, {shouldValidate: false});
                            form.setValue("linkedAllocationId", undefined, {shouldValidate: false});
                            form.clearErrors("linkedAllocationId");
                        }}
                        className="flex-1 py-3 h-auto"
                      >
                         <div className="flex flex-col items-center sm:items-start">
                           <span>Return</span>
                           <span className="text-xs opacity-80 hidden sm:inline">(Warehouse items to Client)</span>
                         </div>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchedBookingType === 'Return' ? "Origin Branch (Auto-selected if allocation chosen)" : "Destination Branch (Warehouse for Storage)"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={watchedBookingType === 'Return' && !!watchedSelectedAllocationId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedBookingType === 'Return' && !watchedSelectedAllocationId ? "Select allocation above to set branch" : "Select a branch"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.addressDetail}, {branch.province})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   {watchedBookingType === 'Return' && !watchedSelectedAllocationId && (
                     <FormDescription className="text-xs text-muted-foreground">Branch is determined by the selected allocation above.</FormDescription>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedBookingType === 'Pick-up' && watchedClientId && watchedBranchId && (
              <FormField
                control={form.control}
                name="isAddingToExistingStorage"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Storage Intent for Pick-up</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={String(field.value)}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" id="new-storage" />
                          </FormControl>
                          <FormLabel htmlFor="new-storage" className="font-normal">Create New Storage Allocation</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" id="add-to-existing" disabled={branchAllocations.length === 0} />
                          </FormControl>
                          <FormLabel htmlFor="add-to-existing" className={cn("font-normal", branchAllocations.length === 0 && "text-muted-foreground")}>
                            Add to Existing Allocation at this Branch {branchAllocations.length === 0 && "(None found)"}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedBookingType === 'Pick-up' && watchedIsAddingToExistingStorage && branchAllocations.length > 0 && (
              <FormField
                control={form.control}
                name="linkedAllocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Client's Allocation to Add To</FormLabel>
                     <RadioGroup
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        className="space-y-2 max-h-60 overflow-y-auto pr-2"
                    >
                        {branchAllocations.map((alloc) => (
                            <FormItem
                                key={alloc.id}
                                className={cn(
                                    "flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                                    field.value === alloc.id && "bg-accent border-primary ring-1 ring-primary"
                                )}
                                onClick={() => form.setValue("linkedAllocationId", alloc.id, {shouldValidate: true})}
                            >
                                <FormControl>
                                    <RadioGroupItem value={alloc.id} className="sr-only"/>
                                </FormControl>
                                 <div className="flex-grow">
                                    <FormLabel className="font-normal cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-primary">Alloc. ID: {alloc.id.substring(0, 8)}...</span>
                                            {field.value === alloc.id && <CheckCircle className="h-5 w-5 text-primary" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Current Space: {alloc.usedSpaceSqm} SQ.M</p>
                                        <p className="text-xs text-muted-foreground">Since: {format(parseISO(alloc.allocationDate), "PPP")}</p>
                                        {alloc.internalUnitIdentifier && <p className="text-xs text-muted-foreground">Unit ID(s): {alloc.internalUnitIdentifier}</p>}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        ))}
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


            {watchedBookingType === 'Return' && watchedClientId && (
                 <FormField
                    control={form.control}
                    name="selectedAllocationId"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <FormLabel>Select Client's Allocation for Return</FormLabel>
                            {clientAllocations.length === 0 && (
                                <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted">
                                    No active flexible allocations found for {selectedClient?.name || 'the selected client'}.
                                </p>
                            )}
                            {clientAllocations.length > 0 && (
                                <RadioGroup
                                    onValueChange={(value) => field.onChange(value)}
                                    value={field.value}
                                    className="space-y-2 max-h-60 overflow-y-auto pr-2"
                                >
                                    {clientAllocations.map((alloc) => (
                                        <FormItem
                                            key={alloc.id}
                                            className={cn(
                                                "flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                                                field.value === alloc.id && "bg-accent border-primary ring-1 ring-primary"
                                            )}
                                            onClick={() => form.setValue("selectedAllocationId", alloc.id, {shouldValidate: true})}
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={alloc.id} className="sr-only"/>
                                            </FormControl>
                                            <div className="flex-grow">
                                                <FormLabel className="font-normal cursor-pointer">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-primary">Alloc. ID: {alloc.id.substring(0, 8)}...</span>
                                                        {field.value === alloc.id && <CheckCircle className="h-5 w-5 text-primary" />}
                                                    </div>
                                                     <p className="text-xs text-muted-foreground">Branch: {alloc.branchName}</p>
                                                    <p className="text-xs text-muted-foreground">Used Space: {alloc.usedSpaceSqm} SQ.M</p>
                                                    <p className="text-xs text-muted-foreground">Since: {format(parseISO(alloc.allocationDate), "PPP")}</p>
                                                    {alloc.internalUnitIdentifier && <p className="text-xs text-muted-foreground">Unit ID(s): {alloc.internalUnitIdentifier}</p>}
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
          </section>
        )}

        {currentStep === 2 && (
          <section id="step-2-dates-space" className="space-y-6">
            <CardTitle className="text-lg font-medium">
                {watchedBookingType === 'Pick-up' ? (watchedIsAddingToExistingStorage ? "Service Date for Adding Items" : "Service Dates & Space Requirements") : "Requested Return Date"}
            </CardTitle>
             <FormDescription>
                {watchedBookingType === 'Pick-up'
                    ? (watchedIsAddingToExistingStorage
                        ? "Select the date for picking up additional items. Must be at least 2 days from today."
                        : "Minimum storage duration is 1 month. Service start date must be at least 2 days from today."
                      )
                    : "Select the desired date for the return service. Must be at least 2 days from today."}
             </FormDescription>
            <div className={cn("grid grid-cols-1 gap-6", (watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage) ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{watchedBookingType === 'Pick-up' ? "Service Start Date" : "Requested Return Date"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}>
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
                            disabled={(date) => isBefore(date, addDays(new Date(new Date().setHours(0,0,0,0)), 2))}
                            initialFocus
                            fromYear={currentYear}
                            toYear={currentYear + 5} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage && (
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Service End Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}>
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
                                disabled={(date) => {
                                    const startDate = form.getValues("startDate");
                                    if (!startDate) return true; 
                                    
                                    return isBefore(date, dateFnsAddMonths(startDate, 1));
                                }}
                                initialFocus
                                fromYear={form.getValues("startDate")?.getFullYear() ?? currentYear}
                                toYear={(form.getValues("startDate")?.getFullYear() ?? currentYear) + 10}/>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                )}
            </div>

            {watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="desiredWidthSqm"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Desired Width (m)</FormLabel>
                            <div className="flex items-center space-x-2">
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustDimensionValue("desiredWidthSqm", -0.5)} disabled={field.value !== undefined && field.value <= 0.1}> <Minus className="h-4 w-4" /> </Button>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} className="text-center w-full" />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustDimensionValue("desiredWidthSqm", 0.5)}> <Plus className="h-4 w-4" /> </Button>
                            </div>
                            <FormDescription>Approx. width in meters (Optional).</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="desiredLengthSqm"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Desired Length (m)</FormLabel>
                            <div className="flex items-center space-x-2">
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustDimensionValue("desiredLengthSqm", -0.5)} disabled={field.value !== undefined && field.value <= 0.1}> <Minus className="h-4 w-4" /> </Button>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="e.g., 3.0" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} className="text-center w-full"/>
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => adjustDimensionValue("desiredLengthSqm", 0.5)}> <Plus className="h-4 w-4" /> </Button>
                            </div>
                            <FormDescription>Approx. length in meters (Optional).</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )}
          </section>
        )}

        {currentStep === 3 && (
           <section id="step-3-item-details" className="space-y-6">
            <CardTitle className="text-lg font-medium">
                {watchedBookingType === 'Pick-up' ? "Itemized List & Images" : "Selected Allocation Details"}
            </CardTitle>

            {watchedBookingType === 'Pick-up' && (
                <>
                    <FormDescription>List specific items and optionally note any associated images. {watchedIsAddingToExistingStorage ? "These are items to be added to the existing storage." : ""}</FormDescription>
                    <div className="space-y-4">
                    {itemFields.map((itemField, index) => (
                        <div key={itemField.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border rounded-md shadow-sm">
                        <FormField
                            control={form.control}
                            name={`items.${index}.type`}
                            render={({ field }) => (
                            <FormItem className="flex-grow w-full sm:w-auto">
                                <FormLabel>Item Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ITEM_TYPES.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
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
                            <FormItem className="w-full sm:w-48 flex-shrink-0">
                                <FormLabel>Quantity</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <Button type="button" variant="outline" size="icon" onClick={() => adjustItemQuantity(index, -1)} disabled={(form.getValues(`items.${index}.quantity`) || 1) <= 1}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <FormControl>
                                    <Input type="number" min="1" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} value={field.value ?? "1"} className="text-center w-full"/>
                                    </FormControl>
                                    <Button type="button" variant="outline" size="icon" onClick={() => adjustItemQuantity(index, 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeItem(index)}
                            className="w-full mt-2 sm:w-auto sm:mt-0 flex-shrink-0 px-4 py-2 h-10"
                        >
                            <Trash2 className="mr-0 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Remove</span>
                        </Button>
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" onClick={() => appendItem({ type: "", quantity: 1 })} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item to List
                    </Button>
                    {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
                    <FormMessage>{(form.formState.errors.items as any).message}</FormMessage>
                    )}

                    <Separator className="my-6"/>

                    <div>
                        <FormLabel>Item Images (Optional)</FormLabel>
                        <FormDescription className="mb-2">Upload images of the items. We will note the file names.</FormDescription>
                        <FormField
                            control={form.control}
                            name="itemImageNames"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const files = e.target.files;
                                        if (files) {
                                        const names = Array.from(files).map(file => file.name);
                                        field.onChange(names);
                                        } else {
                                        field.onChange([]);
                                        }
                                    }}
                                    className="cursor-pointer"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {selectedImageNames && selectedImageNames.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Selected image files:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto rounded-md border p-2">
                            {selectedImageNames.map((name, index) => (
                                <li key={index} className="truncate" title={name}>{name}</li>
                            ))}
                            </ul>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue("itemImageNames", [], { shouldValidate: true })}
                                className="mt-1"
                            >
                                Clear Selected Images
                            </Button>
                        </div>
                        )}
                    </div>
                </>
            )}
            {watchedBookingType === 'Return' && (
                <>
                 <FormDescription>Review the details of the allocation selected for return.</FormDescription>
                 {selectedAllocationDetails ? (
                    <Card className="bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-base">Returning Items From:</CardTitle>
                            <CardDescription>Allocation ID: {selectedAllocationDetails.id.substring(0,12)}...</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><strong>Client:</strong> {selectedAllocationDetails.clientName}</p>
                            <p><strong>Branch:</strong> {selectedAllocationDetails.branchName}</p>
                            <p><strong>Used Space:</strong> {selectedAllocationDetails.usedSpaceSqm} SQ.M</p>
                            <p><strong>Allocated Since:</strong> {format(parseISO(selectedAllocationDetails.allocationDate), "PPP")}</p>
                            {selectedAllocationDetails.internalUnitIdentifier && <p><strong>Unit ID(s):</strong> {selectedAllocationDetails.internalUnitIdentifier}</p>}
                            {selectedAllocationDetails.notes && <p><strong>Notes:</strong> {selectedAllocationDetails.notes}</p>}
                        </CardContent>
                    </Card>
                 ) : (
                    <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted">
                        No allocation selected or details not found. Please select an allocation in Step 1.
                    </p>
                 )}
                </>
            )}
          </section>
        )}

        {currentStep === 4 && (
          <section id="step-4-logistics-notes" className="space-y-6">
            <CardTitle className="text-lg font-medium">
                 Logistics, Destination & Notes ({watchedBookingType === 'Pick-up' ? "Client's Pickup Location" : "Client's Delivery Destination"})
            </CardTitle>
            
            <Separator />
            <h3 className="text-md font-semibold">{watchedBookingType === 'Pick-up' ? "Client's Origin Point Details" : "Client's Destination Point Details"}</h3>
            
            {watchedBookingType === 'Pick-up' && (
                 <FormField control={form.control} name="originPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Client's Origin Phone Number</FormLabel><FormControl><Input placeholder="e.g., 080-123-4567" {...field} /></FormControl><FormDescription>Primary contact for pickup.</FormDescription><FormMessage /></FormItem>
                )}/>
            )}
            {watchedBookingType === 'Return' && !watchedDestinationSameAsOrigin && (
                <FormField control={form.control} name="destinationPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Client's Destination Phone Number</FormLabel><FormControl><Input placeholder="e.g., 080-123-4567" {...field} /></FormControl><FormDescription>Primary contact for delivery.</FormDescription><FormMessage /></FormItem>
                )}/>
            )}
             {watchedBookingType === 'Return' && watchedDestinationSameAsOrigin && selectedClient?.phone && (
                <FormItem><FormLabel>Client's Destination Phone Number</FormLabel><Input value={selectedClient.phone} disabled /><FormDescription>Same as client's profile phone.</FormDescription></FormItem>
            )}


            <FormField control={form.control} name={watchedBookingType === 'Pick-up' ? "originAvailableTimeSlots" : "destinationAvailableTimeSlots"} render={({ field }) => (
                <FormItem><FormLabel>Available Time Slots for Service</FormLabel><FormControl><Textarea placeholder="e.g., Mon-Fri 9am-5pm, Sat 10am-2pm" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name={watchedBookingType === 'Pick-up' ? "originGoogleMapsLink" : "destinationGoogleMapsLink"} render={({ field }) => (
                <FormItem><FormLabel>Google Maps Link (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            {watchedBookingType === 'Return' && (
                <>
                    <Separator className="my-4"/>
                    <h3 className="text-md font-semibold">Client's Delivery Address</h3>
                    <FormField
                        control={form.control}
                        name="destinationSameAsOrigin"
                        render={({ field }) => (
                            <FormItem
                                className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm"
                            >
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    const isChecked = Boolean(checked);
                                    if (isChecked && (!watchedClientId || !getClientById(watchedClientId)?.originStreetAddress)) {
                                        toast({ title: "Client Origin Needed", description: "Cannot select 'Same as Origin' if client or their origin address is not set.", variant: "destructive"});
                                        return;
                                    }
                                    field.onChange(isChecked);
                                }}
                                disabled={!watchedClientId || !getClientById(watchedClientId)?.originStreetAddress}
                                id="destinationSameAsOrigin-checkbox"
                                aria-labelledby="destinationSameAsOrigin-label"
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="destinationSameAsOrigin-checkbox" id="destinationSameAsOrigin-label" className="font-normal flex-grow cursor-pointer">Delivery address is same as client's origin address</FormLabel>
                                {!getClientById(watchedClientId)?.originStreetAddress && watchedClientId && (
                                    <FormDescription className="text-xs text-destructive">Client has no origin address set.</FormDescription>
                                )}
                                 {!watchedClientId && (
                                    <FormDescription className="text-xs text-muted-foreground">Select a client first to enable this option.</FormDescription>
                                )}
                            </div>
                            </FormItem>
                        )}
                    />


                    {!watchedDestinationSameAsOrigin && (
                        <div className="space-y-4 p-4 border border-dashed rounded-md">
                            <FormField control={form.control} name="destinationStreetAddress" render={({ field }) => (
                                <FormItem><FormLabel>Street Address</FormLabel><FormControl><Textarea placeholder="e.g., 123/45 Destination Rd" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="destinationProvince" render={({ field }) => (
                                    <FormItem><FormLabel>Province</FormLabel><Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger></FormControl><SelectContent>{destProvinceOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="destinationDistrict" render={({ field }) => (
                                    <FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDestProvince}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{destDistrictOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="destinationSubDistrict" render={({ field }) => (
                                    <FormItem><FormLabel>Sub-district</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDestDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Sub-district" /></SelectTrigger></FormControl><SelectContent>{destSubDistrictOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="destinationPostcode" render={({ field }) => (
                                    <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input placeholder="e.g., 10110" {...field} /></FormControl><FormDescription>Auto-filled if sub-district selected.</FormDescription><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Separator className="my-4"/>
            <h3 className="text-md font-semibold">Logistics Checklist & Additional Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField control={form.control} name="hasDockingArea" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Has Docking Area?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={field.value === undefined ? undefined : String(field.value)} className="flex space-x-2">
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="true" id={`${field.name}-yes`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-yes`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="false" id={`${field.name}-no`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-no`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">No</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem> )} />
                <FormField control={form.control} name="hasCarParkingFee" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Has Car Parking Fee?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={field.value === undefined ? undefined : String(field.value)} className="flex space-x-2">
                               <FormItem className="flex-1">
                                    <RadioGroupItem value="true" id={`${field.name}-yes`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-yes`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="false" id={`${field.name}-no`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-no`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">No</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem> )} />
                <FormField control={form.control} name="hasElevator" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Has Elevator at Location?</FormLabel>
                       <FormControl>
                            <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={field.value === undefined ? undefined : String(field.value)} className="flex space-x-2">
                               <FormItem className="flex-1">
                                    <RadioGroupItem value="true" id={`${field.name}-yes`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-yes`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="false" id={`${field.name}-no`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-no`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">No</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem> )} />
                 <FormField control={form.control} name="hasBigFurniture" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Has Big Furniture?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={field.value === undefined ? undefined : String(field.value)} className="flex space-x-2">
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="true" id={`${field.name}-yes`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-yes`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex-1">
                                    <RadioGroupItem value="false" id={`${field.name}-no`} className="sr-only peer" />
                                    <FormLabel htmlFor={`${field.name}-no`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors h-10 text-sm">No</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem> )} />
            </div>

            {watchedHasBigFurniture && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-md mt-4">
                    <FormField control={form.control} name="bigFurnitureMaxWidthCm" render={({ field }) => (
                        <FormItem><FormLabel>Big Furniture Max Width (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 150" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl>
                        <FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="bigFurnitureMaxHeightCm" render={({ field }) => (
                        <FormItem><FormLabel>Big Furniture Max Height (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 200" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} /></FormControl>
                        <FormMessage /></FormItem> )} />
                </div>
            )}

            <Separator className="my-4"/>
            <h3 className="text-md font-semibold">Additional Services & Notes</h3>
            <div className="space-y-4 pt-4">
                <FormField control={form.control} name="needsWrapping" render={({ field }) => (
                    <FormItem
                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="needsWrapping-checkbox"
                                aria-labelledby="needsWrapping-label"
                            />
                        </FormControl>
                        <FormLabel htmlFor="needsWrapping-checkbox" id="needsWrapping-label" className="font-normal flex-grow cursor-pointer">
                            {watchedBookingType === 'Return' ? "Items Need Unwrapping?" : "Items Need Wrapping/Protection?"}
                        </FormLabel>
                    </FormItem>)}
                />
                <FormField control={form.control} name="needsDisassemblyReassembly" render={({ field }) => (
                    <FormItem
                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="needsDisassemblyReassembly-checkbox"
                                aria-labelledby="needsDisassemblyReassembly-label"
                            />
                        </FormControl>
                        <FormLabel htmlFor="needsDisassemblyReassembly-checkbox" id="needsDisassemblyReassembly-label" className="font-normal flex-grow cursor-pointer">
                             {watchedBookingType === 'Return' ? "Re-assembly Needed at Destination?" : "Disassembly/Re-assembly Needed?"}
                        </FormLabel>
                    </FormItem>)}
                />
                <FormField control={form.control} name="needsExtraManpower" render={({ field }) => (
                    <FormItem
                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="needsExtraManpower-checkbox"
                                aria-labelledby="needsExtraManpower-label"
                             />
                        </FormControl>
                        <FormLabel htmlFor="needsExtraManpower-checkbox" id="needsExtraManpower-label" className="font-normal flex-grow cursor-pointer">
                            {watchedBookingType === 'Return' ? "Extra Manpower/Organizing at Destination?" : "Needs Extra Manpower?"}
                        </FormLabel>
                    </FormItem>)}
                />
            </div>

            <FormField control={form.control} name="customerNotes" render={({ field }) => (
                <FormItem><FormLabel>Customer Notes (Logistics Related)</FormLabel>
                <FormControl><Textarea placeholder="Any specific requests or notes from the customer regarding logistics, delivery, or item handling..." {...field} /></FormControl>
                <FormMessage /></FormItem>)} />
            <FormField control={form.control} name="staffNotes" render={({ field }) => (
                <FormItem><FormLabel>Staff Booking Notes (Internal)</FormLabel>
                <FormControl><Textarea placeholder="Internal notes for this booking, visible to staff only..." {...field} /></FormControl>
                <FormMessage /></FormItem>)} />
          </section>
        )}

        {currentStep === 5 && (
          <section id="step-5-review" className="space-y-6">
             <Card className="shadow-lg border-primary">
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5"/>
                        Please Review Details Carefully Before Submission
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm">
                    <p><strong>Client:</strong> {selectedClient?.name || "N/A"}</p>
                    <p><strong>Booking Type:</strong> {watchedBookingType || "N/A"}</p>
                    <p><strong>{watchedBookingType === 'Pick-up' ? "Destination Branch" : "Origin Branch"}:</strong> {selectedBranch?.name || "N/A"}</p>
                    <p><strong>Status:</strong> Pending (Default)</p>
                    <p><strong>{watchedBookingType === 'Pick-up' ? "Service Start Date" : "Requested Return Date"}:</strong> {form.getValues("startDate") ? format(form.getValues("startDate"), "PPP") : "N/A"}</p>
                    {watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage && form.getValues("endDate") && <p><strong>Service End Date:</strong> {format(form.getValues("endDate")!, "PPP")}</p>}
                    {watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage && <p><strong>Storage Duration:</strong> {calculateBillingMonths()} billing month(s)</p>}

                    {watchedBookingType === 'Pick-up' && !watchedIsAddingToExistingStorage && (
                        <p><strong>Requested Space:</strong>
                        {form.getValues("desiredWidthSqm") ? `${form.getValues("desiredWidthSqm")}m (W)` : "N/A"}
                        {form.getValues("desiredWidthSqm") && form.getValues("desiredLengthSqm") ? " x " : ""}
                        {form.getValues("desiredLengthSqm") ? `${form.getValues("desiredLengthSqm")}m (L)` : (form.getValues("desiredWidthSqm") ? "" : "N/A")}
                        </p>
                    )}
                    {(watchedBookingType === 'Return' || (watchedBookingType === 'Pick-up' && watchedIsAddingToExistingStorage)) && selectedAllocationDetails && (
                        <p><strong>{watchedBookingType === 'Return' ? "Returning Allocation" : "Adding to Allocation"}:</strong> ID {selectedAllocationDetails.id.substring(0,8)}... ({selectedAllocationDetails.usedSpaceSqm} SQ.M at {selectedAllocationDetails.branchName})</p>
                    )}

                    {watchedBookingType === 'Pick-up' && form.getValues("items") && form.getValues("items").length > 0 && (
                      <>
                        <p className="font-medium pt-1">Itemized List ({watchedIsAddingToExistingStorage ? "Items to Add" : "Items for New Storage"}):</p>
                        <ScrollArea className="max-h-32">
                          <ul className="list-disc list-inside pl-4">
                            {form.getValues("items").map((item, index) => (
                              <li key={index}>{getItemLabel(item.type)}: {item.quantity}</li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </>
                    )}
                    {watchedBookingType === 'Pick-up' && selectedImageNames && selectedImageNames.length > 0 && (
                        <>
                            <p className="font-medium pt-1">Noted Image Files:</p>
                            <ScrollArea className="max-h-24">
                                <ul className="list-disc list-inside pl-4 text-muted-foreground">
                                    {selectedImageNames.map((name, index) => (
                                    <li key={index} className="truncate" title={name}>{name}</li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </>
                    )}
                    <Separator className="my-2"/>
                    <p className="font-medium">Origin Details:</p>
                    {watchedBookingType === 'Pick-up' ? (
                        <>
                            <p className="pl-4">Client Address: {selectedClient?.originStreetAddress}, {selectedClient?.originSubDistrict}, {selectedClient?.originDistrict}, {selectedClient?.originProvince} {selectedClient?.originPostcode}</p>
                            <p className="pl-4">Phone: {form.getValues("originPhoneNumber") || "N/A"}</p>
                            <p className="pl-4">Availability: {form.getValues("originAvailableTimeSlots") || "N/A"}</p>
                            {form.getValues("originGoogleMapsLink") && <p className="pl-4">Map: <a href={form.getValues("originGoogleMapsLink")} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Link</a></p>}
                        </>
                    ) : ( // Return - Origin is Branch
                        <>
                             <p className="pl-4">Branch: {selectedBranch?.name}</p>
                             <p className="pl-4">Address: {selectedBranch?.addressDetail}, {selectedBranch?.subDistrict}, {selectedBranch?.district}, {selectedBranch?.province} {selectedBranch?.postcode}</p>
                             <p className="pl-4">Contact: {selectedBranch?.contactInfo}</p>
                             <p className="pl-4">Hours: {selectedBranch?.operatingHours}</p>
                             {selectedBranch?.googleMapsLink && <p className="pl-4">Map: <a href={selectedBranch.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Link</a></p>}
                        </>
                    )}
                    <Separator className="my-2"/>
                     <p className="font-medium">Destination Details:</p>
                     {watchedBookingType === 'Pick-up' ? ( // Pick-up - Destination is Branch
                        <>
                             <p className="pl-4">Branch: {selectedBranch?.name}</p>
                             <p className="pl-4">Address: {selectedBranch?.addressDetail}, {selectedBranch?.subDistrict}, {selectedBranch?.district}, {selectedBranch?.province} {selectedBranch?.postcode}</p>
                             <p className="pl-4">Contact: {selectedBranch?.contactInfo}</p>
                             <p className="pl-4">Hours: {selectedBranch?.operatingHours}</p>
                             {selectedBranch?.googleMapsLink && <p className="pl-4">Map: <a href={selectedBranch.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Link</a></p>}
                        </>
                     ) : ( // Return - Destination is Client
                        <>
                            {form.getValues("destinationSameAsOrigin") && selectedClient?.originStreetAddress ? (
                                <p className="pl-4">Client Address (Same as Origin): {selectedClient.originStreetAddress}, {selectedClient.originSubDistrict}, {selectedClient.originDistrict}, {selectedClient.originProvince} {selectedClient.originPostcode}</p>
                            ) : (
                                <p className="pl-4">Client Address (Custom): {form.getValues("destinationStreetAddress") || "N/A"}, {form.getValues("destinationSubDistrict") || "N/A"}, {form.getValues("destinationDistrict") || "N/A"}, {form.getValues("destinationProvince") || "N/A"} {form.getValues("destinationPostcode") || "N/A"}</p>
                            )}
                            <p className="pl-4">Phone: {form.getValues("destinationPhoneNumber") || (form.getValues("destinationSameAsOrigin") ? selectedClient?.phone : "N/A")}</p>
                            <p className="pl-4">Availability: {form.getValues("destinationAvailableTimeSlots") || "N/A"}</p>
                            {form.getValues("destinationGoogleMapsLink") && <p className="pl-4">Map: <a href={form.getValues("destinationGoogleMapsLink")} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Link</a></p>}
                        </>
                     )}

                    <Separator className="my-2"/>
                    <p className="font-medium pt-1">Logistics Checklist:</p>
                     <ul className="list-disc list-inside pl-4">
                        <li>Docking Area: {form.getValues("hasDockingArea") === undefined ? "N/A" : form.getValues("hasDockingArea") ? "Yes" : "No"}</li>
                        <li>Car Parking Fee: {form.getValues("hasCarParkingFee") === undefined ? "N/A" : form.getValues("hasCarParkingFee") ? "Yes" : "No"}</li>
                        <li>Elevator: {form.getValues("hasElevator") === undefined ? "N/A" : form.getValues("hasElevator") ? "Yes" : "No"}</li>
                        <li>Big Furniture: {form.getValues("hasBigFurniture") === undefined ? "N/A" : form.getValues("hasBigFurniture") ? `Yes (Max W: ${form.getValues("bigFurnitureMaxWidthCm") || 'N/A'}cm, Max H: ${form.getValues("bigFurnitureMaxHeightCm") || 'N/A'}cm)` : "No"}</li>
                        <li>{watchedBookingType === 'Return' ? "Needs Unwrapping" : "Needs Wrapping"}: {form.getValues("needsWrapping") ? "Yes" : "No"}</li>
                        <li>{watchedBookingType === 'Return' ? "Needs Re-assembly" : "Needs Disassembly/Reassembly"}: {form.getValues("needsDisassemblyReassembly") ? "Yes" : "No"}</li>
                        <li>{watchedBookingType === 'Return' ? "Extra Manpower/Organizing" : "Needs Extra Manpower"}: {form.getValues("needsExtraManpower") ? "Yes" : "No"}</li>
                    </ul>

                    {form.getValues("customerNotes") && <p className="pt-1"><strong>Customer Notes (Logistics):</strong> {form.getValues("customerNotes")}</p>}
                    {form.getValues("staffNotes") && <p className="pt-1"><strong>Staff Notes:</strong> {form.getValues("staffNotes")}</p>}
                </CardContent>
            </Card>
          </section>
        )}
        {(currentStep === 5 || !form.formState.isValid && form.formState.isSubmitted ) && Object.keys(form.formState.errors).length > 0 && (
            <Card className="mt-4 border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="text-destructive text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4"/> Form Errors Detected
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-destructive text-xs space-y-1">
                    <p>Please review the form and correct the following errors:</p>
                    <ul className="list-disc list-inside pl-4">
                    {Object.entries(form.formState.errors).map(([fieldName, error]) => (
                         <li key={fieldName}><strong>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {error?.message}</li>
                    ))}
                    </ul>
                     <p className="mt-2 text-xs">You may need to go back to previous steps to fix some issues.</p>
                </CardContent>
            </Card>
        )}


        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
          )}

          {currentStep < totalSteps ? (
             <Button type="button" onClick={handleNextStep} className={cn(currentStep === 1 && "ml-auto")}>
                Next Step
             </Button>
          ) : (
            <Button type="submit" className={cn(currentStep === 1 && "ml-auto")}>
                Create Booking
            </Button>
          )}
        </div>
      </form>
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Client Profile</DialogTitle>
            <DialogDescription>
              Fill in the details for the new client. They will be automatically selected after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AddClientForm
                onClientCreated={handleClientCreated}
                isInModal={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
