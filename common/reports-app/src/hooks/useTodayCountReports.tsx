"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase";

export const useTodayCountReports = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reportsRef = ref(db, "reports");

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCount(0);
        return;
      }

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      let todayCount = 0;

      type FirebaseReport = {
        errorMessage: string;
        reportTime: string;
        [key: string]: unknown;
      };

      Object.values(data).forEach((report) => {
        const typedReport = report as FirebaseReport;
        if (typedReport.reportTime) {
          const reportDate = new Date(typedReport.reportTime);
          const reportDateStr = reportDate.toISOString().split("T")[0];

          if (reportDateStr === todayStr) {
            todayCount++;
          }
        }
      });

      setCount(todayCount);
    });

    return () => unsubscribe();
  }, []);

  return count;
};
