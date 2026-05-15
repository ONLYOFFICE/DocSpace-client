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

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import type { TGetFolder } from "@docspace/shared/api/files/types";
import {
  checkFilterInstance,
  decodeDisplayName,
} from "@docspace/shared/utils/common";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FolderType } from "@docspace/shared/enums";

import { logger } from "@/../logger.mjs";

export async function getFormsFolder(
  folderId: string | number,
  filter: FilesFilter,
): Promise<TGetFolder> {
  logger.debug(`Start GET forms folder /files/${folderId}`);

  try {
    let encodedFolderId = folderId;

    if (encodedFolderId && typeof encodedFolderId === "string") {
      encodedFolderId = encodeURIComponent(
        encodedFolderId.replace(/\\\\/g, "\\"),
      );
    }

    let params: string | number = encodedFolderId;

    if (filter) {
      checkFilterInstance(filter, FilesFilter);
      params = `${encodedFolderId}?${filter.toApiUrlParams()}`;
    }

    const [req] = await createRequest([`/files/${params}`], [], "GET");

    const res = await fetch(req, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.error(`GET /files/${params} failed: ${res.status}`);
      throw new Error("Failed to get forms folder");
    }

    const resJson = await res.json();
    const folder = resJson.response as TGetFolder;

    folder.files = decodeDisplayName(folder.files);
    folder.folders = decodeDisplayName(folder.folders);

    folder.current.isArchive =
      !!folder.current.roomType &&
      folder.current.rootFolderType === FolderType.Archive;

    return folder;
  } catch (error) {
    logger.error(`Error in getFormsFolder: ${error}`);
    throw error;
  }
}

