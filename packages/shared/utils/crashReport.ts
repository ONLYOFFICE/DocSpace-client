import saveAs from "file-saver";

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
  };

  return report;
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
