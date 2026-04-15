
import { StaffLoginForm } from "@/components/forms/staff-login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SpaceWiseIcon } from "@/components/icons";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Login',
};

export default function StaffLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-3xl font-bold text-primary hover:text-primary/90">
            <SpaceWiseIcon className="h-8 w-8" />
            <span>Widing</span>
          </Link>
          <p className="text-muted-foreground">Staff Portal</p>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Staff Access</CardTitle>
            <CardDescription>Please enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffLoginForm />
            {/* No sign-up link as per requirements */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
