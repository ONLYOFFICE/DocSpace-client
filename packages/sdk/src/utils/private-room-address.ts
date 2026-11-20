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

import type { TFolder } from "@docspace/shared/api/files/types";
import type { FolderType } from "@docspace/shared/enums";
import { resolveFolderTarget } from "@docspace/shared/services/private-room/upload-target";

/**
 * The private page address of the room that holds the folder, keeping the
 * request's parameters without `search` and naming a subfolder in `folder`,
 * or null when the folder lies outside private rooms. Decided from the
 * room on the folder's path; rejects when the path cannot be read.
 * `loadPath` is the server request on a server page.
 */
// Spec: private-rooms/sdk-surface, "Private addresses are decided before anything is listed"
export async function getPrivateRoomAddress(
  folder: { id: number | string; rootFolderType?: FolderType | null },
  searchParams: Record<string, string>,
  loadPath?: (folderId: number) => Promise<TFolder[]>,
): Promise<string | null> {
  const target = await resolveFolderTarget(folder, loadPath);
  if (!target.isPrivate || target.encryptionRoomId === null) return null;

  const roomId = target.encryptionRoomId;
  const params = new URLSearchParams(searchParams);
  params.delete("search");
  if (String(folder.id) === String(roomId)) params.delete("folder");
  else params.set("folder", String(folder.id));
  const query = params.toString();

  return `/private/${roomId}${query ? `?${query}` : ""}`;
}
