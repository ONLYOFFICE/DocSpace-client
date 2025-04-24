export type DeviceInfo = {
  browserFullVersion: string;
  browserMajorVersion: string;
  browserName: string;
  engineName: string;
  engineVersion: string;
  isBrowser: boolean;
  osName: string;
  osVersion: string;
  userAgent: string;
};

export type ErrorReport = {
  id: string;
  description?: string;
  deviceInfo?: DeviceInfo;
  errorMessage: string;
  errorStack?: string;
  errorUrl?: string;
  language?: string;
  localStorage?: string;
  platform?: string;
  reportTime: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  version?: string;
};

export type RawReportData = {
  description?: string;
  deviceInfo?: DeviceInfo;
  errorMessage: string;
  errorStack?: string;
  errorUrl?: string;
  language?: string;
  localStorage?: string;
  platform?: string;
  reportTime: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  version?: string;
};

export type ChartData = {
  date: string;
  count: number;
};

export type ReportStatus = "new" | "bug_created" | "bug_fixed";

export interface ReportDetail {
  id: string;
  status: ReportStatus;
  updatedAt: string;
}
