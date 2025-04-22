"use client";

import React, { useEffect } from "react";
import KeyUsageSearch from "@/components/KeyUsageSearch";
import { useKeyUsageStore } from "@/store/keyUsageStore";

export default function KeyUsagePage() {
  const { loadStats, loadModules } = useKeyUsageStore();

  // Load key usage data when the page loads
  useEffect(() => {
    loadStats();
    loadModules();
  }, [loadStats, loadModules]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Translation Key Usage Explorer
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Explore how translation keys are used across your application. Find usage locations, 
        see which modules use which keys, and get insights about your internationalization.
      </p>
      
      <KeyUsageSearch />
    </div>
  );
}
