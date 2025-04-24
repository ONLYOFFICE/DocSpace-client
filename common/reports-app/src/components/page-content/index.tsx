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

export const PageContent = ({ path }: { path: "reports" | "toasts" }) => {
  const { reports, loading } = useReports(path);
  const { data: lastWeekReports } = useReportsByDate(path, 7);
  const todayReports = useTodayCountReports(path);

  return (
    <div className="p-6 space-y-4">
      <div className="w-full flex flex-col gap-4 md:flex-row">
        <DataArea chartData={lastWeekReports} />
        <div className="flex flex-row gap-4 md:flex-col">
          <Card className="w-full h-full md:w-64">
            <CardHeader className="relative">
              <CardDescription>Total reports</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {reports.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="w-full h-full md:w-64">
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
};
