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

import { headers } from "next/headers";

import FilesFilter from "@docspace/shared/api/files/filter";
import { TSettings } from "@docspace/shared/api/settings/types";

import { getFilesSettings, getFolder } from "@/api/files";
import { getSettings } from "@/api/settings";
import { PAGE_COUNT, PATHNAME_HEADER } from "@/utils/constants";

import PublicRoomPage from "./page.client";

export default async function PublicRoom({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const hdrs = await headers();
  const params = await searchParams;
  const baseConfig = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [
      k,
      v === "true" ? true : v === "false" ? false : v,
    ]),
  );
  const pathname = hdrs.get(PATHNAME_HEADER) ?? "";

  const filterStr = new URLSearchParams(params).toString();
  const folderId = baseConfig.folder;

  const filter = FilesFilter.getFilter({
    search: `?${filterStr}`,
    pathname,
  } as Location)!;

  filter.pageCount = PAGE_COUNT;

  const [folderList, filesSettings, portalSettings] = await Promise.all([
    getFolder(folderId as string, filter),
    getFilesSettings(),
    getSettings(),
  ]);

  return (
    <PublicRoomPage
      folderList={folderList}
      filesSettings={filesSettings!}
      portalSettings={portalSettings! as TSettings}
      filesFilter={filterStr}
      shareKey={baseConfig.key as string}
      // baseConfig={{
      //   showFilter: baseConfig.showFilter as boolean,
      //   showHeader: baseConfig.showHeader as boolean,
      //   folder: baseConfig.id as string,
      // }}
    />
  );
}
