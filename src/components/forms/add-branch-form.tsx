
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import type { Branch } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addBranch, updateBranch } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

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


const addBranchFormSchema = z.object({
  branchName: z.string().min(3, { message: "Branch name must be at least 3 characters." }),
  addressDetail: z.string().min(5, { message: "Street address details are required." }),
  province: z.string().min(1, { message: "Province is required."}),
  district: z.string().min(1, { message: "District is required."}),
  subDistrict: z.string().min(1, { message: "Sub-district is required."}),
  postcode: z.string().regex(/^\d{5}$/, { message: "Postcode must be 5 digits." }),
  totalAvailableSpaceSqm: z.coerce.number().positive({ message: "Available space must be a positive number." }),
  ceilingHeightMeters: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({invalid_type_error: "Must be a number."}).positive({ message: "Height must be a positive number." }).optional()
  ),
  numberOfFloors: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({invalid_type_error: "Must be an integer."}).int().positive({ message: "Number of floors must be a positive integer." }).optional()
  ),
  branchType: z.enum(["Owned", "Partner", "Franchise"], { required_error: "Branch type is required." }),
  branchOwner: z.string().optional(),
  picContact: z.string().min(5, { message: "PIC contact is required." }),
  operatingHours: z.string().min(5, { message: "Operating hours are required." }),
  payoutDayOfMonth: z.coerce.number().int().min(1).max(28).optional(),
  commissionRatePercent: z.coerce.number().min(0).max(100).optional(),
  commissionNotes: z.string().optional(),
}).superRefine((data, ctx) => {
  if ((data.branchType === "Partner" || data.branchType === "Franchise")) {
    if (!data.branchOwner || data.branchOwner.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Branch owner is required for Partner or Franchise types.", path: ["branchOwner"] });
    }
    if (data.payoutDayOfMonth === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Payout Day of Month is required for Partner/Franchise.", path: ["payoutDayOfMonth"] });
    }
    if (data.commissionRatePercent === undefined || data.commissionRatePercent < 0) { // ensure positive commission rate
       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Commission Rate (%) is required and must be non-negative for Partner/Franchise.", path: ["commissionRatePercent"] });
    }
  }
});

export type BranchFormValues = z.infer<typeof addBranchFormSchema>;

interface BranchFormProps {
  initialData?: Branch;
  isEditMode?: boolean;
}

export function BranchForm({ initialData, isEditMode = false }: BranchFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subDistrictOptions, setSubDistrictOptions] = useState<string[]>([]);


  const form = useForm<BranchFormValues>({
    resolver: zodResolver(addBranchFormSchema),
    defaultValues: initialData ? {
      branchName: initialData.name,
      addressDetail: initialData.addressDetail || "",
      province: initialData.province || "",
      district: initialData.district || "",
      subDistrict: initialData.subDistrict || "",
      postcode: initialData.postcode || "",
      totalAvailableSpaceSqm: initialData.totalCapacity ? parseFloat(initialData.totalCapacity.split(" ")[0]) : undefined,
      ceilingHeightMeters: initialData.ceilingHeightMeters !== undefined ? initialData.ceilingHeightMeters : undefined,
      numberOfFloors: initialData.numberOfFloors !== undefined ? initialData.numberOfFloors : undefined,
      branchType: initialData.branchType,
      branchOwner: initialData.branchOwner || "",
      picContact: initialData.contactInfo,
      operatingHours: initialData.operatingHours || "",
      payoutDayOfMonth: initialData.payoutDayOfMonth,
      commissionRatePercent: initialData.commissionRatePercent,
      commissionNotes: initialData.commissionNotes || "",
    } : {
      branchName: "",
      addressDetail: "",
      province: "",
      district: "",
      subDistrict: "",
      postcode: "",
      totalAvailableSpaceSqm: undefined,
      ceilingHeightMeters: undefined,
      numberOfFloors: undefined,
      branchType: undefined,
      branchOwner: "",
      picContact: "",
      operatingHours: "",
      payoutDayOfMonth: undefined,
      commissionRatePercent: undefined,
      commissionNotes: "",
    },
  });

  const watchedProvince = form.watch("province");
  const watchedDistrict = form.watch("district");
  const watchedSubDistrict = form.watch("subDistrict");
  const branchType = form.watch("branchType");

  useEffect(() => {
    setProvinceOptions(Object.keys(thaiAddressData));
  }, []);

  useEffect(() => {
    if (watchedProvince && thaiAddressData[watchedProvince]) {
      setDistrictOptions(Object.keys(thaiAddressData[watchedProvince]));
    } else {
      setDistrictOptions([]);
    }
    if(form.getValues("district") !== "") form.setValue("district", "");
    if(form.getValues("subDistrict") !== "") form.setValue("subDistrict", "");
    if(form.getValues("postcode") !== "") form.setValue("postcode", "");
  }, [watchedProvince, form]);

  useEffect(() => {
    if (watchedProvince && watchedDistrict && thaiAddressData[watchedProvince]?.[watchedDistrict]) {
      setSubDistrictOptions(Object.keys(thaiAddressData[watchedProvince][watchedDistrict]));
    } else {
      setSubDistrictOptions([]);
    }
     if(form.getValues("subDistrict") !== "") form.setValue("subDistrict", "");
     if(form.getValues("postcode") !== "") form.setValue("postcode", "");
  }, [watchedDistrict, watchedProvince, form]);

  useEffect(() => {
    if (watchedProvince && watchedDistrict && watchedSubDistrict && thaiAddressData[watchedProvince]?.[watchedDistrict]?.[watchedSubDistrict]) {
      const postcode = thaiAddressData[watchedProvince][watchedDistrict][watchedSubDistrict];
      form.setValue("postcode", postcode);
    } else {
       if (!watchedSubDistrict && form.getValues("postcode") !== "") {
          form.setValue("postcode", "");
      }
    }
  }, [watchedSubDistrict, watchedDistrict, watchedProvince, form]);


  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        branchName: initialData.name,
        addressDetail: initialData.addressDetail || "",
        province: initialData.province || "",
        district: initialData.district || "",
        subDistrict: initialData.subDistrict || "",
        postcode: initialData.postcode || "",
        totalAvailableSpaceSqm: initialData.totalCapacity ? parseFloat(initialData.totalCapacity.split(" ")[0]) : undefined,
        ceilingHeightMeters: initialData.ceilingHeightMeters !== undefined ? initialData.ceilingHeightMeters : undefined,
        numberOfFloors: initialData.numberOfFloors !== undefined ? initialData.numberOfFloors : undefined,
        branchType: initialData.branchType,
        branchOwner: initialData.branchOwner || "",
        picContact: initialData.contactInfo,
        operatingHours: initialData.operatingHours || "",
        payoutDayOfMonth: initialData.payoutDayOfMonth,
        commissionRatePercent: initialData.commissionRatePercent,
        commissionNotes: initialData.commissionNotes || "",
      });
      if (initialData.province) {
        setDistrictOptions(Object.keys(thaiAddressData[initialData.province] || {}));
        if (initialData.district) {
          setSubDistrictOptions(Object.keys(thaiAddressData[initialData.province]?.[initialData.district] || {}));
        }
      }
    }
  }, [initialData, isEditMode, form]);


  function onSubmit(data: BranchFormValues) {
    const branchPayload: Partial<Omit<Branch, 'id'>> = {
        name: data.branchName,
        addressDetail: data.addressDetail,
        province: data.province,
        district: data.district,
        subDistrict: data.subDistrict,
        postcode: data.postcode,
        totalCapacity: `${data.totalAvailableSpaceSqm} sq m`,
        ceilingHeightMeters: data.ceilingHeightMeters ? Number(data.ceilingHeightMeters) : undefined,
        numberOfFloors: data.numberOfFloors ? Number(data.numberOfFloors) : undefined,
        branchType: data.branchType,
        branchOwner: data.branchOwner,
        contactInfo: data.picContact, // map picContact to contactInfo
        operatingHours: data.operatingHours,
        payoutDayOfMonth: (data.branchType === "Partner" || data.branchType === "Franchise") ? data.payoutDayOfMonth : undefined,
        commissionRatePercent: (data.branchType === "Partner" || data.branchType === "Franchise") ? data.commissionRatePercent : undefined,
        commissionNotes: (data.branchType === "Partner" || data.branchType === "Franchise") ? data.commissionNotes : undefined,
    };

    if (isEditMode && initialData) {
      const updated = updateBranch(initialData.id, branchPayload);
      if (updated) {
        toast({
          title: "Branch Updated",
          description: `Branch "${updated.name}" has been successfully updated.`,
        });
        router.push(`/branches/${initialData.id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to update branch.",
          variant: "destructive",
        });
      }
    } else {
      const newBranch = addBranch(branchPayload as Omit<Branch, 'id' | 'occupiedCapacity' | 'remainingBulkCapacity' | 'availableSpaces'>);
      toast({
        title: "Branch Added",
        description: `Branch "${newBranch.name}" has been successfully added.`,
      });
      router.push("/branches");
    }
  }

  const payoutDays = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="branchName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SASOM Central Storage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressDetail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Detail (Street, Building, etc.)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123/45 Moo 6, Sukhumvit Road, XYZ Building" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="province"
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
            name="district"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subDistrict"
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
            name="postcode"
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="totalAvailableSpaceSqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Available Space (SQ.M)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ceilingHeightMeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ceiling Height (m) (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 3.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="numberOfFloors"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Number of Floors (Optional)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="branchType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Owned">Owned</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Franchise">Franchise</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(branchType === "Partner" || branchType === "Franchise") && (
          <>
            <Separator />
            <h3 className="text-md font-semibold pt-2">Partner/Franchise Details</h3>
            <FormField
              control={form.control}
              name="branchOwner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Owner/Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner/partner company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="payoutDayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Day of Month</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === '' ? undefined : parseInt(val, 10))} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {payoutDays.map(day => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Day of the month when payout is processed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commissionRatePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="e.g., 10" {...field}
                       onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                       value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Percentage of revenue for commission.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="commissionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Tiered model details, specific exclusions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
          </>
        )}


        <FormField
          control={form.control}
          name="picContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch PIC Contact (Phone/Email)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 081-234-5678 or manager@branch.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="operatingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Hours</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM, Sun: Closed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto">
          {isEditMode ? "Save Changes" : "Add Branch"}
        </Button>
      </form>
    </Form>
  );
}
