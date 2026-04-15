
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const staffLoginFormSchema = z.object({
  staffId: z.string().min(1, { message: "Staff ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type StaffLoginFormValues = z.infer<typeof staffLoginFormSchema>;

export function StaffLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StaffLoginFormValues>({
    resolver: zodResolver(staffLoginFormSchema),
    defaultValues: {
      staffId: "",
      password: "",
    },
  });

  async function onSubmit(data: StaffLoginFormValues) {
    setIsLoading(true);
    // Simulate API call / auth check
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login logic (replace with actual authentication in a real app)
    if (data.staffId === "staff" && data.password === "password") {
      toast({
        title: "Login Successful (Mock)",
        description: "Welcome, Staff Member!",
      });
      // In a real app, you'd set some auth state here (e.g., session cookie, token).
      // For this mock, we'll just redirect to the admin dashboard.
      router.push('/dashboard'); // Assuming staff also land on dashboard
    } else {
      toast({
        title: "Login Failed (Mock)",
        description: "Invalid Staff ID or Password. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="staffId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter your Staff ID" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
    </Form>
  );
}
