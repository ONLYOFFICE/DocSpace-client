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

type TChatErrorPayload = { code?: string; message?: string } | null | undefined;

export type TServiceLimitChatError = {
  /** ISO instant the limit resets at; null for a lifetime limit. */
  until: string | null;
};

// The AI gateway answers a spending limit with 402 and the OpenAI-style body
// { error: { code: "service_limit_exceeded", type: "payment_error",
// message: "Service limit exceeded" } }; ai-chat folds every 402 into code
// "insufficient_funds" (the same as an empty wallet), so the text is the only
// signal left. Older gateways relayed the accounting service's 403 "Service
// limit exceeded for customer No.X. Service group 'ai-services', amount limit
// 1.0, available 0.02 until 2026-10-23 23:59:59Z" (or cut to "403 Service
// limit exceeded"), which ai-chat folds into code "auth". Only that long form
// carries a reset date; a lifetime limit has no "until" part either.
const SERVICE_LIMIT_CODES = new Set([
  "auth",
  "insufficient_funds",
  "service_limit_exceeded",
]);

export const getServiceLimitChatError = (
  payload: TChatErrorPayload,
): TServiceLimitChatError | null => {
  if (!payload?.code || !SERVICE_LIMIT_CODES.has(payload.code)) return null;

  const message = payload.message ?? "";
  if (!/service limit exceeded/i.test(message)) return null;
  // The gateway may shorten the text to "403 Service limit exceeded"; only a
  // message that names another service group is someone else's limit.
  const group = message.match(/service group '([^']*)'/i);
  if (group && group[1].toLowerCase() !== "ai-services") return null;

  const until = message.match(
    /\buntil (\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})Z\b/,
  );

  return { until: until ? `${until[1]}T${until[2]}Z` : null };
};
