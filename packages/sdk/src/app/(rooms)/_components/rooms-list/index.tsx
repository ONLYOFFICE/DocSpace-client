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
import { DeviceType, RoomSearchArea } from "@docspace/shared/enums";

import { PAGE_COUNT } from "@/utils/constants";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { toastr } from "@docspace/ui-kit/components/toast";

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
import RestoreRoomDialog from "../restore-room-dialog";
import DeleteRoomDialog from "../delete-room-dialog";
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
  isArchive?: boolean;
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
  isArchive,
}: RoomsListProps) => {
  const timezone = portalSettings.timezone;
  const searchParams = useSearchParams();

  const { setIsEmptyList, filesViewAs, setFilesViewAs, currentDeviceType } =
    useSettingsStore();
  const filesListStore = useFilesListStore();
  const { setRootFolderType } = filesListStore;
  const { setSelection, setBufferSelection } = useFilesSelectionStore();
  const navigationStore = useNavigationStore();
  const activeItemsStore = useActiveItemsStore();

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
    const f = RoomsFilter.getDefault(
      undefined,
      isArchive ? RoomSearchArea.Archive : RoomSearchArea.Active,
    );
    const sp = new URLSearchParams(filesFilter);
    if (sp.get("page")) f.page = Number(sp.get("page"));
    if (sp.get("pageCount")) f.pageCount = Number(sp.get("pageCount"));
    if (sp.get("sortBy")) f.sortBy = sp.get("sortBy") as typeof f.sortBy;
    if (sp.get("sortOrder"))
      f.sortOrder = sp.get("sortOrder") as typeof f.sortOrder;
    if (sp.get("search")) f.filterValue = sp.get("search");
    return f;
  });

  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    filesListStore.setItems([
      ...folders.map(convertFolderToItem),
      ...files.map((file) => convertFileToItem(file)),
    ]);
  }

  const [total, setTotal] = React.useState<number>(totalProp);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(
    filesListStore.items.length < total,
  );

  const [editingRoom, setEditingRoom] = React.useState<
    (TFolderItem | TFileItem) | null
  >(null);

  const [changingOwnerRoom, setChangingOwnerRoom] = React.useState<
    (TFolderItem | TFileItem) | null
  >(null);

  const [restoringRoom, setRestoringRoom] = React.useState<
    (TFolderItem | TFileItem) | null
  >(null);

  const onEditRoom = React.useCallback((item: TFolderItem | TFileItem) => {
    setEditingRoom(item);
  }, []);

  const onChangeOwner = React.useCallback((item: TFolderItem | TFileItem) => {
    setChangingOwnerRoom(item);
  }, []);

  const onRestoreRoom = React.useCallback((item: TFolderItem | TFileItem) => {
    setRestoringRoom(item);
  }, []);

  const restoreRoom = React.useCallback(
    async (roomId: number) => {
      activeItemsStore.addActiveItems([], [roomId]);
      try {
        await api.rooms.unarchiveRoom(roomId);
        filesListStore.removeItem(roomId);
        setTotal((prev) => Math.max(0, prev - 1));
      } catch (e) {
        toastr.error(e as Error);
      } finally {
        activeItemsStore.removeActiveItems([], [roomId]);
      }
    },
    [activeItemsStore, filesListStore],
  );

  const onRestoreSelected = React.useCallback(
    async (items: (TFolderItem | TFileItem)[]) => {
      if (!items.length) return;
      const ids = items.map((item) => item.id as number);
      activeItemsStore.addActiveItems([], ids);
      try {
        await Promise.all(ids.map((id) => api.rooms.unarchiveRoom(id)));
        for (const id of ids) filesListStore.removeItem(id);
        setTotal((prev) => Math.max(0, prev - ids.length));
        setSelection([]);
        setBufferSelection(null);
      } catch (e) {
        toastr.error(e as Error);
      } finally {
        activeItemsStore.removeActiveItems([], ids);
      }
    },
    [activeItemsStore, filesListStore, setSelection, setBufferSelection],
  );

  const [deletingItems, setDeletingItems] = React.useState<
    (TFolderItem | TFileItem)[] | null
  >(null);

  const onDeleteRoom = React.useCallback((item: TFolderItem | TFileItem) => {
    setDeletingItems([item]);
  }, []);

  const onDeleteSelected = React.useCallback(
    (items: (TFolderItem | TFileItem)[]) => {
      if (!items.length) return;
      setDeletingItems(items);
    },
    [],
  );

  const deleteRooms = React.useCallback(
    async (roomIds: number[]) => {
      activeItemsStore.addActiveItems([], roomIds);
      try {
        await api.files.removeFiles(roomIds, [], false, true, true);
        for (const id of roomIds) filesListStore.removeItem(id);
        setTotal((prev) => Math.max(0, prev - roomIds.length));
        setSelection([]);
        setBufferSelection(null);
      } catch (e) {
        toastr.error(e as Error);
      } finally {
        activeItemsStore.removeActiveItems([], roomIds);
      }
    },
    [activeItemsStore, filesListStore, setSelection, setBufferSelection],
  );

  const refreshSingleRoom = React.useCallback(
    async (roomId: number) => {
      try {
        const updatedRoom = await api.rooms.getRoomInfo(roomId);
        const updatedItem = convertFolderToItem(
          updatedRoom as unknown as TFolder,
        );
        filesListStore.replaceItem(roomId, updatedItem);
      } catch {
        // ignore
      }
    },
    [convertFolderToItem, filesListStore],
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

    const newFilter = RoomsFilter.getDefault(
      undefined,
      isArchive ? RoomSearchArea.Archive : RoomSearchArea.Active,
    );
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

      filesListStore.setItems(newItems);
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
    isArchive,
    filesListStore,
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

      filesListStore.appendItems(newItems);
      setTotal(newTotal);
      setHasNextPage(newTotal > filesListStore.items.length);
      setFilter(filter);
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      requestRunning.current = false;
    }
  }, [
    filter,
    hasNextPage,
    convertFolderToItem,
    convertFileToItem,
    filesListStore,
  ]);

  React.useEffect(() => {
    if (!isInit.current || requestRunning.current) {
      isInit.current = true;
      return;
    }
    fetchCurrentRooms();
  }, [searchParams, fetchCurrentRooms]);

  React.useEffect(() => {
    setRootFolderType(current.rootFolderType);
  }, [current.rootFolderType, setRootFolderType]);

  const visibleItems = filesListStore.items;

  let content: React.ReactNode;

  if (visibleItems.length === 0) {
    content = (
      <EmptyView isFiltered={!!filter.filterValue} isArchive={isArchive} />
    );
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
        onRestoreRoom={onRestoreRoom}
        onDeleteRoom={onDeleteRoom}
        onDeleteSelected={onDeleteSelected}
        onRestoreSelected={onRestoreSelected}
        isArchive={isArchive}
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
        onRestoreRoom={onRestoreRoom}
        onDeleteRoom={onDeleteRoom}
        onDeleteSelected={onDeleteSelected}
        onRestoreSelected={onRestoreSelected}
        isArchive={isArchive}
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
      {restoringRoom ? (
        <RestoreRoomDialog
          visible
          onClose={() => setRestoringRoom(null)}
          roomType={(restoringRoom as TFolderItem).roomType}
          onConfirm={() => restoreRoom(restoringRoom.id as number)}
        />
      ) : null}
      {deletingItems && deletingItems.length > 0 ? (
        <DeleteRoomDialog
          visible
          onClose={() => setDeletingItems(null)}
          roomName={deletingItems[0].title}
          count={deletingItems.length}
          onConfirm={() =>
            deleteRooms(deletingItems.map((item) => item.id as number))
          }
        />
      ) : null}
    </RoomsRefreshContext.Provider>
  );
};

export default observer(RoomsList);

