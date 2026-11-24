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

const STORAGE_PREFIX = "aiChatPage";

const storageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

/**
 * The chat page the sidebar's AI Chat section had open, its conversation,
 * and the address of the page the chat covered.
 */
export type TAiChatPageMemory = {
  page: "chat" | "history";
  threadId?: string;
  /** The path and query of the page under the chat. */
  address?: string;
};

/**
 * The fullscreen chat the user was in, kept per user for the browser tab: the
 * chat is not an address of its own - it covers the page it was opened over -
 * so a reload would otherwise land on that page (the agents list, when it was
 * opened from the sidebar). Closing the chat forgets it. Only a reload of
 * the page the chat covered brings it back: another address opened in the
 * tab shows that page (`isAiChatPageAt`). Storage may be unavailable (a
 * private window, blocked site data): then nothing is remembered and a
 * reload shows the page under the chat.
 */
export const readAiChatPage = (
  userId: string | undefined,
): TAiChatPageMemory | null => {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<TAiChatPageMemory>;
    if (saved.page !== "chat" && saved.page !== "history") return null;
    return {
      page: saved.page,
      ...(typeof saved.threadId === "string" && saved.threadId
        ? { threadId: saved.threadId }
        : {}),
      ...(typeof saved.address === "string" && saved.address
        ? { address: saved.address }
        : {}),
    };
  } catch {
    return null;
  }
};

export const writeAiChatPage = (
  userId: string | undefined,
  memory: TAiChatPageMemory | null,
) => {
  if (!userId) return;
  try {
    const key = storageKey(userId);
    if (memory) sessionStorage.setItem(key, JSON.stringify(memory));
    else sessionStorage.removeItem(key);
  } catch {
    // Nothing to remember without storage.
  }
};

/** The chat was remembered over the page at `address` (path and query). */
export const isAiChatPageAt = (
  memory: TAiChatPageMemory,
  address: string,
): boolean => memory.address === address;
