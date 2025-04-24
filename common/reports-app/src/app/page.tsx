"use client";

import { DataTable } from "@/components/data-table";
import { DataArea } from "@/components/data-area";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useReports } from "@/hooks/useReports";
import { useReportsByDate } from "@/hooks/useReportsByDate";
import { useTodayCountReports } from "@/hooks/useTodayCountReports";

export default function Home() {
  const { reports, loading } = useReports();
  const { data: lastWeekReports } = useReportsByDate(7);
  const todayReports = useTodayCountReports();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Reports analyzer</h2>
      <div className="w-full flex gap-4">
        <DataArea chartData={lastWeekReports} />
        <div className="flex flex-col gap-4">
          <Card className="w-64 h-full">
            <CardHeader className="relative">
              <CardDescription>Total reports</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {reports.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="w-64 h-full">
            <CardHeader className="relative">
              <CardDescription>Today reports</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {todayReports}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
      {loading ? <div>Loading...</div> : <DataTable reports={reports} />}
    </div>
  );
}
