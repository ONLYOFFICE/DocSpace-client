/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
