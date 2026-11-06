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

import { getServiceLimitChatError } from "./getServiceLimitChatError";

/** The DocSpace AI gateway: its 402 is the portal wallet running dry. */
const GATEWAY_PROVIDER = "onlyoffice";

/**
 * What keeps the chat from working right now:
 * - `wallet` - the portal wallet ran out mid-answer;
 * - `limit` - the AI spending limit was reached (`until` is when it resets,
 *   null for a lifetime limit);
 * - `provider` - a provider with its own key ran out of credits, which the
 *   portal cannot see being topped up.
 */
export type TAiChatBlock =
  | { kind: "wallet" }
  | { kind: "limit"; until: string | null }
  | { kind: "provider" };

export type TAiChatStreamError = {
  error: { code?: string; message?: string };
  providerType?: string;
};

/**
 * Which money state an errored round reports, or null when the error is
 * not about money (it then only leaves its note in the history).
 */
export const getAiChatBlock = (
  { error, providerType }: TAiChatStreamError,
  standalone: boolean,
): TAiChatBlock | null => {
  // Standalone pays its providers directly: no wallet and no spending
  // limits, only a provider of its own running out.
  if (!standalone) {
    const serviceLimit = getServiceLimitChatError(error);
    if (serviceLimit) return { kind: "limit", until: serviceLimit.until };
  }

  if (error.code !== "insufficient_funds") return null;

  return !standalone && providerType === GATEWAY_PROVIDER
    ? { kind: "wallet" }
    : { kind: "provider" };
};
