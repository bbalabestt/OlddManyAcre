
"use client";

import type { PlatformActivity, PlatformActivityType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CalendarClock, Users, Building2, Receipt, PackagePlus, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';

interface RecentActivityTableProps {
  activities: PlatformActivity[];
}

const getTypeIcon = (type: PlatformActivityType) => {
  switch (type) {
    case "Booking": return <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />;
    case "Client": return <Users className="h-4 w-4 mr-2 text-muted-foreground" />;
    case "Branch": return <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />;
    case "Transaction": return <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />;
    case "Allocation": return <PackagePlus className="h-4 w-4 mr-2 text-muted-foreground" />;
    default: return <Info className="h-4 w-4 mr-2 text-muted-foreground" />;
  }
};

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardContent className="p-0 pt-2 text-sm text-muted-foreground">
            Showing the latest changes and events within the platform.
        </CardContent>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[150px]">Type</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium text-xs">
                  {format(parseISO(activity.timestamp), "MMM d, yyyy, HH:mm:ss")}
                </TableCell>
                <TableCell className="flex items-center">
                  {getTypeIcon(activity.type)}
                  {activity.type}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{activity.action.toLowerCase()}</Badge>
                </TableCell>
                <TableCell>
                  {activity.description}
                  {activity.entityName && <span className="text-muted-foreground text-xs block">Entity: {activity.entityName}</span>}
                </TableCell>
                <TableCell className="text-right">
                  {activity.detailsLink ? (
                    <Button variant="link" size="sm" asChild>
                      <Link href={activity.detailsLink}>
                        View <Eye className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {activities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No platform activity recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
