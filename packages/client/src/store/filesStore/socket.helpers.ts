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

import { runInAction } from "mobx";
import api from "@docspace/shared/api";
import {
  AnalyticsEvents,
  FileStatus,
  FolderType,
  RoomsType,
  RoomSearchArea,
} from "@docspace/shared/enums";
import {
  frameCallEvent,
  getCategoryType,
  getFileExtension,
} from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  CategoryType,
  LOADER_TIMEOUT,
  MEDIA_VIEW_URL,
} from "@docspace/shared/constants";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import { FILTER_DOCUMENTS } from "@docspace/shared/utils/filterConstants";
import { isRoom as isRoomUtil } from "@docspace/shared/utils/typeGuards";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getI18n } from "react-i18next";
import config from "PACKAGE_FILE";

import {
  getCategoryUrl,
  getCategoryTypeByFolderType,
} from "SRC_DIR/helpers/utils";
import {
  refreshInfoPanel,
  setInfoPanelSelectedRoom,
} from "SRC_DIR/helpers/info-panel";
import { showCreatedPDFFormDialog } from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";

import type { Nullable } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TPathParts } from "@docspace/shared/types";
import type { TOptSocket } from "@docspace/ui-kit/utils/socket";

import type { default as FilesStore } from "../FilesStore";

const { FilesFilter, RoomsFilter } = api;

// Socket / websocket event handlers extracted from FilesStore. Side-effectful
// actions (not computeds); moved verbatim into free functions over
// `self: FilesStore`. noImplicitThis guarantees the this->self rewrite.

export function onResolveNewFileImpl(
  self: FilesStore,
  { fileInfo }: { fileInfo?: TFile },
) {
  if (!fileInfo) return;

  // console.log("onResolveNewFiles", { fileInfo });

  if (self.files.findIndex((x) => x.id === fileInfo.id) > -1) return;

  if (
    self.selectedFolderStore.id !== fileInfo.folderId &&
    self.aiRoomStore.knowledgeId !== fileInfo.folderId &&
    self.aiRoomStore.resultId !== fileInfo.folderId &&
    self.selectedFolderStore.rootFolderType !== FolderType.Recent &&
    self.selectedFolderStore.rootFolderType !== FolderType.Favorites
  )
    return;

  console.log("[WS] create new file", { fileInfo });

  const newFiles = [fileInfo, ...self.files];

  const newFilter = self.filter;
  newFilter.total += 1;

  runInAction(() => {
    self.setFilter(newFilter);
    self.setFiles(newFiles);
  });

  self.debouncefetchTreeFolders();
}

export async function wsModifyFolderCreateImpl(
  self: FilesStore,
  opt?: TOptSocket,
) {
  if (opt?.type === "file" && opt?.id) {
    const foundIndex = self.getFileIndex(opt?.id);

    // several socket payload reads below keep the old
    // unchecked-crash behavior via erased casts / non-null assertions
    // (JSON.parse of possibly-undefined data, user possibly null).
    const file = JSON.parse(opt?.data as string);

    if (
      self.selectedFolderStore.id !== file.folderId &&
      self.aiRoomStore.knowledgeId !== file.folderId &&
      self.aiRoomStore.resultId !== file.folderId
    ) {
      const movedToIndex = self.getFolderIndex(file.folderId);
      if (movedToIndex > -1) self.folders[movedToIndex].filesCount++;
      return;
    }

    // To update a file version
    if (foundIndex > -1) {
      if (
        self.files[foundIndex].version !== file.version ||
        self.files[foundIndex].versionGroup !== file.versionGroup
      ) {
        self.files[foundIndex].version = file.version;
        self.files[foundIndex].versionGroup = file.versionGroup;
      }

      const oldFile = self.files[foundIndex];
      const newFile = await self.getFileInfo(
        file.id,
        file.requestToken ?? oldFile.requestToken,
        true,
      ).catch(() => ({ ...oldFile, ...file }));

      const [fileItem] = self.getFilesListItems([newFile]);

      self.checkSelection(fileItem);
    }

    if (foundIndex > -1) return;

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: AnalyticsEvents.FileCreated,
      id: file.id,
      parentId: file.folderId,
      file_type: getFileExtension(file.title).replace(".", ""),
    });

    self.selectedFolderStore.setFilesCount(
      self.selectedFolderStore.filesCount + 1,
    );

    setTimeout(() => {
      if (self.getFileIndex(file.id) > -1) {
        // console.log("Skip in timeout");
        return null;
      }

      self.createNewFilesQueue.enqueue((() => {
        if (self.getFileIndex(file.id) > -1) {
          // console.log("Skip in queue");
          return null;
        }

        return api.files
          .getFileInfo(file.id, file.requestToken)
          .then((fileInfo) => ({
            fileInfo,
          }));
      }) as unknown as () => Promise<unknown>);
    }, 300);
  } else if (opt?.type === "folder" && opt?.id) {
    self.selectedFolderStore.setFoldersCount(
      self.selectedFolderStore.foldersCount + 1,
    );

    const foundIndex = self.folders.findIndex((x) => x.id == opt?.id);

    if (foundIndex > -1) return;

    const folder = JSON.parse(opt?.data as string);

    if (self.selectedFolderStore.id != folder.parentId) {
      const movedToIndex = self.getFolderIndex(folder.parentId);
      if (movedToIndex > -1) self.folders[movedToIndex].foldersCount++;
    }

    if (
      self.selectedFolderStore.id != folder.parentId ||
      (folder.roomType &&
        folder.createdBy.id === self.userStore.user!.id &&
        self.roomCreated)
    ) {
      return (self.roomCreated = false);
    }

    const folderInfo = await api.files.getFolderInfo(folder.id);

    console.log("[WS] create new folder", folderInfo.id, folderInfo.title);

    if (!folderInfo || folderInfo.parentId !== self.selectedFolderStore.id) {
      console.log("Skip UNSUBSCRIBED folder creation");
      return;
    }

    const newFolders = [folderInfo, ...self.folders];

    const newFilter = self.filter;
    newFilter.total += 1;

    runInAction(() => {
      self.setFilter(newFilter);
      self.setFolders(newFolders);
    });
  }
}

export async function wsModifyFolderUpdateImpl(
  self: FilesStore,
  opt?: TOptSocket,
) {
  if (opt?.type === "file" && opt?.data) {
    const file = JSON.parse(opt?.data);

    if (!file || !file.id) return;

    const fileInfo = await self.getFileInfo(file.id, file.requestToken); // self.setFile(file);
    console.log("[WS] update file", file.id, file.title);

    const [newFile] = self.getFilesListItems([fileInfo]);

    self.checkSelection(newFile);
  } else if (opt?.type === "folder" && opt?.data) {
    const folder = JSON.parse(opt?.data);
    if (!folder || !folder.id) return;

    self.refreshFolder(folder.id);
  }
}

export function refreshFolderImpl(self: FilesStore, id: number | string) {
  api.files
    .getFolderInfo(id)
    .then((response) => {
      const folderInfo = {
        isFolder: true,
        isRoom: isRoomUtil(response),
        ...response,
      };

      const [newFolder] = self.getFilesListItems([folderInfo]);

      console.log("[WS] update folder", newFolder.id, newFolder.title);

      if (self.selection?.length) {
        const foundIndex = self.selection?.findIndex(
          (x) => x.id === newFolder.id,
        );
        if (foundIndex > -1) {
          runInAction(() => {
            self.selection[foundIndex] = newFolder;
          });
        }
      }

      if (self.bufferSelection) {
        if (
          self.bufferSelection.id === newFolder.id &&
          (self.bufferSelection.isFolder || self.bufferSelection.isRoom)
        ) {
          self.setBufferSelection(newFolder);
        }
      }

      const navigationPath = [...self.selectedFolderStore.navigationPath];
      const pathParts = [...self.selectedFolderStore.pathParts];

      const idx = navigationPath.findIndex((p) => p.id === newFolder.id);

      if (idx !== -1) {
        navigationPath[idx].title = newFolder?.title as string;
      }

      if (folderInfo.id === self.selectedFolderStore.id) {
        self.selectedFolderStore.setSelectedFolder({
          ...folderInfo,
          navigationPath,
          pathParts,
        });

        setInfoPanelSelectedRoom(newFolder as TRoom, true);
      }

      self.setFolder(folderInfo);

      refreshInfoPanel();
    })
    .catch(() => {
      // console.log("Folder deleted")
    });
}

export function wsModifyFolderDeleteImpl(self: FilesStore, opt?: TOptSocket) {
  const { recentFolderId, favoritesFolderId } = self.treeFoldersStore;
  const data = opt?.data && JSON.parse(opt.data);

  // Skip when removing in recent or favorites but selected folder is not recent or favorites
  if (
    (data?.folderId === recentFolderId &&
      self.selectedFolderStore.id !== recentFolderId) ||
    (data?.folderId === favoritesFolderId &&
      self.selectedFolderStore.id !== favoritesFolderId) ||
    (data?.parentId === favoritesFolderId &&
      self.selectedFolderStore.id !== favoritesFolderId)
  ) {
    return;
  }

  if (opt?.type === "file" && opt?.id) {
    const foundIndex = self.files.findIndex((x) => x.id === opt?.id);
    if (foundIndex == -1) return;

    const foundFile = self.files[foundIndex];

    self.selectedFolderStore.setFilesCount(
      self.selectedFolderStore.filesCount - 1,
    );

    console.log("[WS] delete file", foundFile.id, foundFile.title);

    // self.setFiles(
    //   self.files.filter((_, index) => {
    //     return index !== foundIndex;
    //   })
    // );

    // const newFilter = self.filter.clone();
    // newFilter.total -= 1;
    // self.setFilter(newFilter);

    const tempActionFilesIds = JSON.parse(
      JSON.stringify(self.tempActionFilesIds),
    );
    tempActionFilesIds.push(foundFile.id);

    self.setTempActionFilesIds(tempActionFilesIds);

    self.removeStaleItemFromSelection(foundFile);
    self.debounceRemoveFiles();

    // Hide pagination when deleting files
    runInAction(() => {
      self.isHidePagination = true;
    });

    runInAction(() => {
      if (
        self.files.length === 0 &&
        self.folders.length === 0 &&
        self.pageItemsLength! > 1
      ) {
        self.isLoadingFilesFind = true;
      }
    });
  } else if (opt?.type === "folder" && opt?.id) {
    const { isRoom, isTemplate, pathParts, rootFolderType } =
      self.selectedFolderStore;
    const foundIndex = self.folders.findIndex((x) => x.id === opt?.id);

    if (foundIndex === -1) {
      if (self.selectedFolderStore.id === opt.id) {
        frameCallEvent({ event: "onNotFound" });
      }

      return self.redirectToParent(
        opt,
        pathParts,
        isRoom,
        isTemplate,
        rootFolderType,
      );
    }

    const foundFolder = self.folders[foundIndex];

    self.selectedFolderStore.setFoldersCount(
      self.selectedFolderStore.foldersCount - 1,
    );

    console.log("[WS] delete folder", foundFolder.id, foundFolder.title);

    const tempActionFoldersIds = JSON.parse(
      JSON.stringify(self.tempActionFoldersIds),
    );
    tempActionFoldersIds.push(foundFolder.id);

    self.setTempActionFoldersIds(tempActionFoldersIds);
    self.removeStaleItemFromSelection(foundFolder);
    self.debounceRemoveFolders();

    runInAction(() => {
      self.isHidePagination = true;
    });

    runInAction(() => {
      if (
        self.files.length === 0 &&
        self.folders.length === 0 &&
        self.pageItemsLength! > 1
      ) {
        self.isLoadingFilesFind = true;
      }
    });
  }
}

export function wsCreatedPDFFormImpl(self: FilesStore, option: TOptSocket) {
  if (!option.data) return;

  const file = JSON.parse(option.data);

  if (self.selectedFolderStore.id !== file.folderId) return;

  showCreatedPDFFormDialog(file, self.userStore.user!.id);
}

export function wsChangeFolderAccessRightsImpl(
  self: FilesStore,
  option: TOptSocket,
) {
  if (!option.data || !option.id) return;

  const folderId = option.id;
  const memberAccess = JSON.parse(option.data);

  if (self.selectedFolderStore.id !== folderId) return;
  if (!memberAccess[self.userStore.user!.id]) return;

  console.log("[WS] change folder access rights for current user", {
    folderId,
    memberAccess,
  });

  self.refreshFolder(folderId);
  self.refreshFiles();
}

export function redirectToParentImpl(
  self: FilesStore,
  opt: TOptSocket,
  pathParts: TPathParts[],
  isRoom: boolean,
  isTemplate: boolean,
  rootFolderType: Nullable<FolderType>,
) {
  const removedId = opt.id;

  const includePathPartIndex = pathParts.findIndex(
    ({ id }) => id === removedId,
  );

  if (includePathPartIndex === -1 || self.treeFoldersStore.isPersonalReadOnly)
    return;

  if (isRoom && isTemplate) {
    const newRoomsFilter = RoomsFilter.getDefault();
    newRoomsFilter.searchArea = RoomSearchArea.Templates;
    return window.DocSpace.navigate(
      `/rooms/shared/filter?${newRoomsFilter.toUrlParams()}`,
    );
  }
  const pathPart = pathParts[includePathPartIndex - 1];
  const { myFolderId, roomsFolderId } = self.treeFoldersStore;
  const userId = self.userStore.user && self.userStore.user.id;

  switch (rootFolderType) {
    case FolderType.AIAgents: {
      // RoomsFilter.getDefault/toUrlParams type userId as
      // `string | undefined` but the old JS passes `null` when there is no
      // user; erased casts keep the exact runtime value.
      const aiAgentsFilter = RoomsFilter.getDefault(
        userId as string,
        RoomSearchArea.AIAgents,
      );
      const params = aiAgentsFilter.toUrlParams(userId as string, true);
      const path = getCategoryUrl(CategoryType.AIAgents);

      return window.DocSpace.navigate(`${path}?${params}`);
    }
    case FolderType.Archive: {
      const archiveFilter = RoomsFilter.getDefault(
        userId as string,
        RoomSearchArea.Archive,
      );
      archiveFilter.searchArea = RoomSearchArea.Archive;
      const params = archiveFilter.toUrlParams(userId as string, true);
      const path = getCategoryUrl(CategoryType.Archive);

      return window.DocSpace.navigate(`${path}?${params}`);
    }
    default: {
      if (!pathPart) {
        return;
      }

      if (pathPart.id === roomsFolderId) {
        return window.DocSpace.navigate("/");
      }

      const filter = FilesFilter.getDefault();

      // FilesFilter.folder is typed `string` but numeric
      // folder ids are assigned at runtime; erased cast keeps the value.
      filter.folder = pathPart.id as unknown as string;

      if (userId) {
        const filterObj = getUserFilter(`${FILTER_DOCUMENTS}=${userId}`);

        if (myFolderId === pathPart.id) {
          if (filterObj?.sortBy) filter.sortBy = filterObj.sortBy;
          if (filterObj?.sortOrder) filter.sortOrder = filterObj.sortOrder;
        }
      }

      const isPublic = self.publicRoomStore.isPublicRoom;
      if (isPublic) {
        filter.key = self.publicRoomStore.publicRoomKey;
      }

      const params = filter.toUrlParams();

      const categoryType = isPublic
        ? CategoryType.PublicRoom
        : getCategoryTypeByFolderType(rootFolderType, pathPart.id);

      const path = getCategoryUrl(categoryType, pathPart.id);

      return window.DocSpace.navigate(`${path}?${params}`);
    }
  }
}
