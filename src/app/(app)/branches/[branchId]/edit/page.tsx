
"use client"; 

import { BranchForm } from "@/components/forms/add-branch-form"; // Renamed import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBranchById } from "@/lib/data";
import type { Branch } from "@/types";

// Metadata can be dynamically generated if needed using generateMetadata, but for client component, handle title in useEffect or similar
// export const metadata: Metadata = {
//   title: 'Edit Branch', 
// };

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = typeof params.branchId === 'string' ? params.branchId : undefined;
  const [branch, setBranch] = useState<Branch | null | undefined>(undefined); // undefined for loading, null for not found
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (branchId) {
      const fetchedBranch = getBranchById(branchId);
      setBranch(fetchedBranch);
      setIsLoading(false);
    } else {
      // Handle case where branchId might not be available immediately or is invalid
      setIsLoading(false);
      setBranch(null); // Or redirect, show error
    }
  }, [branchId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-full max-w-md p-6 text-center">
          <CardHeader>
            <CardTitle>Branch Not Found</CardTitle>
            <CardDescription>The branch you are trying to edit (ID: {branchId || "N/A"}) could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/branches">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Branches
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/branches/${branch.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Branch Details
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Branch: {branch.name}</CardTitle>
          <CardDescription>Modify the details for this branch.</CardDescription>
        </CardHeader>
        <CardContent>
          <BranchForm initialData={branch} isEditMode={true} />
        </CardContent>
      </Card>
    </div>
  );
}
