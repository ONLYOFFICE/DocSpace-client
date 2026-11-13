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

import type { AiChatContextFolder } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";

const STORAGE_PREFIX = "aiProjectFolderContext";

const storageKey = (userId: string, projectId: number | string) =>
  `${STORAGE_PREFIX}:${userId}:${projectId}`;

/**
 * The folder a project's chat last worked in, kept per user and project in
 * the browser: a project opened again starts with the same folder connected,
 * so the user does not pick it every time. Disconnecting it forgets it.
 * Storage may be unavailable (a private window, blocked site data): then
 * nothing is remembered and the chat opens without a folder.
 */
export const readProjectFolder = (
  userId: string | undefined,
  projectId: number | string,
): AiChatContextFolder | null => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(storageKey(userId, projectId));
    if (!raw) return null;
    const folder = JSON.parse(raw) as Partial<AiChatContextFolder>;
    if (typeof folder.id !== "string" || typeof folder.name !== "string") return null;
    return {
      cloud: typeof folder.cloud === "string" ? folder.cloud : "docspace",
      id: folder.id,
      name: folder.name,
      ...(typeof folder.path === "string" ? { path: folder.path } : {}),
    };
  } catch {
    return null;
  }
};

export const writeProjectFolder = (
  userId: string | undefined,
  projectId: number | string,
  folder: AiChatContextFolder | null,
) => {
  if (!userId) return;
  try {
    const key = storageKey(userId, projectId);
    if (folder) localStorage.setItem(key, JSON.stringify(folder));
    else localStorage.removeItem(key);
  } catch {
    // Nothing to remember without storage.
  }
};
