"use client";

import { useState, useEffect } from "react";
import { ErrorReport } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { useReportStatus } from "@/hooks/useReportStatus";
import { ReportStatus } from "@/types";

interface ReportDialogProps {
  report: ErrorReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({
  report,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const { getReportStatus, updateReportStatus } = useReportStatus();
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>("new");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (report) {
      setCurrentStatus(getReportStatus(report.id));
    }
  }, [report, getReportStatus]);

  if (!report) return null;

  const handleStatusChange = async (status: ReportStatus) => {
    if (!report) return;

    setIsUpdating(true);
    try {
      await updateReportStatus(report.id, status);
      setCurrentStatus(status);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const sendBug = () => {
    window.open(`${process.env.NEXT_PUBLIC_BUGZILLA_URL}`, "_blank");
    handleStatusChange("bug_created");
  };

  const getStatusInfo = (status: ReportStatus): { text: string; variant: BadgeVariant } => {
    switch (status) {
      case "new":
        return { text: "New", variant: "new" };
      case "bug_created":
        return { text: "Bug Created", variant: "yellow" };
      case "bug_fixed":
        return { text: "Bug Fixed", variant: "green" };
      default:
        return { text: "Unknown", variant: "default" };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Error Report Details
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(report.reportTime).toLocaleString()}
                </div>
                {report.userId && (
                  <div>
                    <span className="font-medium">User ID:</span>{" "}
                    {report.userId}
                  </div>
                )}
                {report.version && (
                  <div>
                    <span className="font-medium">Version:</span>{" "}
                    {report.version}
                  </div>
                )}
                {report.language && (
                  <div>
                    <span className="font-medium">Language:</span>{" "}
                    {report.language}
                  </div>
                )}
                {report.url && (
                  <div>
                    <span className="font-medium">URL:</span> {report.url}
                  </div>
                )}
                {report.errorUrl && (
                  <div>
                    <span className="font-medium">Error URL:</span>{" "}
                    {report.errorUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Device Info */}
            {report.deviceInfo && (
              <div>
                <h3 className="text-lg font-medium">Device Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="font-medium">Browser:</span>{" "}
                    {report.deviceInfo.browserName}{" "}
                    {report.deviceInfo.browserFullVersion}
                  </div>
                  <div>
                    <span className="font-medium">OS:</span>{" "}
                    {report.deviceInfo.osName} {report.deviceInfo.osVersion}
                  </div>
                  <div>
                    <span className="font-medium">Engine:</span>{" "}
                    {report.deviceInfo.engineName}{" "}
                    {report.deviceInfo.engineVersion}
                  </div>
                  <div>
                    <span className="font-medium">Platform:</span>{" "}
                    {report.platform}
                  </div>
                  <div>
                    <span className="font-medium">User Agent:</span>
                    <div className="text-xs mt-1 break-all bg-gray-50 p-2 rounded">
                      {report.userAgent || report.deviceInfo.userAgent}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Details */}
          <div>
            <h3 className="text-lg font-medium">Error Details</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium">Error Message:</span>
                <div className="text-sm mt-1 bg-red-50 p-3 rounded whitespace-pre-wrap">
                  {report.errorMessage}
                </div>
              </div>

              {report.errorStack && (
                <div>
                  <span className="font-medium">Error Stack:</span>
                  <div className="text-xs mt-1 bg-red-50 p-3 rounded overflow-x-auto whitespace-pre">
                    {report.errorStack}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 mr-auto">
            <Button
              variant={currentStatus === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("new")}
              disabled={isUpdating}
            >
              Mark as New
            </Button>
            <Button
              variant={currentStatus === "bug_created" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("bug_created")}
              disabled={isUpdating}
            >
              Bug Created
            </Button>
            <Button
              variant={currentStatus === "bug_fixed" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("bug_fixed")}
              disabled={isUpdating}
            >
              Bug Fixed
            </Button>
          </div>
          <Button variant="destructive" onClick={() => sendBug()}>
            Send bug to BugZilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
