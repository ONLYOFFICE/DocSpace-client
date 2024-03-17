import saveAs from "file-saver";
import { deviceDetect } from "react-device-detect";
import type FirebaseHelper from "@docspace/shared/utils/firebase";

export const getCrashReport = (
  userId: string,
  version: string,
  language?: string,
  error?: Error,
) => {
  const currentTime = new Date();
  const reportTime = currentTime.toUTCString();
  const lsObject = JSON.stringify(window.localStorage) || "";

  const report = {
    url: window.origin,
    userId,
    version,
    platform: navigator?.platform,
    userAgent: navigator?.userAgent,
    language: language || "en",
    errorMessage: error?.message,
    errorStack: error?.stack,
    localStorage: lsObject,
    reportTime,
    deviceInfo: deviceDetect(),
    errorUrl: window.location.href,
  };

  return report;
};

export const sendToastReport = async (
  id: string,
  version: string,
  cultureName: string,
  message: string,
  firebaseHelper: FirebaseHelper,
) => {
  const error = new Error(message);
  const report = getCrashReport(id, version, cultureName, error);
  const reportWithDescription = Object.assign(report, {
    description: "TOAST REPORT",
  });
  await firebaseHelper.sendToastReport(reportWithDescription);
};

export const downloadJson = <T>(json: T, fileName: string) => {
  const cleanJson = JSON.stringify(json);
  const data = new Blob([cleanJson], { type: "application/json" });
  const url = window.URL.createObjectURL(data);
  saveAs(url, `${fileName}.json`);
};

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${day}.${month}.${year}`;
};
