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

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (ms: number): number => {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const isDocsConnectPaid = (info: TDocsConnectInfo): boolean =>
  info.tenantInfo.license.trial === false;

export const isDocsConnectCanceled = (info: TDocsConnectInfo): boolean =>
  isDocsConnectPaid(info) &&
  !info.deactivated &&
  info.scheduledChange == null &&
  (info.tenant.payment?.quantity ?? 0) === 0;

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const signDocsConnectToken = async (
  payload: object,
  secret: string,
): Promise<string> => {
  const encoder = new TextEncoder();
  const header = base64UrlEncode(
    encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${body}`),
  );
  return `${header}.${body}.${base64UrlEncode(new Uint8Array(signature))}`;
};

export const formatDocsConnectDate = (iso?: string): string => {
  if (!iso) return "";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const date = new Date(ms);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
};

export const getDocsConnectDaysLeft = (endDate: string): number => {
  const target = new Date(endDate).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(
    0,
    Math.round((startOfDay(target) - startOfDay(Date.now())) / DAY_MS),
  );
};

export const isDocsConnectTrialExpired = (endDate: string): boolean => {
  const target = new Date(endDate).getTime();
  return !Number.isNaN(target) && target < Date.now();
};

export const getDocsConnectTrialPercent = (
  startDate: string,
  endDate: string,
): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const elapsed = ((Date.now() - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, elapsed));
};

export type TDocsConnectTrialState = {
  isPaid: boolean;
  isTrial: boolean;
  startDate: string;
  endDate: string;
  daysLeft: number;
  totalDays: number;
  expired: boolean;
  percent: number;
};

export const getDocsConnectTrialState = (
  info: TDocsConnectInfo | null,
): TDocsConnectTrialState => {
  const startDate = info?.tenant.modifiedDate ?? "";
  const endDate = info?.tenant.endDate ?? "";
  const isPaid = info ? isDocsConnectPaid(info) : false;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const totalDays =
    Number.isNaN(start) || Number.isNaN(end) || end <= start
      ? 0
      : Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS);

  return {
    isPaid,
    isTrial: !isPaid,
    startDate,
    endDate,
    daysLeft: getDocsConnectDaysLeft(endDate),
    totalDays,
    expired: isDocsConnectTrialExpired(endDate),
    percent: getDocsConnectTrialPercent(startDate, endDate),
  };
};
