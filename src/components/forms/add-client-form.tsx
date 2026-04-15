
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addClient } from "@/lib/data";
import type { Client } from "@/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { FieldPath } from "react-hook-form";

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

const addClientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(9, { message: "Phone number must be at least 9 digits." }).regex(/^[0-9+-]+$/, "Invalid phone number format."),
  originLocationType: z.enum(["Home", "Condo"], { required_error: "Origin location type is required." }),
  originStreetAddress: z.string().min(2, { message: "Street address is required." }),
  originFloor: z.string().optional(), // Added optional floor
  originProvince: z.string().min(1, { message: "Province is required."}),
  originDistrict: z.string().min(1, { message: "District is required."}),
  originSubDistrict: z.string().min(1, { message: "Sub-district is required."}),
  originPostcode: z.string().regex(/^\d{5}$/, { message: "Postcode must be 5 digits." }),
});

type AddClientFormValues = z.infer<typeof addClientFormSchema>;

interface AddClientFormProps {
  onClientCreated?: (newClient: Client) => void;
  isInModal?: boolean;
}

export function AddClientForm({ onClientCreated, isInModal = false }: AddClientFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [currentClientStep, setCurrentClientStep] = useState(1);

  const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subDistrictOptions, setSubDistrictOptions] = useState<string[]>([]);

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      originLocationType: undefined,
      originStreetAddress: "",
      originFloor: "",
      originProvince: "",
      originDistrict: "",
      originSubDistrict: "",
      originPostcode: "",
    },
    mode: "onChange",
  });

  const watchedProvince = form.watch("originProvince");
  const watchedDistrict = form.watch("originDistrict");
  const watchedSubDistrict = form.watch("originSubDistrict");

  useEffect(() => {
    setProvinceOptions(Object.keys(thaiAddressData));
  }, []);

  useEffect(() => {
    if (watchedProvince && thaiAddressData[watchedProvince]) {
      setDistrictOptions(Object.keys(thaiAddressData[watchedProvince]));
    } else {
      setDistrictOptions([]);
    }
    form.setValue("originDistrict", "", { shouldValidate: false });
    form.setValue("originSubDistrict", "", { shouldValidate: false });
    form.setValue("originPostcode", "", { shouldValidate: false });
  }, [watchedProvince, form]);

  useEffect(() => {
    if (watchedProvince && watchedDistrict && thaiAddressData[watchedProvince]?.[watchedDistrict]) {
      setSubDistrictOptions(Object.keys(thaiAddressData[watchedProvince][watchedDistrict]));
    } else {
      setSubDistrictOptions([]);
    }
    form.setValue("originSubDistrict", "", { shouldValidate: false });
    form.setValue("originPostcode", "", { shouldValidate: false });
  }, [watchedDistrict, watchedProvince, form]);

  useEffect(() => {
    if (watchedProvince && watchedDistrict && watchedSubDistrict && thaiAddressData[watchedProvince]?.[watchedDistrict]?.[watchedSubDistrict]) {
      const postcode = thaiAddressData[watchedProvince][watchedDistrict][watchedSubDistrict];
      form.setValue("originPostcode", postcode, { shouldValidate: false });
    } else {
      if (!watchedSubDistrict) {
          form.setValue("originPostcode", "", { shouldValidate: false });
      }
    }
  }, [watchedSubDistrict, watchedDistrict, watchedProvince, form]);

  useEffect(() => {
    if (watchedSubDistrict) {
      let found = false;
      for (const prov of Object.keys(thaiAddressData)) {
        for (const dist of Object.keys(thaiAddressData[prov])) {
          if (thaiAddressData[prov][dist][watchedSubDistrict]) {
            if (form.getValues("originDistrict") !== dist) {
              form.setValue("originDistrict", dist, { shouldValidate: true });
            }
            if (form.getValues("originProvince") !== prov) {
              form.setValue("originProvince", prov, { shouldValidate: true });
            }
            const postcode = thaiAddressData[prov][dist][watchedSubDistrict];
             if (form.getValues("originPostcode") !== postcode) {
                 form.setValue("originPostcode", postcode, { shouldValidate: true });
            }
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSubDistrict]);


  const handleNextClientStep = async () => {
    let fieldsToValidate: FieldPath<AddClientFormValues>[] = [];
    if (currentClientStep === 1) {
      fieldsToValidate = ["name", "email", "phone"];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentClientStep(currentClientStep + 1);
    } else {
        const firstErrorKey = Object.keys(form.formState.errors).find(key => fieldsToValidate.includes(key as FieldPath<AddClientFormValues>)) as FieldPath<AddClientFormValues>;
        if (firstErrorKey) {
            try { form.setFocus(firstErrorKey); } catch (e) { /* ignore */ }
        }
        toast({
            title: `Validation Error in Step ${currentClientStep}`,
            description: `Please correct the highlighted fields.`,
            variant: "destructive",
        });
    }
  };

  const handleBackClientStep = () => {
    setCurrentClientStep(currentClientStep - 1);
  };

  function onSubmit(data: AddClientFormValues) {
    try {
      const clientPayload: Omit<Client, 'id' | 'joinedDate' | 'status'> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        originLocationType: data.originLocationType,
        originStreetAddress: data.originStreetAddress,
        originFloor: data.originFloor, // Added
        originProvince: data.originProvince,
        originDistrict: data.originDistrict,
        originSubDistrict: data.originSubDistrict,
        originPostcode: data.originPostcode,
      };
      const newClient = addClient(clientPayload);
      toast({
        title: "Client Added",
        description: `Client "${newClient.name}" has been successfully added.`,
      });
      form.reset();
      setCurrentClientStep(1); 
      setDistrictOptions([]);
      setSubDistrictOptions([]);

      if (onClientCreated) {
        onClientCreated(newClient);
      } else if (!isInModal) {
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to add client:", error);
      toast({
        title: "Error",
        description: "Could not add client. Please try again.",
        variant: "destructive",
      });
    }
  }

  const renderStep1 = () => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className={cn("grid grid-cols-1 gap-6", isInModal ? "" : "md:grid-cols-2")}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 0812345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="text-md font-semibold pt-2">Origin Address Details</h3>
      <FormField
        control={form.control}
        name="originLocationType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Origin Location Type</FormLabel>
            <FormControl>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant={field.value === "Home" ? "default" : "outline"}
                  onClick={() => field.onChange("Home")}
                  className="flex-1 py-3 h-auto"
                >
                  Home
                </Button>
                <Button
                  type="button"
                  variant={field.value === "Condo" ? "default" : "outline"}
                  onClick={() => field.onChange("Condo")}
                  className="flex-1 py-3 h-auto"
                >
                  Condo
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="originStreetAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g., 123/45 Moo 6, Sukhumvit Road" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="originFloor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Floor (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 5th floor, Unit 5A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className={cn("grid grid-cols-1 gap-6", isInModal ? "" : "md:grid-cols-2")}>
        <FormField
          control={form.control}
          name="originProvince"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {provinceOptions.map(prov => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originDistrict"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedProvince || districtOptions.length === 0}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districtOptions.map(dist => <SelectItem key={dist} value={dist}>{dist}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className={cn("grid grid-cols-1 gap-6", isInModal ? "" : "md:grid-cols-2")}>
        <FormField
          control={form.control}
          name="originSubDistrict"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-district</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDistrict || subDistrictOptions.length === 0}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select Sub-district" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subDistrictOptions.map(subDist => <SelectItem key={subDist} value={subDist}>{subDist}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originPostcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postcode</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 10110" {...field} />
              </FormControl>
              <FormDescription>Auto-filled if sub-district is selected, or enter manually.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isInModal ? (
          <>
            {currentClientStep === 1 && renderStep1()}
            {currentClientStep === 2 && renderStep2()}
            <div className="flex justify-between pt-4">
              {currentClientStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBackClientStep}>
                  Back
                </Button>
              )}
              {currentClientStep < 2 ? (
                <Button type="button" onClick={handleNextClientStep} className={cn(currentClientStep === 1 && "ml-auto")}>
                  Next
                </Button>
              ) : (
                <Button type="submit" className="ml-auto">Create Client</Button>
              )}
            </div>
          </>
        ) : (
          <>
            {renderStep1()}
            <div className="border-t pt-6 mt-6"> 
                {renderStep2()}
            </div>
            <Button type="submit" className="w-full sm:w-auto">Add Client</Button>
          </>
        )}
      </form>
    </Form>
  );
}
