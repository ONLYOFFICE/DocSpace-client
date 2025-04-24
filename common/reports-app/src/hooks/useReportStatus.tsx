"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/firebase";

export type ReportStatus = "new" | "bug_created" | "bug_fixed";

export interface ReportDetail {
  id: string;
  status: ReportStatus;
  updatedAt: string;
}

export const useReportStatus = () => {
  const [reportStatuses, setReportStatuses] = useState<
    Record<string, ReportDetail>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detailsRef = ref(db, "details");

    const unsubscribe = onValue(detailsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setReportStatuses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getReportStatus = (reportId: string): ReportStatus => {
    return reportStatuses[reportId]?.status || "new";
  };

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    try {
      const detailRef = ref(db, `details/${reportId}`);
      const now = new Date().toISOString();
      const detail: ReportDetail = {
        id: reportId,
        status,
        updatedAt: now,
      };

      await set(detailRef, detail);

      setReportStatuses((prev) => ({
        ...prev,
        [reportId]: detail,
      }));
      return true;
    } catch (error) {
      console.error("Error updating report status:", error);
      return false;
    }
  };

  return {
    reportStatuses,
    loading,
    getReportStatus,
    updateReportStatus,
  };
};
