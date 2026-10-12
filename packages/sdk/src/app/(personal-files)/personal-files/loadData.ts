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
import { FolderType } from "@docspace/shared/enums";
import type {
  TFilesSettings,
  TFolder,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { PAGE_COUNT } from "@/utils/constants";

export type PersonalFilesData = {
  filesSettings: TFilesSettings;
  folderData: TGetFolder;
  portalSettings: TSettings;
  filesFilter: string;
  user?: TUser;
};

export type PersonalFilesResult =
  | { redirectTo: string }
  | { data: PersonalFilesData };

export type PersonalFilesDeps = {
  getFoldersTree: () => Promise<TFolder[]>;
  getFolder: (
    folderId: string | number,
    filter: FilesFilter,
  ) => Promise<TGetFolder>;
  getFilesSettings: () => Promise<TFilesSettings | undefined>;
  getSettings: () => Promise<TSettings | string | undefined>;
  getSelf: () => Promise<TUser | undefined>;
};

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

export async function loadPersonalFilesData(
  deps: PersonalFilesDeps,
  params: Record<string, string>,
  options: { canonicalize?: boolean } = {},
): Promise<PersonalFilesResult | null> {
  const { canonicalize = true } = options;

  const tree = await deps.getFoldersTree();
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

  let effectiveFolder: string | number = folderParam;
  let effectiveParentId = params.parentId;

  if (resolvedFolderId) {
    const isPersonalScoped =
      resolvedFolderId === favoritesFolderId ||
      resolvedFolderId === recentFolderId;

    if (canonicalize) {
      const out = new URLSearchParams(params as Record<string, string>);
      out.set("folder", String(resolvedFolderId));
      if (isPersonalScoped && myFolderId && !out.get("parentId")) {
        out.set("parentId", String(myFolderId));
      }
      return { redirectTo: `/personal-files?${out.toString()}` };
    }

    // Client (OAuth): resolve inline, fetch directly.
    effectiveFolder = resolvedFolderId;
    if (isPersonalScoped && myFolderId && !effectiveParentId) {
      effectiveParentId = String(myFolderId);
    }
  }

  const filter = FilesFilter.getDefault();
  filter.folder = effectiveFolder as typeof filter.folder;
  filter.pageCount = params.pageCount ? Number(params.pageCount) : PAGE_COUNT;
  if (params.page) filter.page = Math.max(0, Number(params.page) - 1);
  if (params.sortBy) filter.sortBy = params.sortBy as typeof filter.sortBy;
  if (params.sortOrder)
    filter.sortOrder = params.sortOrder as typeof filter.sortOrder;
  if (params.search) filter.search = params.search;
  if (effectiveParentId) filter.parentId = effectiveParentId;

  const filesFilter = serializeFilter(filter);

  const [filesSettings, folderData, portalSettings, user] = await Promise.all([
    deps.getFilesSettings(),
    deps.getFolder(filter.folder, filter),
    deps.getSettings(),
    deps.getSelf(),
  ]);

  if (!filesSettings || !portalSettings) return null;

  return {
    data: {
      filesSettings,
      folderData,
      portalSettings: portalSettings as TSettings,
      filesFilter,
      user,
    },
  };
}
