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

import axios from "axios";
import { runInAction } from "mobx";
import api from "@docspace/shared/api";
import {
  FilterType,
  FolderType,
  RoomsType,
  RoomSearchArea,
  SearchArea,
} from "@docspace/shared/enums";
import {
  frameCallEvent,
  getCategoryType,
  isPublicRoom,
} from "@docspace/shared/utils/common";
import { isDesktop } from "@docspace/shared/utils";
import { CategoryType, EMPTY_ARRAY } from "@docspace/shared/constants";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import { FILTER_DOCUMENTS } from "@docspace/shared/utils/filterConstants";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getI18n } from "react-i18next";

import {
  getCategoryUrl,
  getCategoryTypeByFolderType,
} from "SRC_DIR/helpers/utils";
import { setInfoPanelSelectedRoom } from "SRC_DIR/helpers/info-panel";

import type { Nullable, TPathParts } from "@docspace/shared/types";
import type { default as TFilesFilter } from "@docspace/shared/api/files/filter";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  NotFoundHttpCode,
  ForbiddenHttpCode,
  PaymentRequiredHttpCode,
  UnauthorizedHttpCode,
} from "./constants";
import type { THighlightState, TItem } from "./types";

import type { default as FilesStore } from "../FilesStore";

const { FilesFilter, RoomsFilter } = api;

// Module-level request guard used by fetchFilesImpl (moved verbatim from
// FilesStore, where it was only referenced by fetchFiles).
let requestCounter = 0;

// Network-fetch orchestration extracted from the FilesStore methods. These are
// side-effectful actions (not computeds), so they are moved verbatim into free
// functions taking the store instance as `self` — no reactivity implications.
// `noImplicitThis` guarantees every `this.` was rewritten to `self.`.
export function fetchFilesImpl(
  self: FilesStore,
  folderId: Nullable<number | string>,
  filter?: Nullable<TFilesFilter>,
  clearFilter = true,
  withSubfolders = false,
  clearSelection = true,
): Promise<unknown> {
  const { setSelectedNode } = self.treeFoldersStore;
  const { setIsIndexEditingMode } = self.indexingStore;

  setIsIndexEditingMode(false);

  const filterData = filter ? filter.clone() : FilesFilter.getDefault();
  // FilesFilter.folder is typed `string` but folder ids are
  // numbers or strings at runtime; erased casts keep the values.
  filterData.folder = folderId as string;

  if (
    folderId === "@my" &&
    self.userStore.user?.isVisitor &&
    !self.userStore.user?.hasPersonalFolder
  ) {
    const url = getCategoryUrl(CategoryType.Shared);
    // this early-return escapes with the void result of
    // navigate() while the method is otherwise Promise-returning; the
    // erased cast keeps the old JS value.
    return window.DocSpace.navigate(
      `${url}?${RoomsFilter.getDefault().toUrlParams()}`,
    ) as unknown as Promise<unknown>;
  }

  self.setIsErrorAIAgentNotAvailable(false);
  self.setIsErrorRoomNotAvailable(false);
  self.setIsLoadedFetchFiles(false);

  if (self.userStore.user?.id && !filter) {
    const filterObj = getUserFilter(
      `${FILTER_DOCUMENTS}=${self.userStore.user.id}`,
    );

    filterData.sortBy = filterObj.sortBy;
    filterData.sortOrder = filterObj.sortOrder;
  }

  filterData.page = 0;
  filterData.pageCount = 100;

  const defaultFilter = FilesFilter.getDefault();

  const { filterType, searchInContent } = filterData;

  if (!filterData.withSubfolders)
    filterData.withSubfolders = defaultFilter.withSubfolders;

  if (!searchInContent)
    filterData.searchInContent = defaultFilter.searchInContent;

  if (
    !Object.keys(FilterType).find(
      (key) => FilterType[key as keyof typeof FilterType] === filterType,
    )
  )
    filterData.filterType = defaultFilter.filterType;

  setSelectedNode([`${folderId}`]);

  self.filesController?.abort();
  self.roomsController?.abort();
  self.aiAgentsController?.abort();

  self.filesController = new AbortController();
  self.roomsController = null;
  self.aiAgentsController = null;

  let room: Nullable<TItem> = null;

  return api.files
    .getFolder(folderId as string, filterData, self.filesController.signal)
    .then(async (data) => {
      let newTotal = data.total;

      // fixed row loader if total and items length is different
      const itemsLength = data.folders.length + data.files.length;
      if (itemsLength < filterData.pageCount) {
        newTotal =
          filterData.page > 0
            ? itemsLength + self.files.length + self.folders.length
            : itemsLength;
      }

      filterData.total = newTotal;

      if (
        (data.current.roomType === RoomsType.PublicRoom ||
          data.current.roomType === RoomsType.FormRoom ||
          data.current.roomType === RoomsType.CustomRoom) &&
        !self.publicRoomStore.isPublicRoom &&
        !data.current.private
      ) {
        await self.publicRoomStore.getExternalLinks(data.current.id);
      }

      if (data.current.private) {
        const keys = self.userStore?.encryptionKeys;
        if (!Array.isArray(keys) || keys.length === 0) {
          toastr.warning(getI18n().t("Common:EncryptionKeysNotConfigured"));
        }

        // The room id may differ from data.current.id when navigating into
        // a sub-folder: pathParts[1] is the room, current is the sub-folder.
        const resolvedRoomId = data.pathParts?.[1]?.id ?? data.current.id;
        // Backfill envelopes for members who registered their keypair after
        // being invited (their old files are otherwise locked out).
        self.maybeBackfillEncryptedRoom(
          resolvedRoomId,
          data.current.security,
        );
      }

      if (
        data.current.roomType === RoomsType.AIRoom &&
        self.categoryType !== CategoryType.Chat
      ) {
        self.categoryType = CategoryType.Chat;
        filterData.searchArea = SearchArea.Active;
        const newUrl = getCategoryUrl(CategoryType.Chat, folderId);

        history.replaceState(
          null,
          "",
          `${newUrl}?${filterData.toUrlParams()}`,
        );
      }

      if (newTotal > 0) {
        const lastPage = filterData.getLastPage();

        if (filterData.page > lastPage) {
          filterData.page = lastPage;
          return self.fetchFiles(
            folderId,
            filterData,
            clearFilter,
            withSubfolders,
          );
        }
      }

      runInAction(() => {
        if (!self.publicRoomStore.isPublicRoom) {
          self.categoryType = getCategoryTypeByFolderType(
            data.current.rootFolderType,
            data.current.parentId,
          );
        }
      });

      const isPrivacyFolder =
        data.current.rootFolderType === FolderType.Privacy;

      let currentFolder: TItem = data.current;

      let isChatTab = false;

      let navigationPath = await Promise.all(
        data.pathParts.map(async (folder, idx) => {
          // FolderType is a ui-kit `const enum` and may
          // not be destructured (TS2475); the runtime object exists in the
          // babel/esbuild build, so the original statement is kept under a
          // suppression.
          // @ts-expect-error TS2475 — const enum destructuring, see above.
          const { Rooms, Archive, AIAgents } = FolderType;

          // if (
          //   data.current.providerKey &&
          //   data.current.rootFolderType === Rooms &&
          //   self.treeFoldersStore.myRoomsId
          // ) {
          //   folderId = self.treeFoldersStore.myRoomsId;
          // }

          const isCurrentFolder = data.current.id == folder.id;

          const folderInfo = isCurrentFolder
            ? data.current
            : { ...folder, id: folder.id };

          const { title, roomType, folderType } = folderInfo as TFolder &
            TPathParts;

          const isRootRoom =
            idx === 0 &&
            (data.current.rootFolderType === Rooms ||
              data.current.rootFolderType === Archive ||
              data.current.rootFolderType === AIAgents);

          let shared: boolean | undefined;
          let quotaLimit: number | undefined;
          let usedSpace: number | undefined;
          let external: boolean | undefined;
          let isPrivate: boolean | undefined;

          room = data.current;

          if (idx === 1) {
            if (!isCurrentFolder) {
              room = await api.files.getFolderInfo(folder.id);

              shared = room.shared;
              external = room.external;
              quotaLimit = room.quotaLimit;
              usedSpace = room.usedSpace;
            } else {
              setInfoPanelSelectedRoom({
                ...data.current,
                isRoom: true,
              } as unknown as TRoom);
            }

            isPrivate = room.private;

            const { mute } = room;

            runInAction(() => {
              self.isMuteCurrentRoomNotifications = mute as boolean;
            });
          }

          const isTemplatesFolder =
            data.current.rootFolderType === FolderType.RoomTemplates;

          const isRootTemplates =
            idx === 0 &&
            data.current.rootFolderType === FolderType.RoomTemplates;

          return {
            id: folder.id,
            title,
            isRoom: !!roomType,
            roomType,
            isRootRoom,
            isTemplatesFolder,
            shared,
            external,
            quotaLimit,
            usedSpace,
            isRootTemplates,
            folderType,
            private: isPrivate,
          };
        }),
      ).then((res) => {
        return res
          .filter(
            (item) =>
              item.folderType !== FolderType.Knowledge &&
              item.folderType !== FolderType.ResultStorage,
          )
          .filter((item, index, arr) => {
            return index !== arr.length - 1;
          })
          .reverse();
      });

      if (
        currentFolder.type === FolderType.ResultStorage ||
        currentFolder.type === FolderType.Knowledge
      ) {
        if (currentFolder.type === FolderType.Knowledge) {
          self.aiRoomStore.setKnowledgeId(currentFolder.id as number);
          self.aiRoomStore.setResultId(null);
        } else if (currentFolder.type === FolderType.ResultStorage) {
          self.aiRoomStore.setKnowledgeId(null);
          self.aiRoomStore.setResultId(currentFolder.id as number);
        }

        // `room` is assigned inside the Promise.all map
        // above; the non-null assertions keep the old unchecked access.
        const aiRoom: TItem =
          room!.id === currentFolder.parentId
            ? room!
            : await api.files.getFolderInfo(currentFolder.parentId as number);

        self.aiRoomStore.setCurrentTab(
          currentFolder.type === FolderType.Knowledge
            ? "knowledge"
            : "result",
        );

        navigationPath = navigationPath.filter(
          (item) => item.folderType !== FolderType.AIAgent,
        );

        currentFolder = {
          ...aiRoom,
          security: {
            ...currentFolder.security,
            Create:
              currentFolder.security!.Create &&
              !self.settingsStore.aiConfig?.aiReadyNeedReset,
            Download: aiRoom.security!.Download,
            EditAccess:
              currentFolder.security!.security?.EditAccess &&
              !self.settingsStore.aiConfig?.aiReadyNeedReset,
            EditRoom:
              currentFolder.security!.security?.EditRoom &&
              !self.settingsStore.aiConfig?.aiReadyNeedReset,
            ChangeOwner:
              currentFolder.security!.security?.ChangeOwner &&
              !self.settingsStore.aiConfig?.aiReadyNeedReset,
            Delete: aiRoom.security!.Delete,

            Pin: aiRoom.security!.Pin,
            UseChat: aiRoom.security!.UseChat,
          },
          isRoom: true,
          type: currentFolder.type,
        };
      } else if (currentFolder.roomType === RoomsType.AIRoom) {
        isChatTab = true;
        self.aiRoomStore.setCurrentTab("chat");
        self.aiRoomStore.setKnowledgeId(null);
        self.aiRoomStore.setResultId(null);
      } else if (currentFolder.rootFolderType === FolderType.AIAgents) {
        const parentId = navigationPath.find((item) => item.isRoom);
        const aiRoom: TItem = await api.files.getFolderInfo(parentId!.id);

        currentFolder = {
          ...currentFolder,
          security: {
            ...currentFolder.security,
            UseChat: aiRoom.security!.UseChat,
          },
        };

        self.aiRoomStore.setKnowledgeId(null);
        self.aiRoomStore.setResultId(null);
        self.aiRoomStore.setCurrentTab("result");
      } else {
        self.aiRoomStore.setKnowledgeId(null);
        self.aiRoomStore.setResultId(null);
        self.aiRoomStore.setCurrentTab(null);
      }

      runInAction(() => {
        if (self.isPreview) {
          // save filter for after closing preview change url
          self.setTempFilter(filterData);
        } else {
          self.setFilesFilter(filterData, folderId); // TODO: FILTER
        }

        self.selectedFolderStore.setSelectedFolder({
          folders: data.folders,
          isRoom: !!data.current.roomType,
          ...currentFolder,

          inRoom: !!data.current.inRoom,
          isTemplate:
            data.current.rootFolderType === FolderType.RoomTemplates,
          pathParts: data.pathParts,
          navigationPath,
          rootRoomId: data.pathParts[1]
            ? data.pathParts[1].id
            : (currentFolder.id as number),
          ...{ new: data.new },
          // type,
        });

        const isEmptyList = [...data.folders, ...data.files].length === 0;

        if (filter && isEmptyList) {
          const { authorType, roomId, search } = filter;
          const isFiltered =
            authorType ||
            roomId ||
            search ||
            filter.withSubfolders ||
            filter.filterType ||
            filter.searchInContent ||
            filter.location;

          if (isFiltered) {
            self.setIsEmptyPage(false);
          } else {
            self.setIsEmptyPage(isEmptyList);
          }
        } else {
          self.setIsEmptyPage(isEmptyList);
        }

        if (!isChatTab) {
          self.setFolders(
            isPrivacyFolder && !isDesktop() ? EMPTY_ARRAY : data.folders,
          );
          self.setFiles(
            isPrivacyFolder && !isDesktop() ? EMPTY_ARRAY : data.files,
          );
        }
      });

      if (clearFilter) {
        if (clearSelection) {
          // Find not processed
          const tempSelection = self.selection.filter(
            (f) => !self.activeFiles.find((elem) => elem.id === f.id),
          );
          const tempBuffer =
            self.bufferSelection &&
            self.activeFiles.find(
              (elem) => elem.id === self.bufferSelection!.id,
            ) == null
              ? self.bufferSelection
              : null;

          // console.log({ tempSelection, tempBuffer });

          // Clear all selections
          self.setSelected("close");

          // TODO: see bug 63479
          if (self.selectedFolderStore?.id === folderId) {
            // Restore not processed
            tempSelection.length && self.setSelection(tempSelection);
            tempBuffer && self.setBufferSelection(tempBuffer);
          }
        }
      }

      const selectedFolder = {
        selectedFolder: { ...self.selectedFolderStore },
      };

      if (self.createdItem) {
        const newItem = self.filesList.find(
          (item) => item.id === self.createdItem!.id,
        );

        if (newItem) {
          self.setBufferSelection(newItem);
          self.setScrollToItem({
            id: newItem.id as number,
            type: self.createdItem!.type,
          });
        }

        self.setCreatedItem(null);
      }

      if (isPublicRoom()) {
        return Promise.resolve(data);
      }
      return Promise.resolve(selectedFolder);
    })
    .catch((err) => {
      // CurrentTariffStatusStore has no setPortalTariff
      // member (renamed to fetchPortalTariff upstream) — the old JS throws
      // here on a 402; the erased cast preserves that behavior.
      if (err?.response?.status === 402)
        (
          self.currentTariffStatusStore as unknown as {
            setPortalTariff: () => void;
          }
        ).setPortalTariff();

      const isThirdPartyError = Number.isNaN(+(folderId as string));

      const isUserError = [
        NotFoundHttpCode,
        ForbiddenHttpCode,
        PaymentRequiredHttpCode,
        UnauthorizedHttpCode,
      ].includes(err?.response?.status);

      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);

        throw err;
      }

      if (requestCounter > 0 && !isThirdPartyError && !isUserError) return;

      requestCounter++;

      if (isUserError && !isThirdPartyError) {
        if (isPublicRoom()) {
          frameCallEvent({ event: "onNotFound" });

          return Promise.reject(err);
        }

        if (err?.response?.status === NotFoundHttpCode) {
          frameCallEvent({ event: "onNotFound" });
        }

        if (err?.response?.status === ForbiddenHttpCode) {
          frameCallEvent({ event: "onNoAccess" });
        }

        const categoryType = getCategoryType(window.location);

        if (
          categoryType === CategoryType.Chat ||
          categoryType === CategoryType.AIAgent
        ) {
          self.setIsErrorAIAgentNotAvailable(true);
        } else {
          self.setIsErrorRoomNotAvailable(true);
        }
      } else {
        toastr.error(err);
        if (isThirdPartyError) {
          const userId = self.userStore?.user?.id;
          const searchArea = window.DocSpace.location.pathname.includes(
            "shared",
          )
            ? (filter!.searchArea as unknown as RoomSearchArea) ===
              RoomSearchArea.Templates
              ? RoomSearchArea.Templates
              : RoomSearchArea.Active
            : RoomSearchArea.Archive;

          return window.DocSpace.navigate(
            `${window.DocSpace.location.pathname}?${RoomsFilter.getDefault(userId, searchArea).toUrlParams(userId, true)}`,
          );
        }
      }
    })
    .finally(() => {
      self.setIsLoadedFetchFiles(true);

      self.clientLoadingStore.setIsSectionHeaderLoading(false);
      self.clientLoadingStore.setIsSectionFilterLoading(false);

      if (
        (window?.DocSpace?.location?.state as THighlightState)
          ?.highlightFileId
      ) {
        self.setHighlightFile({
          highlightFileId: (window.DocSpace.location.state as THighlightState)
            .highlightFileId,
          isFileHasExst: (window.DocSpace.location.state as THighlightState)
            .isFileHasExst,
        });
      }
    });
}
