"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestReport() {
  const [reportHtml, setReportHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.API_URL}/tests/report`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch test report: ${response.status} ${response.statusText}`);
        }
        
        const htmlContent = await response.text();
        setReportHtml(htmlContent);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the test report");
        console.error("Error fetching test report:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-8"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 17l-5-5m0 0l5-5m-5 5h12" 
            />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Translation Test Report
        </h1>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Loading test report...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
          <div className="mt-4">
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-800 underline"
            >
              Return to home page
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div
            className="report-container"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </div>
      )}
    </div>
  );
}
