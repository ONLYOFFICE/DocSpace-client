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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { runInAction } from "mobx";

import FilesFilter from "@docspace/shared/api/files/filter";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TSortBy } from "@docspace/shared/types";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useItemList from "@/app/(docspace)/_hooks/useItemList";
import useFilesSocket from "@/app/(docspace)/_hooks/useFilesSocket";

import type { AliasFilesStore } from "../../_store";
import { useAgentsCommonData } from "../../_store/AgentsCommonDataContext";

import RowView from "./row-view";
import TileView from "./tile-view";
import TableView from "./table-view";
import EmptyView from "./empty-view";
import useResetSelectionClick from "./hooks/useResetSelectionClick";

// Files-alias body — fully isolated from `(docspace)/(files)/_components/list`.
// Drives the row/tile/table views directly from the per-alias
// `AliasFilesStore` (Recent / Favorites / Trash) so refetches never
// re-resolve the folder from `window.location` (which would fall back to
// `@my` under `/ai-agents/*` routes — that was the original bug).
//
// The same view-layer also backs per-agent Knowledge / Result subfolder
// stores. Those routes have no SSR pre-fetch, so `folders`/`files`/`current`
// /`total`/`filesFilter` are optional: when omitted the store is expected
// to be populated client-side via `setFolder` before mount.

type Props = {
  useStore: () => AliasFilesStore;
  folders?: TFolder[];
  files?: TFile[];
  current?: TFolder;
  total?: number;
  filesSettings?: TFilesSettings;
  portalSettings?: TSettings;
  filesFilter?: string;
};

const AliasFilesList = ({
  useStore,
  folders,
  files,
  current,
  total,
  filesSettings,
  portalSettings,
  filesFilter,
}: Props) => {
  const store = useStore();
  const commonData = useAgentsCommonData();

  const effectiveFilesSettings = filesSettings ?? commonData.filesSettings;
  const effectivePortalSettings = portalSettings ?? commonData.portalSettings;
  const timezone = effectivePortalSettings?.timezone ?? "UTC";
  const displayFileExtension =
    effectiveFilesSettings?.displayFileExtension ?? false;

  const { setIsEmptyList, filesViewAs, setFilesViewAs, currentDeviceType } =
    useSettingsStore();
  const filesListStore = useFilesListStore();
  const { setItems, setRootFolderType } = filesListStore;
  const { setSelection, setBufferSelection } = useFilesSelectionStore();
  const navigationStore = useNavigationStore();

  useResetSelectionClick({ setSelection, setBufferSelection });

  // Hydrate the AliasFilesStore once from SSR data so the first paint
  // matches what the server rendered. Subsequent fetches are owned by the
  // store (filter changes → store.apply → store.fetch). For routes with
  // no SSR pre-fetch (Knowledge / Result), skip hydration and let the
  // store handle its own data lifecycle (setFolder + fetch).
  //
  // Done in a layout effect (not inline during render) so the MobX writes
  // don't trip React 19's "setState during render" guard via the other
  // observer components subscribed to the same store (header empty-state
  // badge, filter visibility, etc.). useLayoutEffect runs synchronously
  // before paint, so the visible result is identical to the inline path.
  const hydrated = React.useRef(false);
  React.useLayoutEffect(() => {
    if (hydrated.current) return;
    if (files === undefined || current === undefined) return;
    hydrated.current = true;
    const initialFilter = filesFilter
      ? FilesFilter.getFilter({
          search: `?${filesFilter}`,
          pathname: "",
        } as Location)
      : null;
    runInAction(() => {
      store.hydrate({
        files,
        folders: folders ?? [],
        current,
        total: total ?? 0,
        filter: initialFilter ?? store.filter,
      });
    });
  }, [files, folders, current, total, filesFilter, store]);

  React.useEffect(() => {
    if (filesViewAs !== "table" && filesViewAs !== "row") return;
    const isDesktop = currentDeviceType === DeviceType.desktop;
    if (isDesktop && filesViewAs === "row") setFilesViewAs("table");
    else if (!isDesktop && filesViewAs === "table") setFilesViewAs("row");
  }, [currentDeviceType, filesViewAs, setFilesViewAs]);

  const rootFolderType =
    filesListStore.rootFolderType ??
    store.current?.rootFolderType ??
    current?.rootFolderType ??
    null;
  React.useEffect(() => {
    const next = store.current?.rootFolderType ?? current?.rootFolderType;
    if (next !== undefined) setRootFolderType(next);
  }, [store.current?.rootFolderType, current?.rootFolderType, setRootFolderType]);

  const { getIcon } = useItemIcon({
    filesSettings: effectiveFilesSettings ?? undefined,
  });

  const { convertFileToItem, convertFolderToItem } = useItemList({
    getIcon,
    isFavoritesSection: rootFolderType === FolderType.Favorites,
    isRecentSection: rootFolderType === FolderType.Recent,
    isTrashSection: rootFolderType === FolderType.TRASH,
    isDocsSection: rootFolderType === FolderType.USER,
    isShareSection: rootFolderType === FolderType.SHARE,
  });

  const items = React.useMemo(
    () => [
      ...store.folders.map(convertFolderToItem),
      ...store.files.map((file) =>
        convertFileToItem(file, {
          isFavoritesSection: rootFolderType === FolderType.Favorites,
          isRecentSection: rootFolderType === FolderType.Recent,
        }),
      ),
    ],
    [
      store.folders,
      store.files,
      rootFolderType,
      convertFolderToItem,
      convertFileToItem,
    ],
  );

  React.useEffect(() => {
    setItems(items);
    setIsEmptyList(items.length === 0);
  }, [items, setItems, setIsEmptyList]);

  React.useEffect(() => {
    if (store.current?.title) {
      navigationStore.setCurrentTitle(store.current.title);
    }
  }, [store.current?.title, navigationStore]);

  const fetchMoreFiles = React.useCallback(async () => {
    await store.fetchMore();
  }, [store]);

  const onSort = React.useCallback(
    (sortBy: string, sortDirection: string) => {
      const next = store.filter.clone();
      next.sortBy = sortBy as typeof next.sortBy;
      next.sortOrder = sortDirection === "desc" ? "descending" : "ascending";
      next.page = 0;
      void store.fetch(next);
    },
    [store],
  );

  const folderId = store.current?.id ?? current?.id ?? 0;

  useFilesSocket(
    effectivePortalSettings?.socketUrl ?? "",
    folderId,
    () => store.fetch(),
  );

  const visibleItems = filesListStore.items.length > 0 ? filesListStore.items : items;
  const effectiveTotal = total ?? store.total;
  const hasNextPage = effectiveTotal > items.length;
  const currentFolder = store.current ?? current ?? null;

  if (!currentFolder) {
    return null;
  }

  if (visibleItems.length === 0) {
    return (
      <EmptyView
        current={currentFolder}
        folderId={String(folderId)}
        isFiltered={store.filter.isFiltered()}
      />
    );
  }

  if (filesViewAs === "tile") {
    return (
      <TileView
        items={visibleItems}
        currentFolderId={String(folderId)}
        hasMoreFiles={hasNextPage}
        fetchMoreFiles={fetchMoreFiles}
        filesLength={visibleItems.length}
        getIcon={getIcon}
      />
    );
  }

  if (filesViewAs === "table") {
    return (
      <TableView
        total={effectiveTotal}
        items={visibleItems}
        hasMoreFiles={hasNextPage}
        filterSortBy={store.filter.sortBy as TSortBy | null}
        filterSortOrder={store.filter.sortOrder ?? "ascending"}
        onSort={onSort}
        timezone={timezone}
        displayFileExtension={displayFileExtension}
        fetchMoreFiles={fetchMoreFiles}
      />
    );
  }

  return (
    <RowView
      total={effectiveTotal}
      items={visibleItems}
      hasMoreFiles={hasNextPage}
      filterSortBy={store.filter.sortBy as TSortBy | null}
      timezone={timezone}
      displayFileExtension={displayFileExtension}
      fetchMoreFiles={fetchMoreFiles}
    />
  );
};

export default observer(AliasFilesList);
