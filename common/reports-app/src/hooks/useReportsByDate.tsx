import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase";
import { ErrorReport, RawReportData, ChartData } from "@/types";

type ReportsByDateResult = {
  data: ChartData[];
  loading: boolean;
};

export const useReportsByDate = (type: "reports" | "toasts", days: number = 7): ReportsByDateResult => {
  const [result, setResult] = useState<ReportsByDateResult>({
    data: [],
    loading: true,
  });

  useEffect(() => {
    const reportsRef = ref(db, type);

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setResult({ data: [], loading: false });
        return;
      }

      const reports: ErrorReport[] = Object.entries(data).map(
        ([id, value]) => ({
          id,
          errorMessage: (value as RawReportData).errorMessage,
          reportTime: (value as RawReportData).reportTime,
        })
      );

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - days + 1);

      const dateMap = new Map<string, number>();

      for (
        let d = new Date(startDate);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        dateMap.set(dateStr, 0);
      }

      reports.forEach((report) => {
        const reportDate = new Date(report.reportTime);
        if (reportDate >= startDate) {
          const dateStr = reportDate.toISOString().split("T")[0];
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        }
      });

      const reportsByDate = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setResult({
        data: reportsByDate,
        loading: false,
      });
    });

    return () => unsubscribe();
  }, [days, type]);

  return result;
};
