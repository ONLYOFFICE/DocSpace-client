// (c) Copyright Ascensio System SIA 2009-2026
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

/**
 * Recognises a server-side quota / out-of-storage error in an upload flow.
 *
 * DocSpace BE can signal storage exhaustion via several channels: HTTP 507
 * (Insufficient Storage), a typed payload (`TenantQuotaException`), or a
 * plain message. We match all three so callers don't have to repeat the
 * sniffing logic.
 */
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
