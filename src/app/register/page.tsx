
import { CustomerRegistrationForm } from "@/components/forms/customer-registration-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SpaceWiseIcon } from "@/components/icons";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-3xl font-bold text-primary hover:text-primary/90">
            <SpaceWiseIcon className="h-8 w-8" />
            <span>Widing</span>
          </Link>
          <p className="text-muted-foreground">Customer Portal</p>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Sign up to manage your storage needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerRegistrationForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
