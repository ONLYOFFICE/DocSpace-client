// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";

import { getFilesSettings, getFolder } from "@/api/files";
import { getSettings } from "@/api/settings";
import { PAGE_COUNT } from "@/utils/constants";

import TrashPage from "./page.client";

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

// Mirrors client personal-files Trash: fetches /api/2.0/files/@trash. Same
// SSR/hydration shape as recent/favorites — the only differences are the
// alias, CategoryType, and the trash-specific context menu (Restore /
// Delete forever) which `useItemList` opts into via `isTrashSection: true`
// once rootFolderType arrives on `current`.
export default async function AgentsTrash({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const filter = FilesFilter.getDefault({ categoryType: CategoryType.Trash });
  // FilesFilter.getDefault has no Trash case — pin the alias explicitly so
  // the SSR fetch doesn't fall back to `@my`.
  filter.folder = "@trash";
  filter.pageCount = PAGE_COUNT;
  if (sp.search) filter.search = sp.search;
  if (sp.sortBy) filter.sortBy = sp.sortBy as typeof filter.sortBy;
  if (sp.sortOrder)
    filter.sortOrder = sp.sortOrder as typeof filter.sortOrder;
  if (sp.filterType)
    filter.filterType = Number(sp.filterType) as typeof filter.filterType;
  if (sp.authorType) filter.authorType = sp.authorType;

  // Best-effort SSR — see comment in recent/page.tsx.
  const [filesSettings, folderData, portalSettings] = await Promise.all([
    getFilesSettings().catch(() => undefined),
    getFolder(filter.folder, filter).catch(() => undefined),
    getSettings().catch(() => undefined),
  ]);

  return (
    <TrashPage
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
