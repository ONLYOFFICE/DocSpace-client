"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase";
import type { ErrorReport, RawReportData } from "@/types";

export const useReports = () => {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = ref(db, "reports");
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, RawReportData> | null;
      const parsed: ErrorReport[] = data
        ? Object.entries(data).map(([id, value]) => ({
            id,
            description: value.description,
            deviceInfo: value.deviceInfo,
            errorMessage: value.errorMessage,
            errorStack: value.errorStack,
            errorUrl: value.errorUrl,
            language: value.language,
            localStorage: value.localStorage,
            platform: value.platform,
            reportTime: value.reportTime,
            url: value.url,
            userAgent: value.userAgent,
            userId: value.userId,
            version: value.version,
          }))
        : [];

      const sortedReports = [...parsed].sort((a, b) => {
        return (
          new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime()
        );
      });

      setReports(sortedReports);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { reports, loading };
};
