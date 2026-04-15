
import { RecentActivityTable } from "./components/recent-activity-table";
import { getPlatformActivities } from "@/lib/data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recent Platform Activity',
};

export default async function RecentActivityPage() {
  const activities = getPlatformActivities(); 

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Recent Platform Activity</h1>
        {/* Add any top-level actions here if needed, e.g., filters */}
      </div>
      <RecentActivityTable activities={activities} />
    </div>
  );
}
