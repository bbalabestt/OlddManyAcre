
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Archive, PieChart } from "lucide-react"; 
import { getBranches, getClients, getThisMonthIncome } from "@/lib/db";
import { parseCapacityToNumber } from "@/lib/utils";
import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingCalendar } from "./components/booking-calendar"; 

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const [branches, clients, thisMonthIncome] = await Promise.all([
    getBranches(),
    getClients(),
    getThisMonthIncome(),
  ]);
  const totalClients = clients.length;

  let sumTotalOccupiedCapacity = 0;
  let sumTotalCapacity = 0;
  let sumRemainingBulkCapacity = 0;

  branches.forEach(branch => {
    sumTotalOccupiedCapacity += parseCapacityToNumber(branch.occupiedCapacity);
    sumTotalCapacity += parseCapacityToNumber(branch.totalCapacity);
    sumRemainingBulkCapacity += parseCapacityToNumber(branch.remainingBulkCapacity);
  });

  const overallUtilization = sumTotalCapacity > 0 ? (sumTotalOccupiedCapacity / sumTotalCapacity) * 100 : 0;

  const stats = [
    { title: "This Month's Income", value: `฿${thisMonthIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, description: "Completed transactions this month", link: "/transactions"},
    { title: "Total Clients", value: totalClients, icon: Users, description: "Manage customer information", link: "/clients" },
    { 
      title: "Total Used / Total Capacity", 
      value: `${sumTotalOccupiedCapacity.toLocaleString()} / ${sumTotalCapacity.toLocaleString()} sq m`, 
      icon: Archive, 
      description: `${sumRemainingBulkCapacity.toLocaleString()} sq m currently available`, 
      link: "/branches" 
    },
    { 
      title: "Overall Capacity Utilization", 
      value: `${overallUtilization.toFixed(1)}%`, 
      icon: PieChart, 
      description: "Percentage of total capacity used", 
      link: "/branches" 
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Adjusted for 4 main stats */}
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
              {stat.link && (
                <Button variant="link" asChild className="px-0 pt-2 text-primary">
                  <Link href={stat.link}>View Details &rarr;</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Calendar now takes full width in its section */}
      <div className="grid grid-cols-1 gap-6">
        <BookingCalendar />
      </div>
    </div>
  );
}
