
import { getBranchById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, TableIcon, CalendarDays, Percent, BookText, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from 'next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, setDate, isAfter, addMonths } from "date-fns";

type Props = {
  params: { branchId: string; reportPeriod: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const branch = getBranchById(params.branchId);
  const periodDisplay = params.reportPeriod === 'current-month-mock' ? 'Current Month (Mock)' : params.reportPeriod;
  return {
    title: branch ? `Payout Report: ${branch.name} - ${periodDisplay}` : 'Payout Report Not Found',
  };
}

interface MockReportTransaction {
  orderId: string;
  date: string;
  clientName: string;
  serviceType: string;
  amountCollected: number;
  commissionableAmount: number;
  commissionRatePercent: number;
  calculatedCommission: number;
}

function calculateNextPayoutDate(payoutDay?: number): string {
  if (!payoutDay || payoutDay < 1 || payoutDay > 28) return "N/A";
  const today = new Date();
  let payoutDateThisMonth = setDate(today, payoutDay);
  if (isAfter(today, payoutDateThisMonth)) {
    payoutDateThisMonth = addMonths(payoutDateThisMonth, 1);
  }
  return format(payoutDateThisMonth, "MMM d, yyyy");
}


export default async function PayoutReportPage({ params }: Props) {
  const branch = getBranchById(params.branchId);
  const reportPeriod = params.reportPeriod === 'current-month-mock' ? 'Current Month (Mock)' : params.reportPeriod;

  if (!branch) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-semibold">Branch Not Found</h1>
        <p className="text-muted-foreground">The branch (ID: {params.branchId}) for this report does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/branches/partner-payouts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Summary
          </Link>
        </Button>
      </div>
    );
  }

  const branchCommissionRatePercent = branch.commissionRatePercent || 0;

  // Mock Data for detailed report
  const mockReportData: MockReportTransaction[] = [
    { orderId: "BK-001-ST", date: "2024-07-01", clientName: "Client A (Storage)", serviceType: "Storage Fee", amountCollected: 5000, commissionableAmount: 5000, commissionRatePercent: branchCommissionRatePercent, calculatedCommission: 5000 * (branchCommissionRatePercent / 100) },
    { orderId: "BK-002-DL", date: "2024-07-05", clientName: "Client B (Delivery)", serviceType: "Delivery Fee", amountCollected: 1200, commissionableAmount: 0, commissionRatePercent: 0, calculatedCommission: 0 },
    { orderId: "BK-003-ST", date: "2024-07-10", clientName: "Client C (Storage)", serviceType: "Storage Fee", amountCollected: 7500, commissionableAmount: 7500, commissionRatePercent: branchCommissionRatePercent, calculatedCommission: 7500 * (branchCommissionRatePercent / 100) },
    { orderId: "BK-004-EX", date: "2024-07-15", clientName: "Client A (Extension)", serviceType: "Extension Fee", amountCollected: 2500, commissionableAmount: 2500, commissionRatePercent: branchCommissionRatePercent, calculatedCommission: 2500 * (branchCommissionRatePercent / 100)},
    { orderId: "BK-005-PK", date: "2024-07-20", clientName: "Client D (Packaging)", serviceType: "Packaging Materials", amountCollected: 800, commissionableAmount: 800 * 0.5, commissionRatePercent: branchCommissionRatePercent, calculatedCommission: (800 * 0.5) * (branchCommissionRatePercent / 100)}, // Example: 50% of packaging is commissionable
  ];

  const totalRevenue = mockReportData.reduce((sum, item) => sum + item.amountCollected, 0);
  const totalCommissionableRevenue = mockReportData.reduce((sum, item) => sum + item.commissionableAmount, 0);
  const totalCommission = mockReportData.reduce((sum, item) => sum + item.calculatedCommission, 0);
  const nextPayoutDate = calculateNextPayoutDate(branch.payoutDayOfMonth);


  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/branches/partner-payouts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Summary
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Payout Report</h1>
            <CardDescription>Branch: {branch.name} | Period: {reportPeriod}</CardDescription>
          </div>
           <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" /> Export PDF (Placeholder)
          </Button>
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Branch Payout Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 border rounded-md bg-muted/30">
            <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
            <div>
              <p className="text-xs text-muted-foreground">Payout Day of Month</p>
              <p className="font-semibold">{branch.payoutDayOfMonth || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border rounded-md bg-muted/30">
            <Percent className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
            <div>
              <p className="text-xs text-muted-foreground">Commission Rate</p>
              <p className="font-semibold">{branch.commissionRatePercent !== undefined ? `${branch.commissionRatePercent}%` : 'N/A'}</p>
            </div>
          </div>
           <div className="flex items-start gap-3 p-3 border rounded-md bg-muted/30">
            <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
            <div>
              <p className="text-xs text-muted-foreground">Next Expected Payout</p>
              <p className="font-semibold">{nextPayoutDate}</p>
            </div>
          </div>
          {branch.commissionNotes && (
            <div className="md:col-span-2 lg:col-span-3 flex items-start gap-3 p-3 border rounded-md bg-muted/30">
              <BookText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
              <div>
                <p className="text-xs text-muted-foreground">Commission Notes</p>
                <p className="font-semibold whitespace-pre-wrap">{branch.commissionNotes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Report Summary for {reportPeriod}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Revenue Collected</p>
                <p className="text-lg font-semibold">฿{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Commissionable Revenue</p>
                <p className="text-lg font-semibold">฿{totalCommissionableRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="p-3 border rounded-md bg-primary/10 text-primary-foreground">
                <p className="text-xs text-primary/80">Total Commission Due</p>
                <p className="text-lg font-semibold text-primary">฿{totalCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TableIcon /> Detailed Transactions ({reportPeriod})</CardTitle>
        </CardHeader>
        <CardContent>
          {mockReportData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead className="text-right">Amount Collected</TableHead>
                    <TableHead className="text-right">Commissionable</TableHead>
                    <TableHead className="text-right">Rate (%)</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReportData.map(item => (
                    <TableRow key={item.orderId}>
                      <TableCell className="font-medium">{item.orderId}</TableCell>
                      <TableCell>{format(parseISO(item.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.serviceType}</TableCell>
                      <TableCell className="text-right">฿{item.amountCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      <TableCell className="text-right">฿{item.commissionableAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      <TableCell className="text-right">{item.commissionRatePercent}%</TableCell>
                      <TableCell className="text-right font-semibold text-primary">฿{item.calculatedCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-8">
                <FileText className="mx-auto h-12 w-12 mb-4 text-primary/30" />
                No detailed transactions to display for this mock report.
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    