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

// Lives in _utils/ (pure, type-only dependency) so it can be unit-tested
// without pulling the encrypted copy/move hook's React + store import chain.

export type EncryptedCopyDest =
  | { allowed: true; roomId: number | string }
  | { allowed: false; reason: "not-private" | "unresolved-room" };

/**
 * Decides whether an encrypted file may be copied/moved into a destination
 * folder, and which room owns that destination.
 *
 * This is a security gate: an encrypted file may only ever flow into a
 * resolvable *private* room. Copying it into a non-private (or
 * unidentifiable) destination would re-upload it somewhere its E2EE contract
 * no longer holds — i.e. leak plaintext into a room the recipients can read
 * unencrypted. The resolved `roomId` is what the file's DEK is re-wrapped for,
 * so resolving the wrong room would hand access to the wrong member set.
 */
export const resolveEncryptedCopyDest = (
  folderData: TGetFolder,
): EncryptedCopyDest => {
  const current = folderData.current;
  const isPrivate = current?.private === true;

  // When the destination folder is itself a room it carries `roomType`; a
  // subfolder does not, so the owning room is the second path segment
  // (pathParts[0] is the rooms container, pathParts[1] is the room).
  const roomId =
    current?.roomType !== undefined
      ? current.id
      : (folderData.pathParts?.[1]?.id ?? null);

  if (!isPrivate) return { allowed: false, reason: "not-private" };
  if (roomId === null) return { allowed: false, reason: "unresolved-room" };
  return { allowed: true, roomId };
};
