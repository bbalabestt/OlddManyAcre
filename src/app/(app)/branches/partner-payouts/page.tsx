
import { Button } from "@/components/ui/button";
import { mockBranches } from "@/lib/data";
import type { Metadata } from 'next';
import Link from "next/link";
import { PayoutTable } from "./components/payout-table";
import { FileSpreadsheet, Building2, CircleEllipsis, CheckCircle, DollarSign } from "lucide-react"; // Added icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components

export const metadata: Metadata = {
  title: 'Partner Payouts',
};

const mockPayoutStatuses = ["Pending", "Paid", "Processing", "Issue"] as const;

export default async function PartnerPayoutsPage() {
  const allBranches = mockBranches;
  const partnerFranchiseBranches = allBranches.filter(
    branch => branch.branchType === 'Partner' || branch.branchType === 'Franchise'
  );

  let pendingPayouts = 0;
  let paidPayouts = 0;
  let mockTotalPayoutAmount = 0;

  partnerFranchiseBranches.forEach((branch, index) => {
    const status = mockPayoutStatuses[index % mockPayoutStatuses.length]; // Simulate status as in PayoutTable
    if (status === 'Pending') pendingPayouts++;
    if (status === 'Paid') paidPayouts++;
    
    // Simulate some revenue and payout for mock total
    const mockRevenue = Math.floor(Math.random() * (500000 - 50000 + 1)) + 50000;
    const commissionRate = (branch.commissionRatePercent || 0) / 100;
    const calculatedPayout = mockRevenue * commissionRate;
    if (status === 'Paid' || status === 'Pending' || status === 'Processing') { // Sum up potential/actual payouts
        mockTotalPayoutAmount += calculatedPayout;
    }
  });

  const stats = [
    { title: "Total Partners/Franchises", value: partnerFranchiseBranches.length, icon: Building2, description: "Branches eligible for payouts" },
    { title: "Pending Payouts (Mock)", value: pendingPayouts, icon: CircleEllipsis, description: "Payouts awaiting processing" },
    { title: "Paid Payouts (Mock)", value: paidPayouts, icon: CheckCircle, description: "Successfully processed payouts" },
    { title: "Est. Payout Value (Mock)", value: `฿${mockTotalPayoutAmount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, icon: DollarSign, description: "Total value of pending/paid payouts" },
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Partner & Franchise Payouts</h1>
        <Button variant="outline" disabled> 
          <FileSpreadsheet className="mr-2 h-5 w-5" /> Export All (Placeholder)
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

      <PayoutTable branches={partnerFranchiseBranches} />
    </div>
  );
}
