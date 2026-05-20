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

const QUOTA_MESSAGE_PATTERNS = [
  "tenantquotaexception",
  "tenantquotaexceededexception",
  "roomquotaexception",
  "quota exceeded",
  "quota exhausted",
  "storage quota",
  "tenant quota",
  "room space quota",
  "insufficient storage",
  "not enough space",
  "out of space",
  "out of storage",
];

const QUOTA_ERROR_TYPES = new Set([
  "tenantquotaexception",
  "tenantquotaexceededexception",
  "roomquotaexception",
  "quotaexception",
]);

const extractMessage = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error !== "object") return "";

  const candidate = error as {
    message?: unknown;
    statusText?: unknown;
    response?: { data?: { error?: { message?: unknown } } };
  };

  const parts = [
    candidate.response?.data?.error?.message,
    candidate.statusText,
    candidate.message,
  ];

  return parts.filter((part) => typeof part === "string").join(" ");
};

const extractStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    response?: { status?: unknown };
    status?: unknown;
    statusCode?: unknown;
  };
  const raw = candidate.response?.status ?? candidate.status ?? candidate.statusCode;
  return typeof raw === "number" ? raw : undefined;
};

const extractType = (error: unknown): string => {
  if (!error || typeof error !== "object") return "";
  const candidate = error as {
    type?: unknown;
    response?: { data?: { error?: { type?: unknown } } };
  };
  const raw = candidate.response?.data?.error?.type ?? candidate.type;
  return typeof raw === "string" ? raw.toLowerCase() : "";
};

export const isQuotaError = (error: unknown): boolean => {
  if (!error) return false;

  const status = extractStatus(error);
  if (status === 507) return true;

  const type = extractType(error);
  if (type && QUOTA_ERROR_TYPES.has(type)) return true;

  const message = extractMessage(error).toLowerCase();
  if (!message) return false;

  return QUOTA_MESSAGE_PATTERNS.some((pattern) => message.includes(pattern));
};

export interface UploadQueueItem {
  toFolderId?: string | number | null;
  action?: string;
  error?: unknown;
  cancel?: boolean;
}

export const countActiveUploadsForRoom = (
  files: ReadonlyArray<UploadQueueItem>,
  roomId: string | number | null | undefined,
): number => {
  if (roomId === null || roomId === undefined) return 0;
  const target = String(roomId);
  return files.reduce((acc, file) => {
    if (String(file.toFolderId ?? "") !== target) return acc;
    if (file.cancel) return acc;
    if (file.error) return acc;
    const action = file.action;
    if (
      action === "uploaded" ||
      action === "convert" ||
      action === "converted"
    )
      return acc;
    return acc + 1;
  }, 0);
};
