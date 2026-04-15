
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/forms/customer-login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SpaceWiseIcon } from "@/components/icons";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
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
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Log in to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
              <CustomerLoginForm />
            </Suspense>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
