
import { BranchForm } from "@/components/forms/add-branch-form"; // Renamed import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Branch',
};

export default function AddNewBranchPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/branches">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Branches
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Branch</CardTitle>
          <CardDescription>Fill in the details for the new branch.</CardDescription>
        </CardHeader>
        <CardContent>
          <BranchForm isEditMode={false} /> {/* Use BranchForm and pass isEditMode */}
        </CardContent>
      </Card>
    </div>
  );
}
