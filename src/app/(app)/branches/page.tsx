
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, BarChart3, PieChart, ExternalLink } from "lucide-react"; // Added icons
import { BranchTable } from "./components/branch-table";
import { getBranches } from "@/lib/db";
import type { Metadata } from 'next';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Branches',
};

// Helper to parse capacity string like "6000 sq m" to a number
const parseCapacity = (capacityString?: string): number => {
  if (!capacityString) return 0;
  return parseInt(capacityString.split(" ")[0]) || 0;
};

export default async function BranchesPage() {
  const branches = await getBranches();

  const totalBranches = branches.length;
  const totalCapacity = branches.reduce((sum, branch) => sum + parseCapacity(branch.totalCapacity), 0);
  const totalOccupiedCapacity = branches.reduce((sum, branch) => sum + parseCapacity(branch.occupiedCapacity), 0);
  const overallUtilization = totalCapacity > 0 ? (totalOccupiedCapacity / totalCapacity) * 100 : 0;

  const stats = [
    { title: "Total Branches", value: totalBranches, icon: Building2, description: "Number of active locations" },
    { title: "Total Capacity", value: `${totalCapacity.toLocaleString()} sq m`, icon: BarChart3, description: "Combined storage space" },
    { title: "Committed Capacity", value: `${totalOccupiedCapacity.toLocaleString()} sq m`, icon: BarChart3, variant: "secondary", description: "Currently utilized space" },
    { title: "Overall Utilization", value: `${overallUtilization.toFixed(1)}%`, icon: PieChart, description: "Percentage of total capacity used" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Branch Management</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/branches/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Branch
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <BranchTable branches={branches} />
    </div>
  );
}
