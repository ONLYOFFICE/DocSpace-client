// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

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

import RowView from "./row-view";
import TileView from "./tile-view";
import TableView from "./table-view";
import EmptyView from "./empty-view";
import useResetSelectionClick from "./hooks/useResetSelectionClick";

// Files-alias body — fully isolated from `(docspace)/(files)/_components/list`.
// Drives the row/tile/table views directly from the per-alias
// `AliasFilesStore` (Recent / Favorites / …) so refetches never re-resolve
// the folder from `window.location` (which would fall back to `@my` under
// `/ai-agents/*` routes — that was the original bug).

type Props = {
  useStore: () => AliasFilesStore;
  folders: TFolder[];
  files: TFile[];
  current: TFolder;
  total: number;
  filesSettings: TFilesSettings;
  portalSettings: TSettings;
  filesFilter: string;
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

  const timezone = portalSettings.timezone;
  const displayFileExtension = filesSettings.displayFileExtension;

  const { setIsEmptyList, filesViewAs, setFilesViewAs, currentDeviceType } =
    useSettingsStore();
  const filesListStore = useFilesListStore();
  const { setItems, setRootFolderType } = filesListStore;
  const { setSelection, setBufferSelection } = useFilesSelectionStore();
  const navigationStore = useNavigationStore();

  useResetSelectionClick({ setSelection, setBufferSelection });

  // Hydrate the AliasFilesStore once from SSR data so the first paint
  // matches what the server rendered. Subsequent fetches are owned by the
  // store (filter changes → store.apply → store.fetch).
  const hydrated = React.useRef(false);
  if (!hydrated.current) {
    hydrated.current = true;
    const initialFilter = FilesFilter.getFilter({
      search: `?${filesFilter}`,
      pathname: "",
    } as Location);
    runInAction(() => {
      store.hydrate({
        files,
        folders,
        current,
        total,
        filter: initialFilter ?? store.filter,
      });
    });
  }

  React.useEffect(() => {
    if (filesViewAs !== "table" && filesViewAs !== "row") return;
    const isDesktop = currentDeviceType === DeviceType.desktop;
    if (isDesktop && filesViewAs === "row") setFilesViewAs("table");
    else if (!isDesktop && filesViewAs === "table") setFilesViewAs("row");
  }, [currentDeviceType, filesViewAs, setFilesViewAs]);

  const rootFolderType = filesListStore.rootFolderType ?? current.rootFolderType;
  React.useEffect(() => {
    setRootFolderType(current.rootFolderType);
  }, [current.rootFolderType, setRootFolderType]);

  const { getIcon } = useItemIcon({ filesSettings });

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

  useFilesSocket(
    portalSettings.socketUrl ?? "",
    store.current?.id ?? current.id,
    () => store.fetch(),
  );

  const visibleItems = filesListStore.items.length > 0 ? filesListStore.items : items;
  const folderId = store.current?.id ?? current.id;
  const hasNextPage = total > items.length;

  if (visibleItems.length === 0) {
    return (
      <EmptyView
        current={store.current ?? current}
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
        total={total}
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
      total={total}
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
