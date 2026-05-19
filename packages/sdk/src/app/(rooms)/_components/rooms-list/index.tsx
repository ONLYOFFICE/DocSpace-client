// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";

import api from "@docspace/shared/api";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TSortBy, TCreatedBy } from "@docspace/shared/types";
import { DeviceType } from "@docspace/shared/enums";

import { PAGE_COUNT } from "@/utils/constants";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useItemList, {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import TileView from "@/app/(docspace)/(files)/_components/tile-view";
import RoomsTableView from "../rooms-table-view";
import RoomsRowView from "../rooms-row-view";
import ChangeRoomOwnerDialog from "../change-room-owner-dialog";
import EmptyView from "../empty-view";
import CreateEditRoomDialog from "../create-edit-room-dialog";
import { RoomsRefreshContext } from "../../_contexts/RoomsRefreshContext";
import useResetSelectionClick from "@/app/(docspace)/(files)/_components/list/hooks/useResetSelectionClick";

type RoomsListProps = {
  folders: TFolder[];
  files: TFile[];
  filesSettings: TFilesSettings;
  filesFilter: string;
  portalSettings: TSettings;
  total: number;
  current: TFolder;
  user?: TUser;
};

const RoomsList = ({
  folders,
  files,
  filesSettings,
  filesFilter,
  portalSettings,
  total: totalProp,
  current,
  user,
}: RoomsListProps) => {
  const timezone = portalSettings.timezone;
  const searchParams = useSearchParams();

  const { setIsEmptyList, filesViewAs, setFilesViewAs, currentDeviceType } =
    useSettingsStore();
  const filesListStore = useFilesListStore();
  const { setItems, setRootFolderType } = filesListStore;
  const { setSelection, setBufferSelection } = useFilesSelectionStore();
  const navigationStore = useNavigationStore();

  useResetSelectionClick({ setSelection, setBufferSelection });

  React.useEffect(() => {
    const isDesktop = currentDeviceType === DeviceType.desktop;
    if (isDesktop && filesViewAs === "row") setFilesViewAs("table");
    else if (!isDesktop && filesViewAs === "table") setFilesViewAs("row");
  }, [currentDeviceType, filesViewAs, setFilesViewAs]);

  const { getIcon } = useItemIcon({ filesSettings });

  const { convertFolderToItem, convertFileToItem } = useItemList({
    isFavoritesSection: false,
    isRecentSection: false,
    isTrashSection: false,
    isDocsSection: false,
    getIcon,
  });

  const [filter, setFilter] = React.useState<RoomsFilter>(() => {
    const f = RoomsFilter.getDefault();
    const sp = new URLSearchParams(filesFilter);
    if (sp.get("page")) f.page = Number(sp.get("page"));
    if (sp.get("pageCount")) f.pageCount = Number(sp.get("pageCount"));
    if (sp.get("sortBy")) f.sortBy = sp.get("sortBy") as typeof f.sortBy;
    if (sp.get("sortOrder"))
      f.sortOrder = sp.get("sortOrder") as typeof f.sortOrder;
    if (sp.get("search")) f.filterValue = sp.get("search");
    return f;
  });

  const [filesList, setFilesList] = React.useState<(TFolderItem | TFileItem)[]>(
    [
      ...folders.map(convertFolderToItem),
      ...files.map((file) => convertFileToItem(file)),
    ],
  );
  const [total, setTotal] = React.useState<number>(totalProp);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(
    filesList.length < total,
  );

  const [editingRoom, setEditingRoom] = React.useState<
    (TFolderItem | TFileItem) | null
  >(null);

  const [changingOwnerRoom, setChangingOwnerRoom] = React.useState<
    (TFolderItem | TFileItem) | null
  >(null);

  const onEditRoom = React.useCallback((item: TFolderItem | TFileItem) => {
    setEditingRoom(item);
  }, []);

  const onChangeOwner = React.useCallback((item: TFolderItem | TFileItem) => {
    setChangingOwnerRoom(item);
  }, []);

  const refreshSingleRoom = React.useCallback(
    async (roomId: number) => {
      try {
        const updatedRoom = await api.rooms.getRoomInfo(roomId);
        const updatedItem = convertFolderToItem(
          updatedRoom as unknown as TFolder,
        );
        setFilesList((prev) =>
          prev.map((item) => (item.id === roomId ? updatedItem : item)),
        );
      } catch {
        // ignore
      }
    },
    [convertFolderToItem],
  );

  const requestRunning = React.useRef(false);
  const isInit = React.useRef(false);
  const fetchMoreAbortRef = React.useRef<AbortController | null>(null);
  const fetchRoomsAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      fetchMoreAbortRef.current?.abort();
      fetchRoomsAbortRef.current?.abort();
    };
  }, []);

  const fetchCurrentRooms = React.useCallback(async () => {
    if (requestRunning.current) return;

    fetchRoomsAbortRef.current?.abort();
    const controller = new AbortController();
    fetchRoomsAbortRef.current = controller;

    requestRunning.current = true;

    const newFilter = RoomsFilter.getDefault();
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("page")) newFilter.page = Number(sp.get("page"));
    if (sp.get("sortBy"))
      newFilter.sortBy = sp.get("sortBy") as typeof newFilter.sortBy;
    if (sp.get("sortOrder"))
      newFilter.sortOrder = sp.get("sortOrder") as typeof newFilter.sortOrder;
    if (sp.get("search")) newFilter.filterValue = sp.get("search");
    newFilter.page = 0;
    newFilter.pageCount = PAGE_COUNT;

    try {
      const res = await api.rooms.getRooms(newFilter, controller.signal);

      if (controller.signal.aborted) return;

      const {
        files: newFiles,
        folders: newFolders,
        total: newTotal,
        current: newCurrent,
      } = res;

      if (newCurrent?.title) {
        navigationStore.setCurrentTitle(newCurrent.title);
      }

      if (newCurrent?.rootFolderType != null) {
        setRootFolderType(newCurrent.rootFolderType);
      }

      const newItems = [
        ...(newFolders as unknown as TFolder[]).map(convertFolderToItem),
        ...newFiles.map((file) => convertFileToItem(file)),
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
    setIsEmptyList,
    convertFolderToItem,
    convertFileToItem,
    navigationStore,
    setRootFolderType,
  ]);

  const fetchMoreRooms = React.useCallback(async () => {
    if (!hasNextPage || requestRunning.current) return;
    requestRunning.current = true;

    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    fetchMoreAbortRef.current = controller;

    filter.page += 1;
    filter.pageCount = PAGE_COUNT;

    try {
      const res = await api.rooms.getRooms(filter, controller.signal);

      if (controller.signal.aborted) return;

      const { files: newFiles, folders: newFolders, total: newTotal } = res;

      const newItems = [
        ...(newFolders as unknown as TFolder[]).map(convertFolderToItem),
        ...newFiles.map((f) => convertFileToItem(f)),
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
  }, [filter, hasNextPage, convertFolderToItem, convertFileToItem]);

  React.useEffect(() => {
    if (!isInit.current || requestRunning.current) {
      isInit.current = true;
      return;
    }
    fetchCurrentRooms();
  }, [searchParams, fetchCurrentRooms]);

  React.useEffect(() => {
    setItems(filesList);
  }, [filesList, setItems]);

  React.useEffect(() => {
    setRootFolderType(current.rootFolderType);
  }, [current.rootFolderType, setRootFolderType]);

  const visibleItems =
    filesListStore.items.length > 0 ? filesListStore.items : filesList;

  let content: React.ReactNode;

  if (visibleItems.length === 0) {
    content = <EmptyView isFiltered={!!filter.filterValue} />;
  } else if (filesViewAs === "tile") {
    content = (
      <TileView
        items={visibleItems}
        currentFolderId={String(current.id)}
        hasMoreFiles={hasNextPage}
        fetchMoreFiles={fetchMoreRooms}
        filesLength={visibleItems.length}
        getIcon={getIcon}
      />
    );
  } else if (filesViewAs === "table") {
    content = (
      <RoomsTableView
        total={total}
        items={visibleItems}
        hasMoreFiles={hasNextPage}
        filterSortBy={filter.sortBy as TSortBy}
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
        fetchMoreFiles={fetchMoreRooms}
        onEditRoom={onEditRoom}
        onChangeOwner={onChangeOwner}
        onRoomChanged={refreshSingleRoom}
      />
    );
  } else {
    content = (
      <RoomsRowView
        total={total}
        items={visibleItems}
        hasMoreFiles={hasNextPage}
        filterSortBy={filter.sortBy as TSortBy}
        timezone={timezone}
        fetchMoreFiles={fetchMoreRooms}
        onEditRoom={onEditRoom}
        onChangeOwner={onChangeOwner}
        onRoomChanged={refreshSingleRoom}
      />
    );
  }

  const editingRoomData = editingRoom
    ? (() => {
        const folder = editingRoom as TFolderItem;
        const logo = folder.roomLogo;
        return {
          id: folder.id,
          title: folder.title,
          tags: (folder as unknown as { tags?: string[] }).tags,
          roomLogo: logo?.cover ? undefined : (logo?.large ?? logo?.medium),
          roomIconColor: folder.roomIconColor,
          roomCover: logo?.cover,
          createdBy: folder.createdBy as TCreatedBy | undefined,
        };
      })()
    : undefined;

  return (
    <RoomsRefreshContext.Provider value={fetchCurrentRooms}>
      {content}
      <CreateEditRoomDialog
        visible={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoomData}
        onRoomEdited={refreshSingleRoom}
      />
      {changingOwnerRoom ? (
        <ChangeRoomOwnerDialog
          visible
          onClose={() => setChangingOwnerRoom(null)}
          roomId={changingOwnerRoom.id as number}
          roomOwnerId={
            (changingOwnerRoom as TFolderItem).createdBy?.id ?? undefined
          }
          currentUserId={user?.id}
          onChanged={refreshSingleRoom}
        />
      ) : null}
    </RoomsRefreshContext.Provider>
  );
};

export default observer(RoomsList);

