// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import saveAs from "file-saver";
import { deviceDetect } from "react-device-detect";
import type FirebaseHelper from "./firebase";

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
    deviceInfo: deviceDetect(window.navigator.userAgent),
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
