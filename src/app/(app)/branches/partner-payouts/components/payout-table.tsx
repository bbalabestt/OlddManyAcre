
"use client";

import type { Branch } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, MoreHorizontal, FileSpreadsheet, CheckCircle, AlertCircle, CircleEllipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface PayoutTableProps {
  branches: Branch[];
}

const mockPayoutStatuses = ["Pending", "Paid", "Processing", "Issue"] as const;
type MockPayoutStatus = typeof mockPayoutStatuses[number];

interface BranchWithPayoutData extends Branch {
  mockRevenue: number;
  calculatedPayout: number;
  payoutStatus: MockPayoutStatus;
  nextPayoutDate: string;
}

export function PayoutTable({ branches }: PayoutTableProps) {
  const { toast } = useToast();
  const [displayBranches, setDisplayBranches] = useState<BranchWithPayoutData[]>([]);

  useEffect(() => {
    const enhancedBranches = branches.map((branch, index) => {
      const mockRevenue = Math.floor(Math.random() * (500000 - 50000 + 1)) + 50000;
      const commissionRate = (branch.commissionRatePercent || 0) / 100;
      const calculatedPayout = mockRevenue * commissionRate;
      const payoutStatus = mockPayoutStatuses[index % mockPayoutStatuses.length];
      
      let nextPayoutDisplay = "N/A";
      if (branch.payoutDayOfMonth) {
        const today = new Date();
        let payoutDateThisMonth = new Date(today.getFullYear(), today.getMonth(), branch.payoutDayOfMonth);
        if (today.getDate() > branch.payoutDayOfMonth) {
          payoutDateThisMonth.setMonth(payoutDateThisMonth.getMonth() + 1);
        }
        nextPayoutDisplay = format(payoutDateThisMonth, "MMM d, yyyy");
      }


      return {
        ...branch,
        mockRevenue,
        commissionRate, // Storing the decimal rate
        calculatedPayout,
        payoutStatus,
        nextPayoutDate: nextPayoutDisplay,
      };
    });
    setDisplayBranches(enhancedBranches);
  }, [branches]);

  const handleExportCSV = (branchName: string) => {
    toast({
      title: "Export CSV (Placeholder)",
      description: `CSV export for ${branchName} payout report is not yet implemented.`,
    });
  };
  
  const handleMarkAsPaid = (branchId: string) => {
    setDisplayBranches(prev => prev.map(b => b.id === branchId ? {...b, payoutStatus: "Paid"} : b));
    toast({
      title: "Payout Status Updated",
      description: `Branch payout marked as Paid. (Mock action)`,
    });
  }

  const getStatusBadgeVariant = (status: MockPayoutStatus) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Paid': return 'default';
      case 'Processing': return 'secondary';
      case 'Issue': return 'destructive';
      default: return 'secondary';
    }
  };
  
   const getStatusIcon = (status: MockPayoutStatus) => {
    switch (status) {
      case 'Pending': return <CircleEllipsis className="mr-2 h-3 w-3 text-yellow-500" />;
      case 'Paid': return <CheckCircle className="mr-2 h-3 w-3 text-green-500" />;
      case 'Processing': return <MoreHorizontal className="mr-2 h-3 w-3 text-blue-500" />;
      case 'Issue': return <AlertCircle className="mr-2 h-3 w-3 text-red-500" />;
      default: return null;
    }
  };


  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Payout Summary</CardTitle>
        <CardDescription>
          Overview of commission payouts for partner and franchise branches. All figures are mock data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch Name</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="text-right">Revenue (Mock)</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Comm. Rate</TableHead>
              <TableHead className="text-right">Payout (THB)</TableHead>
              <TableHead className="hidden lg:table-cell">Next Payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayBranches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell className="font-medium">
                  <Link href={`/branches/${branch.id}`} className="hover:underline text-primary">
                    {branch.name}
                  </Link>
                   <p className="text-xs text-muted-foreground md:hidden">Type: {branch.branchType}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={branch.branchType === 'Partner' ? 'secondary' : 'outline'}>
                    {branch.branchType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">฿{branch.mockRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">{(branch.commissionRatePercent || 0)}%</TableCell>
                <TableCell className="text-right font-semibold">฿{branch.calculatedPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="hidden lg:table-cell">{branch.nextPayoutDate}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(branch.payoutStatus)} className="capitalize items-center">
                     {getStatusIcon(branch.payoutStatus)}
                    {branch.payoutStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/branches/partner-payouts/report/${branch.id}/current-month-mock`}>
                           <Eye className="mr-2 h-4 w-4" /> View Report
                        </Link>
                      </DropdownMenuItem>
                       {branch.payoutStatus !== "Paid" && (
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(branch.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportCSV(branch.name)}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {displayBranches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No partner or franchise branches found.</p>
            <p className="text-sm">
              Ensure branches are set up with 'Partner' or 'Franchise' types to see them here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
