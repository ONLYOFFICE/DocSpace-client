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

import type { TGetFolder } from "@docspace/shared/api/files/types";

import { getFolderInfo } from "@/api/files";

/**
 * The private page of the room that holds the open folder, keeping the
 * request's parameters and the open subfolder, or null when that room is not
 * private. The room is the entry of the folder's path that has a room type.
 * Spec: private-rooms/sdk-surface, "Private rooms only through the private pages"
 */
export async function getPrivateRoomAddress(
  folderData: TGetFolder,
  searchParams: Record<string, string>,
): Promise<string | null> {
  const { current, pathParts } = folderData;

  let roomId: number | string | undefined;
  let isPrivate = false;
  if (current?.roomType !== undefined && current?.roomType !== null) {
    roomId = current.id;
    isPrivate = current.private === true;
  } else {
    roomId = pathParts?.find((part) => !!part.roomType)?.id;
    if (roomId === undefined) return null;
    isPrivate = (await getFolderInfo(roomId))?.private === true;
  }
  if (!isPrivate) return null;

  const params = new URLSearchParams(searchParams);
  if (String(current.id) === String(roomId)) params.delete("folder");
  else params.set("folder", String(current.id));
  const query = params.toString();

  return `/private/${roomId}${query ? `?${query}` : ""}`;
}
