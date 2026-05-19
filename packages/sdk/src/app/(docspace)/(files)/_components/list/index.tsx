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
import React from "react";
import { observer } from "mobx-react";
import { usePathname, useSearchParams } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { DeviceType, FolderType } from "@docspace/shared/enums";

import { PAGE_COUNT } from "@/utils/constants";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useItemList, {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";
import useFilesSocket from "@/app/(docspace)/_hooks/useFilesSocket";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import RowView from "../row-view";
import TileView from "../tile-view";
import TableView from "../table-view";
import EmptyView from "../empty-view";

import { ListProps } from "./List.types";
import useResetSelectionClick from "./hooks/useResetSelectionClick";

const List = ({
  folders,
  files,
  filesSettings,
  filesFilter,
  portalSettings,
  shareKey,
  total: totalProp,
  current,
}: ListProps) => {
  const timezone = portalSettings.timezone;
  const displayFileExtension = filesSettings.displayFileExtension;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { setIsEmptyList, filesViewAs, setFilesViewAs, currentDeviceType } =
    useSettingsStore();
  const filesListStore = useFilesListStore();
  const { setItems, setRootFolderType } = filesListStore;
  const { setSelection, setBufferSelection } = useFilesSelectionStore();
  const navigationStore = useNavigationStore();

  useResetSelectionClick({ setSelection, setBufferSelection });

  React.useEffect(() => {
    if (filesViewAs !== "table" && filesViewAs !== "row") return;

    const isDesktop = currentDeviceType === DeviceType.desktop;

    if (isDesktop && filesViewAs === "row") setFilesViewAs("table");
    else if (!isDesktop && filesViewAs === "table") setFilesViewAs("row");
  }, [currentDeviceType, filesViewAs, setFilesViewAs]);

  const { getIcon } = useItemIcon({
    filesSettings,
  });

  const rootFolderType = filesListStore.rootFolderType ?? current.rootFolderType;
  const rootFolderTypeRef = React.useRef(rootFolderType);
  rootFolderTypeRef.current = rootFolderType;

  const { convertFileToItem, convertFolderToItem } = useItemList({
    getIcon,
    shareKey,
    isFavoritesSection: rootFolderType === FolderType.Favorites,
    isRecentSection: rootFolderType === FolderType.Recent,
    isTrashSection: rootFolderType === FolderType.TRASH,
    isDocsSection: rootFolderType === FolderType.USER,
  });

  const [filter, setFilter] = React.useState<FilesFilter>(
    FilesFilter.getFilter({
      search: `?${filesFilter}`,
      pathname,
    } as Location)!,
  );
  const [filesList, setFilesList] = React.useState<(TFolderItem | TFileItem)[]>(
    [...folders.map(convertFolderToItem), ...files.map((file) => convertFileToItem(file))],
  );
  const [total, setTotal] = React.useState<number>(totalProp);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(
    filesList.length < total,
  );
  const [currentFolderId, setCurrentFolderId] = React.useState<
    string | number
  >(current.id);

  const requestRunning = React.useRef(false);
  const isInit = React.useRef(false);
  const fetchMoreAbortRef = React.useRef<AbortController | null>(null);
  const fetchFolderAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      fetchMoreAbortRef.current?.abort();
      fetchFolderAbortRef.current?.abort();
    };
  }, []);

  const fetchCurrentFolder = React.useCallback(async () => {
    if (requestRunning.current) return;

    fetchFolderAbortRef.current?.abort();
    const controller = new AbortController();
    fetchFolderAbortRef.current = controller;

    requestRunning.current = true;
    const newFilter = FilesFilter.getFilter(window.location)!;

    newFilter.page = 0;
    newFilter.pageCount = PAGE_COUNT;

    try {
      const res = await api.files.getFolder(
        newFilter.folder,
        newFilter,
        controller.signal,
        shareKey,
      );

      if (controller.signal.aborted) return;

      const {
        files: newFiles,
        folders: newFolders,
        total: newTotal,
        current: newCurrent,
      } = res;

      if (newCurrent?.id) {
        setCurrentFolderId(newCurrent.id);
      }

      if (newCurrent?.title) {
        navigationStore.setCurrentTitle(newCurrent.title);
      }

      if (newCurrent?.rootFolderType != null) {
        setRootFolderType(newCurrent.rootFolderType);
        rootFolderTypeRef.current = newCurrent.rootFolderType;
      }

      const newItems = [
        ...newFolders.map(convertFolderToItem),
        ...newFiles.map((file) =>
          convertFileToItem(file, {
            isRecentSection: rootFolderTypeRef.current === FolderType.Recent,
            isFavoritesSection: rootFolderTypeRef.current === FolderType.Favorites,
          }),
        ),
      ];

      setIsEmptyList(newItems.length === 0);

      setFilesList(newItems);
      setTotal(newTotal);
      setHasNextPage(newTotal > newItems.length);
      setFilter(newFilter);
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      requestRunning.current = false;
    }
  }, [
    shareKey,
    setIsEmptyList,
    convertFolderToItem,
    convertFileToItem,
    navigationStore,
    setCurrentFolderId,
    setRootFolderType,
  ]);

  const fetchMoreFiles = React.useCallback(async () => {
    if (!hasNextPage || requestRunning.current) return;
    requestRunning.current = true;

    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    fetchMoreAbortRef.current = controller;

    filter.page += 1;
    filter.pageCount = PAGE_COUNT;

    try {
      const res = await api.files.getFolder(
        filter.folder,
        filter,
        controller.signal,
        shareKey,
      );

      if (controller.signal.aborted) return;

      const { files: newFiles, folders: newFolders, total: newTotal } = res;

      const sectionOverrides = {
        isRecentSection: rootFolderTypeRef.current === FolderType.Recent,
        isFavoritesSection: rootFolderTypeRef.current === FolderType.Favorites,
      };
      const newItems = [
        ...newFolders.map(convertFolderToItem),
        ...newFiles.map((f) => convertFileToItem(f, sectionOverrides)),
      ];

      let hasNext = false;
      setFilesList((val) => {
        const newVal = [...val, ...newItems];

        hasNext = newTotal > newVal.length;

        return newVal;
      });
      setTotal(newTotal);
      setHasNextPage(hasNext);
      setFilter(filter);
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      requestRunning.current = false;
    }
  }, [filter, shareKey, hasNextPage, convertFolderToItem, convertFileToItem]);

  React.useEffect(() => {
    if (!isInit.current || requestRunning.current) {
      isInit.current = true;

      return;
    }

    fetchCurrentFolder();
  }, [searchParams, fetchCurrentFolder]);

  useFilesSocket(
    portalSettings.socketUrl ?? "",
    currentFolderId,
    fetchCurrentFolder,
  );

  React.useEffect(() => {
    setItems(filesList);
  }, [filesList, setItems]);

  React.useEffect(() => {
    setRootFolderType(current.rootFolderType);
  }, [current.rootFolderType, setRootFolderType]);

  const visibleItems = filesListStore.items.length > 0 ? filesListStore.items : filesList;

  if (visibleItems.length === 0) {
    return (
      <EmptyView
        current={current}
        folderId={filter.folder}
        isFiltered={filter.isFiltered()}
        shareKey={shareKey}
      />
    );
  }

  if (filesViewAs === "tile") {
    return (
      <TileView
        items={visibleItems}
        currentFolderId={filter.folder}
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
        filterSortBy={filter.sortBy}
        filterSortOrder={filter.sortOrder ?? "ascending"}
        onSort={(sortBy, sortDirection) => {
          const newFilter = filter.clone();
          newFilter.sortBy = sortBy as typeof filter.sortBy;
          newFilter.sortOrder =
            sortDirection === "desc" ? "descending" : "ascending";
          newFilter.page = 0;
          newFilter.pageCount = PAGE_COUNT;
          setFilter(newFilter);
          window.history.pushState(null, "", `?${newFilter.toUrlParams()}`);
        }}
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
      filterSortBy={filter.sortBy}
      timezone={timezone}
      displayFileExtension={displayFileExtension}
      fetchMoreFiles={fetchMoreFiles}
    />
  );
};

export default observer(List);
