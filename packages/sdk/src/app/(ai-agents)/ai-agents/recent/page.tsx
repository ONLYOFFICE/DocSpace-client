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

import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";

import { getFilesSettings, getFolder } from "@/api/files";
import { getSettings } from "@/api/settings";
import { PAGE_COUNT } from "@/utils/constants";

import RecentPage from "./page.client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

const serializeFilter = (filter: FilesFilter) => {
  const params = new URLSearchParams();
  const entries: [string, string | number | null | undefined][] = [
    ["folder", filter.folder],
    ["page", filter.page],
    ["pageCount", filter.pageCount],
    ["sortBy", filter.sortBy],
    ["sortOrder", filter.sortOrder],
    ["filterType", filter.filterType?.toString()],
    ["authorType", filter.authorType],
    ["search", filter.search],
  ];
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  return params.toString();
};

// Mirrors client personal-files Recent: fetches /api/2.0/files/@recent via
// the server-resolved alias. Hands the payload straight to the docspace
// `List` body (wrapped in our `AliasFilesList` shell) — same row / tile /
// table renderers and the same EmptyView used by personal-files.
export default async function AgentsRecent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const filter = FilesFilter.getDefault({ categoryType: CategoryType.Recent });
  filter.pageCount = PAGE_COUNT;
  if (sp.search) filter.search = sp.search;
  if (sp.sortBy) filter.sortBy = sp.sortBy as typeof filter.sortBy;
  if (sp.sortOrder)
    filter.sortOrder = sp.sortOrder as typeof filter.sortOrder;
  if (sp.filterType)
    filter.filterType = Number(sp.filterType) as typeof filter.filterType;
  if (sp.authorType) filter.authorType = sp.authorType;

  // Best-effort SSR — any single fetch failing (timeout, 401, etc.)
  // shouldn't crash the route. The client falls back to a loader placeholder
  // and the user can refresh once the portal is responsive again.
  const [filesSettings, folderData, portalSettings] = await Promise.all([
    getFilesSettings().catch(() => undefined),
    getFolder(filter.folder, filter).catch(() => undefined),
    getSettings().catch(() => undefined),
  ]);

  return (
    <RecentPage
      folders={folderData?.folders ?? []}
      files={folderData?.files ?? []}
      current={folderData?.current ?? null}
      total={folderData?.total ?? 0}
      filesSettings={filesSettings ?? null}
      portalSettings={
        portalSettings && typeof portalSettings !== "string"
          ? portalSettings
          : null
      }
      filesFilter={serializeFilter(filter)}
    />
  );
}
