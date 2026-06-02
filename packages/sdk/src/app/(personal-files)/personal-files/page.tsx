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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import FilesFilter from "@docspace/shared/api/files/filter";
import type { TSettings } from "@docspace/shared/api/settings/types";
import { FolderType } from "@docspace/shared/enums";

import { getFilesSettings, getFolder, getFoldersTree } from "@/api/files";
import { getSettings } from "@/api/settings";
import { getSelf } from "@/api/people";
import { PAGE_COUNT } from "@/utils/constants";

import DocsPage from "./page.client";

const serializeFilter = (filter: FilesFilter) => {
  const params = new URLSearchParams();

  const entries: [string, string | number | null | undefined][] = [
    ["folder", filter.folder],
    ["page", filter.page],
    ["pageCount", filter.pageCount],
    ["sortBy", filter.sortBy],
    ["sortOrder", filter.sortOrder],
    ["filterType", filter.filterType?.toString()],
    ["search", filter.search],
    ["key", filter.key],
    ["parentId", filter.parentId as string | number | null | undefined],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

export default async function Docs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const params = await searchParams;

  const tree = await getFoldersTree();
  const byType = new Map(tree.map((f) => [f.rootFolderType, f]));
  const myFolderId = byType.get(FolderType.USER)?.id;
  const favoritesFolderId = byType.get(FolderType.Favorites)?.id;
  const recentFolderId = byType.get(FolderType.Recent)?.id;

  const folderAliasToId: Record<string, number | undefined> = {
    "@my": myFolderId,
    "@favorites": favoritesFolderId,
    "@recent": recentFolderId,
    "@share": byType.get(FolderType.SHARE)?.id,
    "@trash": byType.get(FolderType.TRASH)?.id,
  };

  const folderParam = params.folder || "@my";
  const resolvedFolderId = folderAliasToId[folderParam];

  if (resolvedFolderId) {
    const out = new URLSearchParams(params as Record<string, string>);
    out.set("folder", String(resolvedFolderId));
    const isPersonalScoped =
      resolvedFolderId === favoritesFolderId ||
      resolvedFolderId === recentFolderId;
    if (isPersonalScoped && myFolderId && !out.get("parentId")) {
      out.set("parentId", String(myFolderId));
    }
    redirect(`/personal-files?${out.toString()}`);
  }

  const filter = FilesFilter.getDefault();
  filter.folder = folderParam;
  filter.pageCount = params.pageCount ? Number(params.pageCount) : PAGE_COUNT;
  if (params.page) filter.page = Math.max(0, Number(params.page) - 1);
  if (params.sortBy) filter.sortBy = params.sortBy as typeof filter.sortBy;
  if (params.sortOrder) filter.sortOrder = params.sortOrder as typeof filter.sortOrder;
  if (params.search) filter.search = params.search;
  if (params.parentId) filter.parentId = params.parentId;

  const filesFilter = serializeFilter(filter);

  let filesSettings;
  let folderData;
  let portalSettings;
  let user;

  try {
    [filesSettings, folderData, portalSettings, user] = await Promise.all([
      getFilesSettings(),
      getFolder(filter.folder, filter),
      getSettings(),
      getSelf(),
    ]);
  } catch (error) {
    throw new Error(
      `Failed to load docs page data: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!filesSettings || !portalSettings) {
    throw new Error("Failed to load required settings");
  }

  return (
    <DocsPage
      authToken={authToken}
      filesSettings={filesSettings}
      folderData={folderData}
      portalSettings={portalSettings as TSettings}
      filesFilter={filesFilter}
      user={user}
    />
  );
}
