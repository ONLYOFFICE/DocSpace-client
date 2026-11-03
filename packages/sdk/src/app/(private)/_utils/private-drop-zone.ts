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

import type { FolderType } from "@docspace/shared/enums";
import {
  isDropRefused,
  isFolderEntry,
  resolveDropTarget,
  type TDroppedEntry,
  type TUploadTarget,
} from "@docspace/shared/services/private-room/upload-target";

/** The files of a drop into a private room; folders and their files stay out. */
export const splitPrivateDrop = (dropped: File[]) => {
  const files = dropped.filter(
    (file) => !isFolderEntry(file as File & TDroppedEntry),
  );
  return { files, refusedFolders: files.length < dropped.length };
};

/**
 * Where a drop into the open folder of a private room goes: the open folder,
 * or the folder row it landed on, which the open folder holds. Null when the
 * drop is refused; rejects when the row's room cannot be resolved.
 */
export const resolvePrivateDropFolder = async (
  open: TUploadTarget,
  rowFolderId: number | string | undefined,
  rootFolderType: FolderType | undefined,
): Promise<TUploadTarget | null> => {
  if (rowFolderId === undefined || String(rowFolderId) === String(open.folderId)) {
    return open;
  }
  const target = await resolveDropTarget(open, {
    id: rowFolderId,
    isFolder: true,
    parentId: open.folderId ?? undefined,
    rootFolderType,
  });
  return isDropRefused(open, target) ? null : target;
};
