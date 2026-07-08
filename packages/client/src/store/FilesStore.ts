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
import { match } from "ts-pattern";
import equal from "fast-deep-equal";
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import {
  AnalyticsEvents,
  FileType,
  FilterType,
  FolderType,
  FileStatus,
  RoomsType,
  RoomsProviderType,
  FilterKeys,
  RoomSearchArea,
  SearchArea,
} from "@docspace/shared/enums";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";

import {
  isLockedSharedRoom,
  RoomsTypes,
  isDesktop,
  isMobile,
  isSystemFolder,
} from "@docspace/shared/utils";
import { getViewForCurrentRoom } from "@docspace/shared/utils/getViewForCurrentRoom";
import { isSameEntity } from "@docspace/shared/utils/isSameEntity";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  updateTempContent,
  isPublicRoom,
  getDaysRemaining,
  frameCallEvent,
  getCategoryType,
  getFileExtension,
} from "@docspace/shared/utils/common";
import {
  resolveDisplayTitle,
  subscribeFilenameCache,
} from "@docspace/shared/services/encryption/filename-cache";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  ensureDecryptedFilename,
  recoverEncryptedFilenames,
} from "@docspace/shared/services/private-room/encrypted-filename-recovery";
import { backfillEncryptedFilesForRoomMembers } from "@docspace/shared/services/private-room/room-encryption";

import { toastr } from "@docspace/ui-kit/components/toast";
import { getI18n } from "react-i18next";
import config from "PACKAGE_FILE";
import {
  LOADER_TIMEOUT,
  MEDIA_VIEW_URL,
  ROOMS_PROVIDER_TYPE_NAME,
  thumbnailStatuses,
  CategoryType,
  EMPTY_ARRAY,
} from "@docspace/shared/constants";

import {
  getCategoryUrl,
  getCategoryTypeByFolderType,
} from "SRC_DIR/helpers/utils";
import { refreshInfoPanel } from "SRC_DIR/helpers/info-panel";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";

import debounce from "lodash.debounce";
import Queue from "queue-promise";
import {
  mappingActiveItems,
  removeOptions,
  removeSeparator,
} from "SRC_DIR/helpers/filesUtils";
import { setInfoPanelSelectedRoom } from "SRC_DIR/helpers/info-panel";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import {
  getUserFilter,
  setUserFilter,
} from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ARCHIVE_ROOM,
  FILTER_DOCUMENTS,
  FILTER_RECENT,
  FILTER_FAVORITES,
  FILTER_ROOM_DOCUMENTS,
  FILTER_SHARE,
  FILTER_SHARED_ROOM,
  FILTER_TEMPLATES_ROOM,
  FILTER_TRASH,
} from "@docspace/shared/utils/filterConstants";
import { isRoom as isRoomUtil } from "@docspace/shared/utils/typeGuards";

import { showCreatedPDFFormDialog } from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";

import type { Nullable, TViewAs, ValueOf } from "@docspace/shared/types";
import type {
  TFile,
  TFolder,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TGetRooms, TRoom } from "@docspace/shared/api/rooms/types";
import type { TPathParts } from "@docspace/shared/types";
import type { VectorizationStatus } from "@docspace/shared/enums";
import type {
  TEditFileData,
  TOptSocket,
  TUnmappedSocketListener,
} from "@docspace/ui-kit/utils/socket";
import type { default as TFilesFilter } from "@docspace/shared/api/files/filter";
import type { default as TRoomsFilter } from "@docspace/shared/api/rooms/filter";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import type SelectedFolderStore from "./SelectedFolderStore";
import type { TNavigationPath } from "./SelectedFolderStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type FilesSettingsStore from "./FilesSettingsStore";
import type { ThirdPartyStore } from "./ThirdPartyStore";
import type AccessRightsStore from "./AccessRightsStore";
import type ClientLoadingStore from "./ClientLoadingStore";
import type PluginStore from "./PluginStore";
import type PublicRoomStore from "./PublicRoomStore";
import type IndexingStore from "./IndexingStore";
import type AiRoomStore from "./AiRoomStore";
import type DialogsStore from "./DialogsStore";

import {
  PersistenceKeys,
  getPersistedString,
  setPersistedString,
} from "./utils/persistence";

import {
  NotFoundHttpCode,
  ForbiddenHttpCode,
  PaymentRequiredHttpCode,
  UnauthorizedHttpCode,
  THUMBNAILS_CACHE,
} from "./filesStore/constants";
import type {
  TActiveItem,
  TClientConfigWithPdfViewer,
  TCreatedItem,
  THighlightFile,
  THighlightState,
  TItem,
  TRemovedRoomsTypes,
} from "./filesStore/types";

export type { TItem, TItemSecurity } from "./filesStore/types";

const { FilesFilter, RoomsFilter } = api;
const storageViewAs = getPersistedString(PersistenceKeys.viewAs);

let requestCounter = 0;

let timerId: ReturnType<typeof setTimeout> | null;

class FilesStore {
  authStore: AuthStore;

  userStore: UserStore;

  currentTariffStatusStore: CurrentTariffStatusStore;

  selectedFolderStore: SelectedFolderStore;

  treeFoldersStore: TreeFoldersStore;

  filesSettingsStore: FilesSettingsStore;

  thirdPartyStore: ThirdPartyStore;

  clientLoadingStore: ClientLoadingStore;

  accessRightsStore: AccessRightsStore;

  publicRoomStore: PublicRoomStore;

  settingsStore: SettingsStore;

  currentQuotaStore: CurrentQuotasStore | undefined;

  indexingStore: IndexingStore;

  pluginStore: PluginStore;

  // MobX dependency for getFilesListItems so a cache write triggers re-render.
  encryptedFilenameCacheVersion = 0;

  // the persisted view value is trusted to be a valid TViewAs
  // (it is only ever written via setViewAs).
  privateViewAs = (
    !isDesktop() && storageViewAs !== "tile" ? "row" : storageViewAs || "table"
  ) as TViewAs;

  dragging = false;

  isInit = false;

  isUpdatingRowItem = false;

  passwordEntryProcess = false;

  tooltipPageX = 0;

  tooltipPageY = 0;

  startDrag = false;

  alreadyFetchingRooms = false;

  files: TFile[] = EMPTY_ARRAY;

  folders: (TFolder | TRoom)[] = EMPTY_ARRAY;

  _selection: TItem[] = [];

  bufferSelection: Nullable<TItem> = null;

  selected = "close";

  filter = FilesFilter.getDefault({ pageCount: 100 });

  roomsFilter = RoomsFilter.getDefault();

  categoryType = getCategoryType(window.location);

  loadTimeout = null;

  hotkeyCaret: Nullable<TItem> = null;

  hotkeyCaretStart: Nullable<TItem> = null;

  activeFiles: TActiveItem[] = EMPTY_ARRAY;

  activeFolders: TActiveItem[] = EMPTY_ARRAY;

  firstElemChecked = false;

  headerBorder = false;

  enabledHotkeys = true;

  createdItem: TCreatedItem = null;

  scrollToItem: TCreatedItem = null;

  roomCreated = false;

  isLoadingFilesFind = false;

  pageItemsLength: Nullable<number> = null;

  isHidePagination = false;

  trashIsEmpty = false;

  mainButtonMobileVisible = true;

  filesIsLoading = false;

  isEmptyPage = true;

  isLoadedFetchFiles = false;

  tempActionFilesIds: (number | string)[] = EMPTY_ARRAY;

  tempActionFoldersIds: (number | string)[] = EMPTY_ARRAY;

  isErrorRoomNotAvailable = false;

  isErrorAIAgentNotAvailable = false;

  roomsController: Nullable<AbortController> = null;

  filesController: Nullable<AbortController> = null;

  aiAgentsController: Nullable<AbortController> = null;

  clearSearch = false;

  isLoadedEmptyPage = false;

  isMuteCurrentRoomNotifications = false;

  isPreview = false;

  tempFilter: Nullable<TFilesFilter> = null;

  highlightFile: THighlightFile = {};

  thumbnails: Set<string> = new Set();

  _backfilledEncryptedRooms: Set<number | string> = new Set();

  movingInProgress = false;

  createNewFilesQueue = new Queue({
    concurrent: 5,
    interval: 500,
    start: true,
  });

  hotkeysClipboard: TItem[] = EMPTY_ARRAY;

  mainButtonVisible = false;

  // initialized null, always assigned in the constructor —
  // the erased cast keeps the exact old JS runtime shape (own `null` field
  // observed by makeAutoObservable before assignment).
  aiRoomStore: AiRoomStore = null as unknown as AiRoomStore;

  // Narrow interface (Track F): attached post-construction in
  // store/index.ts (mutual reference); only `roomGroups` is read here.
  dialogsStore: Nullable<Pick<DialogsStore, "roomGroups">> = null;

  arrRoomGroups: unknown[] = [];

  // created by a constructor assignment before
  // makeAutoObservable in the old JS (never a class field) — `declare`
  // keeps that runtime shape.
  declare isEditor: boolean;

  declare fileActionStore?: { extension?: string; title?: string };

  constructor(
    authStore: AuthStore,
    selectedFolderStore: SelectedFolderStore,
    treeFoldersStore: TreeFoldersStore,
    filesSettingsStore: FilesSettingsStore,
    thirdPartyStore: ThirdPartyStore,
    accessRightsStore: AccessRightsStore,
    clientLoadingStore: ClientLoadingStore,
    pluginStore: PluginStore,
    publicRoomStore: PublicRoomStore,
    userStore: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    settingsStore: SettingsStore,
    indexingStore: IndexingStore,
    aiRoomStore: AiRoomStore,
  ) {
    const pathname = window.location.pathname.toLowerCase();
    this.isEditor = pathname.indexOf("doceditor") !== -1;

    makeAutoObservable(this);
    this.authStore = authStore;
    this.userStore = userStore;
    this.selectedFolderStore = selectedFolderStore;
    this.treeFoldersStore = treeFoldersStore;
    this.filesSettingsStore = filesSettingsStore;
    this.thirdPartyStore = thirdPartyStore;
    this.accessRightsStore = accessRightsStore;
    this.clientLoadingStore = clientLoadingStore;
    this.pluginStore = pluginStore;
    this.publicRoomStore = publicRoomStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.settingsStore = settingsStore;
    this.indexingStore = indexingStore;
    this.aiRoomStore = aiRoomStore;

    // Singleton lifetime; never unsubscribed.
    subscribeFilenameCache(() => {
      runInAction(() => {
        this.encryptedFilenameCacheVersion += 1;
      });
    });

    SocketHelper?.on(SocketEvents.ChangedQuotaUsedValue, (res) => {
      const { isFrame } = this.settingsStore;

      if (res && res.featureId === "room" && isFrame) {
        this.fetchFiles(
          this.selectedFolderStore.id,
          this.filter,
          false,
          false,
          false,
        );
      }
    });

    SocketHelper?.on(SocketEvents.ModifyFolder, async (opt) => {
      const { socketSubscribers } = SocketHelper!;

      if (opt && opt.data) {
        const data = JSON.parse(opt.data);

        const pathParts = data.folderId
          ? `DIR-${data.folderId}`
          : `DIR-${data.parentId}`;

        if (
          !socketSubscribers.has(pathParts) &&
          !socketSubscribers.has(`DIR-${data.id}`)
        ) {
          console.log("[WS] s:modify-folder: SKIP UNSUBSCRIBED", { data });
          return;
        }
      }

      console.log("[WS] s:modify-folder", opt);

      if (opt?.cmd === "create" && !this.showNewFilesInList) {
        const newFilter = this.filter;
        newFilter.total += 1;
        this.setFilter(newFilter);
        return;
      }

      if (!this.clientLoadingStore.isLoading)
        switch (opt?.cmd) {
          case "create":
            this.wsModifyFolderCreate(opt);
            break;
          case "update":
            this.wsModifyFolderUpdate(opt);
            break;
          case "delete":
            this.wsModifyFolderDelete(opt);
            break;
          default:
            break;
        }

      this.treeFoldersStore.updateTreeFoldersItem(opt);
    });

    SocketHelper?.on(SocketEvents.MarkAsNewFolder, ({ folderId, count }) => {
      const { socketSubscribers } = SocketHelper!;
      const pathParts = `DIR-${folderId}`;

      if (!socketSubscribers.has(pathParts)) return;

      console.log(`[WS] markasnew-folder ${folderId}:${count}`);

      const foundIndex = (folderId &&
        this.folders.findIndex((x) => x.id === folderId)) as number;

      const treeFoundIndex = (folderId &&
        this.treeFoldersStore.treeFolders.findIndex(
          (x) => x.id === folderId,
        )) as number;
      if (foundIndex === -1 && treeFoundIndex === -1) return;

      runInAction(() => {
        if (foundIndex > -1)
          this.folders[foundIndex].new = count >= 0 ? count : 0;
        if (treeFoundIndex > -1) this.treeFoldersStore.fetchTreeFolders();
      });
    });

    SocketHelper?.on(SocketEvents.MarkAsNewFile, ({ fileId, count }) => {
      const { socketSubscribers } = SocketHelper!;
      const pathParts = `FILE-${fileId}`;

      if (!socketSubscribers.has(pathParts)) return;

      console.log(`[WS] markasnew-file ${fileId}:${count}`);

      const foundIndex = (fileId &&
        this.files.findIndex((x) => x.id === fileId)) as number;

      this.treeFoldersStore.fetchTreeFolders();

      if (foundIndex == -1) return;

      this.updateFileStatus(
        foundIndex,
        count > 0
          ? this.files[foundIndex].fileStatus | FileStatus.IsNew
          : this.files[foundIndex].fileStatus & ~FileStatus.IsNew,
      );
    });

    // WAIT FOR RESPONSES OF EDITING FILE
    SocketHelper?.on(SocketEvents.StartEditFile, (data) => {
      const fileId = typeof data === "object" ? data.fileId : data;
      const editingBy = typeof data === "object" ? data.editingBy : undefined;

      const { socketSubscribers } = SocketHelper!;
      const pathParts = `FILE-${fileId}`;

      if (!socketSubscribers.has(pathParts)) return;

      const foundIndex = this.files.findIndex((x) => x.id === fileId);
      if (foundIndex == -1) return;

      console.log(
        `[WS] s:start-edit-file`,
        fileId,
        this.files[foundIndex].title,
      );

      this.updateSelectionStatus(
        fileId,
        this.files[foundIndex].fileStatus | FileStatus.IsEditing,
        true,
      );

      this.updateFileStatus(
        foundIndex,
        this.files[foundIndex].fileStatus | FileStatus.IsEditing,
      );

      this.updateFileLiveEditingBy(foundIndex, editingBy);
    });

    SocketHelper?.on(SocketEvents.ModifyRoom, (option) => {
      // the ui-kit TOptSocket.cmd union does not include
      // "create-form" (ui-kit is a separate submodule); the erased cast
      // keeps the original switch.
      switch (option.cmd as string) {
        case "create-form":
          setTimeout(() => this.wsCreatedPDFForm(option), LOADER_TIMEOUT * 2);
          break;

        default:
          break;
      }
    });

    SocketHelper?.on(
      SocketEvents.ChaneFolderAccessRights,
      // ChaneFolderAccessRights is not mapped in the ui-kit
      // TListenEventCallbackMap (falls back to a zero-arg listener type);
      // the erased cast keeps the original payload-taking callback.
      ((option: TOptSocket) => {
        this.wsChangeFolderAccessRights(option);
      }) as unknown as TUnmappedSocketListener,
    );

    SocketHelper?.on(SocketEvents.StopEditFile, (data) => {
      const fileId = typeof data === "object" ? data.fileId : data;

      const { socketSubscribers } = SocketHelper!;
      const pathParts = `FILE-${fileId}`;

      if (!socketSubscribers.has(pathParts)) return;

      const foundIndex = this.files.findIndex((x) => x.id === fileId);

      if (foundIndex == -1) return;
      const foundFile = this.files[foundIndex];

      console.log(`[WS] s:stop-edit-file`, fileId, foundFile.title);

      this.updateSelectionStatus(
        fileId,
        foundFile.fileStatus & ~FileStatus.IsEditing,
        false,
      );

      this.updateFileStatus(
        foundIndex,
        foundFile.fileStatus & ~FileStatus.IsEditing,
      );

      this.updateFileLiveEditingBy(foundIndex, undefined);

      this.getFileInfo(fileId, foundFile.requestToken);
      this.createThumbnail(foundFile);
    });

    this.createNewFilesQueue.on("resolve", this.onResolveNewFile);
  }

  get selection() {
    return this._selection;
  }

  set selection(value: TItem[]) {
    if (equal(value, this._selection)) return;

    this._selection = value;
  }

  onResolveNewFile = ({ fileInfo }: { fileInfo?: TFile }) => {
    if (!fileInfo) return;

    // console.log("onResolveNewFiles", { fileInfo });

    if (this.files.findIndex((x) => x.id === fileInfo.id) > -1) return;

    if (
      this.selectedFolderStore.id !== fileInfo.folderId &&
      this.aiRoomStore.knowledgeId !== fileInfo.folderId &&
      this.aiRoomStore.resultId !== fileInfo.folderId &&
      this.selectedFolderStore.rootFolderType !== FolderType.Recent &&
      this.selectedFolderStore.rootFolderType !== FolderType.Favorites
    )
      return;

    console.log("[WS] create new file", { fileInfo });

    const newFiles = [fileInfo, ...this.files];

    const newFilter = this.filter;
    newFilter.total += 1;

    runInAction(() => {
      this.setFilter(newFilter);
      this.setFiles(newFiles);
    });

    this.debouncefetchTreeFolders();
  };

  debouncefetchTreeFolders = debounce(() => {
    this.treeFoldersStore.fetchTreeFolders();
  }, 1000);

  debounceRemoveFiles = debounce(() => {
    this.removeFiles(this.tempActionFilesIds);
  }, 1000);

  debounceRemoveFolders = debounce(() => {
    this.removeFiles(null, this.tempActionFoldersIds);
  }, 1000);

  wsModifyFolderCreate = async (opt?: TOptSocket) => {
    if (opt?.type === "file" && opt?.id) {
      const foundIndex = this.getFileIndex(opt?.id);

      // several socket payload reads below keep the old
      // unchecked-crash behavior via erased casts / non-null assertions
      // (JSON.parse of possibly-undefined data, user possibly null).
      const file = JSON.parse(opt?.data as string);

      if (
        this.selectedFolderStore.id !== file.folderId &&
        this.aiRoomStore.knowledgeId !== file.folderId &&
        this.aiRoomStore.resultId !== file.folderId
      ) {
        const movedToIndex = this.getFolderIndex(file.folderId);
        if (movedToIndex > -1) this.folders[movedToIndex].filesCount++;
        return;
      }

      // To update a file version
      if (foundIndex > -1) {
        if (
          this.files[foundIndex].version !== file.version ||
          this.files[foundIndex].versionGroup !== file.versionGroup
        ) {
          this.files[foundIndex].version = file.version;
          this.files[foundIndex].versionGroup = file.versionGroup;
        }

        const oldFile = this.files[foundIndex];
        const newFile = await this.getFileInfo(
          file.id,
          file.requestToken ?? oldFile.requestToken,
          true,
        ).catch(() => ({ ...oldFile, ...file }));

        const [fileItem] = this.getFilesListItems([newFile]);

        this.checkSelection(fileItem);
      }

      if (foundIndex > -1) return;

      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: AnalyticsEvents.FileCreated,
        id: file.id,
        parentId: file.folderId,
        file_type: getFileExtension(file.title).replace(".", ""),
      });

      this.selectedFolderStore.setFilesCount(
        this.selectedFolderStore.filesCount + 1,
      );

      setTimeout(() => {
        if (this.getFileIndex(file.id) > -1) {
          // console.log("Skip in timeout");
          return null;
        }

        this.createNewFilesQueue.enqueue((() => {
          if (this.getFileIndex(file.id) > -1) {
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
      this.selectedFolderStore.setFoldersCount(
        this.selectedFolderStore.foldersCount + 1,
      );

      const foundIndex = this.folders.findIndex((x) => x.id == opt?.id);

      if (foundIndex > -1) return;

      const folder = JSON.parse(opt?.data as string);

      if (this.selectedFolderStore.id != folder.parentId) {
        const movedToIndex = this.getFolderIndex(folder.parentId);
        if (movedToIndex > -1) this.folders[movedToIndex].foldersCount++;
      }

      if (
        this.selectedFolderStore.id != folder.parentId ||
        (folder.roomType &&
          folder.createdBy.id === this.userStore.user!.id &&
          this.roomCreated)
      ) {
        return (this.roomCreated = false);
      }

      const folderInfo = await api.files.getFolderInfo(folder.id);

      console.log("[WS] create new folder", folderInfo.id, folderInfo.title);

      if (!folderInfo || folderInfo.parentId !== this.selectedFolderStore.id) {
        console.log("Skip UNSUBSCRIBED folder creation");
        return;
      }

      const newFolders = [folderInfo, ...this.folders];

      const newFilter = this.filter;
      newFilter.total += 1;

      runInAction(() => {
        this.setFilter(newFilter);
        this.setFolders(newFolders);
      });
    }
  };

  wsModifyFolderUpdate = async (opt?: TOptSocket) => {
    if (opt?.type === "file" && opt?.data) {
      const file = JSON.parse(opt?.data);

      if (!file || !file.id) return;

      const fileInfo = await this.getFileInfo(file.id, file.requestToken); // this.setFile(file);
      console.log("[WS] update file", file.id, file.title);

      const [newFile] = this.getFilesListItems([fileInfo]);

      this.checkSelection(newFile);
    } else if (opt?.type === "folder" && opt?.data) {
      const folder = JSON.parse(opt?.data);
      if (!folder || !folder.id) return;

      this.refreshFolder(folder.id);
    }
  };

  refreshFolder = (id: number | string) => {
    api.files
      .getFolderInfo(id)
      .then((response) => {
        const folderInfo = {
          isFolder: true,
          isRoom: isRoomUtil(response),
          ...response,
        };

        const [newFolder] = this.getFilesListItems([folderInfo]);

        console.log("[WS] update folder", newFolder.id, newFolder.title);

        if (this.selection?.length) {
          const foundIndex = this.selection?.findIndex(
            (x) => x.id === newFolder.id,
          );
          if (foundIndex > -1) {
            runInAction(() => {
              this.selection[foundIndex] = newFolder;
            });
          }
        }

        if (this.bufferSelection) {
          if (
            this.bufferSelection.id === newFolder.id &&
            (this.bufferSelection.isFolder || this.bufferSelection.isRoom)
          ) {
            this.setBufferSelection(newFolder);
          }
        }

        const navigationPath = [...this.selectedFolderStore.navigationPath];
        const pathParts = [...this.selectedFolderStore.pathParts];

        const idx = navigationPath.findIndex((p) => p.id === newFolder.id);

        if (idx !== -1) {
          navigationPath[idx].title = newFolder?.title as string;
        }

        if (folderInfo.id === this.selectedFolderStore.id) {
          this.selectedFolderStore.setSelectedFolder({
            ...folderInfo,
            navigationPath,
            pathParts,
          });

          setInfoPanelSelectedRoom(newFolder as TRoom, true);
        }

        this.setFolder(folderInfo);

        refreshInfoPanel();
      })
      .catch(() => {
        // console.log("Folder deleted")
      });
  };

  wsModifyFolderDelete = (opt?: TOptSocket) => {
    const { recentFolderId, favoritesFolderId } = this.treeFoldersStore;
    const data = opt?.data && JSON.parse(opt.data);

    // Skip when removing in recent or favorites but selected folder is not recent or favorites
    if (
      (data?.folderId === recentFolderId &&
        this.selectedFolderStore.id !== recentFolderId) ||
      (data?.folderId === favoritesFolderId &&
        this.selectedFolderStore.id !== favoritesFolderId) ||
      (data?.parentId === favoritesFolderId &&
        this.selectedFolderStore.id !== favoritesFolderId)
    ) {
      return;
    }

    if (opt?.type === "file" && opt?.id) {
      const foundIndex = this.files.findIndex((x) => x.id === opt?.id);
      if (foundIndex == -1) return;

      const foundFile = this.files[foundIndex];

      this.selectedFolderStore.setFilesCount(
        this.selectedFolderStore.filesCount - 1,
      );

      console.log("[WS] delete file", foundFile.id, foundFile.title);

      // this.setFiles(
      //   this.files.filter((_, index) => {
      //     return index !== foundIndex;
      //   })
      // );

      // const newFilter = this.filter.clone();
      // newFilter.total -= 1;
      // this.setFilter(newFilter);

      const tempActionFilesIds = JSON.parse(
        JSON.stringify(this.tempActionFilesIds),
      );
      tempActionFilesIds.push(foundFile.id);

      this.setTempActionFilesIds(tempActionFilesIds);

      this.removeStaleItemFromSelection(foundFile);
      this.debounceRemoveFiles();

      // Hide pagination when deleting files
      runInAction(() => {
        this.isHidePagination = true;
      });

      runInAction(() => {
        if (
          this.files.length === 0 &&
          this.folders.length === 0 &&
          this.pageItemsLength! > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    } else if (opt?.type === "folder" && opt?.id) {
      const { isRoom, isTemplate, pathParts, rootFolderType } =
        this.selectedFolderStore;
      const foundIndex = this.folders.findIndex((x) => x.id === opt?.id);

      if (foundIndex === -1) {
        if (this.selectedFolderStore.id === opt.id) {
          frameCallEvent({ event: "onNotFound" });
        }

        return this.redirectToParent(
          opt,
          pathParts,
          isRoom,
          isTemplate,
          rootFolderType,
        );
      }

      const foundFolder = this.folders[foundIndex];

      this.selectedFolderStore.setFoldersCount(
        this.selectedFolderStore.foldersCount - 1,
      );

      console.log("[WS] delete folder", foundFolder.id, foundFolder.title);

      const tempActionFoldersIds = JSON.parse(
        JSON.stringify(this.tempActionFoldersIds),
      );
      tempActionFoldersIds.push(foundFolder.id);

      this.setTempActionFoldersIds(tempActionFoldersIds);
      this.removeStaleItemFromSelection(foundFolder);
      this.debounceRemoveFolders();

      runInAction(() => {
        this.isHidePagination = true;
      });

      runInAction(() => {
        if (
          this.files.length === 0 &&
          this.folders.length === 0 &&
          this.pageItemsLength! > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    }
  };

  wsCreatedPDFForm = (option: TOptSocket) => {
    if (!option.data) return;

    const file = JSON.parse(option.data);

    if (this.selectedFolderStore.id !== file.folderId) return;

    showCreatedPDFFormDialog(file, this.userStore.user!.id);
  };

  wsChangeFolderAccessRights = (option: TOptSocket) => {
    if (!option.data || !option.id) return;

    const folderId = option.id;
    const memberAccess = JSON.parse(option.data);

    if (this.selectedFolderStore.id !== folderId) return;
    if (!memberAccess[this.userStore.user!.id]) return;

    console.log("[WS] change folder access rights for current user", {
      folderId,
      memberAccess,
    });

    this.refreshFolder(folderId);
    this.refreshFiles();
  };

  redirectToParent = (
    opt: TOptSocket,
    pathParts: TPathParts[],
    isRoom: boolean,
    isTemplate: boolean,
    rootFolderType: Nullable<FolderType>,
  ) => {
    const removedId = opt.id;

    const includePathPartIndex = pathParts.findIndex(
      ({ id }) => id === removedId,
    );

    if (includePathPartIndex === -1 || this.treeFoldersStore.isPersonalReadOnly)
      return;

    if (isRoom && isTemplate) {
      const newRoomsFilter = RoomsFilter.getDefault();
      newRoomsFilter.searchArea = RoomSearchArea.Templates;
      return window.DocSpace.navigate(
        `/rooms/shared/filter?${newRoomsFilter.toUrlParams()}`,
      );
    }
    const pathPart = pathParts[includePathPartIndex - 1];
    const { myFolderId, roomsFolderId } = this.treeFoldersStore;
    const userId = this.userStore.user && this.userStore.user.id;

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

        const isPublic = this.publicRoomStore.isPublicRoom;
        if (isPublic) {
          filter.key = this.publicRoomStore.publicRoomKey;
        }

        const params = filter.toUrlParams();

        const categoryType = isPublic
          ? CategoryType.PublicRoom
          : getCategoryTypeByFolderType(rootFolderType, pathPart.id);

        const path = getCategoryUrl(categoryType, pathPart.id);

        return window.DocSpace.navigate(`${path}?${params}`);
      }
    }
  };

  setIsErrorRoomNotAvailable = (state: boolean) => {
    this.isErrorRoomNotAvailable = state;
  };

  setIsErrorAIAgentNotAvailable = (state: boolean) => {
    this.isErrorAIAgentNotAvailable = state;
  };

  setTempActionFilesIds = (tempActionFilesIds: (number | string)[]) => {
    this.tempActionFilesIds = tempActionFilesIds;
  };

  setTempActionFoldersIds = (tempActionFoldersIds: (number | string)[]) => {
    this.tempActionFoldersIds = tempActionFoldersIds;
  };

  setClearSearch = (clearSearch: boolean) => {
    this.clearSearch = clearSearch;
  };

  setIsPreview = (predicate: boolean) => {
    this.isPreview = predicate;
  };

  setTempFilter = (filter: Nullable<TFilesFilter>) => {
    this.tempFilter = filter;
  };

  setHighlightFile = (highlightFile: {
    highlightFileId?: number | string;
    isFileHasExst?: boolean;
  }) => {
    const { highlightFileId, isFileHasExst } = highlightFile;

    runInAction(() => {
      this.highlightFile = {
        id: highlightFileId,
        isExst: isFileHasExst,
      };
    });

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (Object.keys(highlightFile).length === 0) return;

    timerId = setTimeout(() => {
      runInAction(() => {
        this.highlightFile = {};
      });
    }, 1000);
  };

  checkSelection = (file: TItem) => {
    if (this.selection) {
      // isSameEntity is typed for raw TFile/TFolder/TRoom
      // entities while this store passes filesList view-model items; the
      // erased casts keep the calls unchanged.
      const foundIndex = this.selection?.findIndex((x) =>
        isSameEntity(x as TFile, file as TFile),
      );
      if (foundIndex > -1) {
        runInAction(() => {
          this.selection[foundIndex] = file;
        });
      }
    }

    if (isSameEntity(this.bufferSelection as TFile, file as TFile)) {
      runInAction(() => {
        this.bufferSelection = file;
      });
    }
  };

  updateSelectionStatus = (
    id: number | string,
    status: FileStatus,
    isEditing: boolean,
  ) => {
    const index = this.selection.findIndex((x) => x.id === id);

    if (index !== -1) {
      this.selection[index].fileStatus = status;
      this.selection[index].isEditing = isEditing;
    }
  };

  removeActiveItem = (file: { id?: number | string }) => {
    this.activeFiles =
      this.activeFiles?.filter((item) => item.id !== file.id) ?? EMPTY_ARRAY;
  };

  addActiveItems = (
    files?: Nullable<(number | string)[]>,
    folders?: Nullable<(number | string)[]>,
    destFolderId?: Nullable<number | string>,
  ) => {
    if (folders && folders.length) {
      if (!this.activeFolders.length) {
        this.setActiveFolders(folders, destFolderId);
      } else {
        folders.map((item) =>
          this.activeFolders.push({ id: item, destFolderId }),
        );
      }
    }

    if (files && files.length) {
      if (!this.activeFiles.length) {
        this.setActiveFiles(files, destFolderId);
      } else {
        files.map((item) => this.activeFiles.push({ id: item, destFolderId }));
      }
    }
  };

  updateActiveFiles = (items: TActiveItem[]) => {
    this.activeFiles = items;
  };

  updateActiveFolders = (items: TActiveItem[]) => {
    this.activeFolders = items;
  };

  clearFiles = () => {
    this.setFolders(EMPTY_ARRAY);
    this.setFiles(EMPTY_ARRAY);

    this.selectedFolderStore.setSelectedFolder(null);
  };

  setActiveFiles = (
    activeFiles: ((number | string) | TActiveItem)[],
    destFolderId?: Nullable<number | string>,
  ) => {
    const arrayFormation = mappingActiveItems(activeFiles, destFolderId);

    this.activeFiles = arrayFormation;
  };

  setActiveFolders = (
    activeFolders: ((number | string) | TActiveItem)[],
    destFolderId?: Nullable<number | string>,
  ) => {
    const arrayFormation = mappingActiveItems(activeFolders, destFolderId);

    this.activeFolders = arrayFormation;
  };

  setViewAs = (viewAs: TViewAs) => {
    this.privateViewAs = viewAs;
    setPersistedString(PersistenceKeys.viewAs, viewAs);
    viewAs === "tile" && this.createThumbnails();
  };

  get viewAs() {
    const view = this.privateViewAs;

    const { parentRoomType, roomType, isIndexedFolder } =
      this.selectedFolderStore;
    const currentDeviceType = this.settingsStore.currentDeviceType;

    // getViewForCurrentRoom accepts only "row"|"table"|"tile"
    // while the persisted value is the wider TViewAs; the erased cast keeps
    // the original pass-through.
    return getViewForCurrentRoom(view as "row" | "table" | "tile", {
      currentDeviceType,
      parentRoomType,
      roomType,
      indexing: isIndexedFolder,
    });
  }

  get selections() {
    if (Array.isArray(this.selection) && this.selection.length !== 0) {
      return this.selection;
    }

    if (this.bufferSelection) {
      return [this.bufferSelection];
    }

    return EMPTY_ARRAY;
  }

  setPageItemsLength = (pageItemsLength: number) => {
    this.pageItemsLength = pageItemsLength;
  };

  setDragging = (dragging: boolean) => {
    this.dragging = dragging;
  };

  setTooltipPosition = (tooltipPageX: number, tooltipPageY: number) => {
    this.tooltipPageX = tooltipPageX;
    this.tooltipPageY = tooltipPageY;
  };

  setStartDrag = (startDrag: boolean) => {
    this.setSelection(
      this.selection.filter((x) => !x.providerKey || x.id !== x.rootFolderId), // removed root thirdparty folders
    );
    this.startDrag = startDrag;
  };

  setIsEmptyPage = (isEmptyPage: boolean) => {
    this.isEmptyPage = isEmptyPage;
  };

  setIsLoadedEmptyPage = (isLoadedEmptyPage: boolean) => {
    this.isLoadedEmptyPage = isLoadedEmptyPage;
  };

  get tooltipOptions() {
    if (!this.dragging) return null;

    const selectionLength = this.selection.length;
    const elementTitle = selectionLength && this.selection[0].title;
    const singleElement = selectionLength === 1;
    const filesCount = singleElement ? elementTitle : selectionLength;
    const { isSharedWithMeFolder, isCommonFolder } = this.treeFoldersStore;

    let operationName;

    if (this.authStore.isAdmin && isSharedWithMeFolder) {
      operationName = "copy";
    } else if (
      !this.authStore.isAdmin &&
      (isSharedWithMeFolder || isCommonFolder)
    ) {
      operationName = "copy";
    } else {
      operationName = "move";
    }

    return {
      filesCount,
      operationName,
    };
  }

  initFiles = () => {
    if (this.isInit) return;

    const { isAuthenticated } = this.authStore;
    const { getFilesSettings } = this.filesSettingsStore;

    // SettingsStore renamed getEncryptionKeys to
    // getLegacyEncryptionKeys — this destructured member is undefined at
    // runtime, so the desktop-client branch below would throw when calling
    // it (same as the old JS). Candidate for a real fix.
    const {
      getPortalCultures,
      getIsEncryptionSupport,
      getEncryptionKeys,
      // setModuleInfo,
      isDesktopClient,
      getInvitationSettings,
    } = this.settingsStore as SettingsStore & {
      getEncryptionKeys?: () => Promise<unknown>;
    };

    // setModuleInfo(config.homepage, config.id);

    const requests = [];

    updateTempContent();
    if (!isAuthenticated) {
      return this.clientLoadingStore.setIsLoaded(true);
    }
    updateTempContent(isAuthenticated);

    if (!this.isEditor) {
      requests.push(
        getPortalCultures(),
        getInvitationSettings(),
        this.treeFoldersStore.fetchTreeFolders().then((treeFolders) => {
          if (!treeFolders || !treeFolders.length) return;

          const trashFolder = treeFolders.find(
            (f) => f.rootFolderType == FolderType.TRASH,
          );

          if (!trashFolder) return;

          const isEmpty = !trashFolder.foldersCount && !trashFolder.filesCount;

          this.setTrashIsEmpty(isEmpty);
        }),
      );

      if (isDesktopClient) {
        requests.push(getIsEncryptionSupport(), getEncryptionKeys!());
      }

      if (this.userStore?.getEncryptionKeys) {
        requests.push(this.userStore.getEncryptionKeys().catch(() => {}));
      }
    }
    requests.push(getFilesSettings());

    return Promise.all(requests).then(() => {
      this.clientLoadingStore.setIsArticleLoading(false);
      this.clientLoadingStore.setFirstLoad(false);

      this.setIsInit(true);
    });
  };

  setIsInit = (isInit: boolean) => {
    this.isInit = isInit;
  };

  reset = () => {
    this.isInit = false;
    this.clientLoadingStore.setIsLoaded(false);
    this.clientLoadingStore.setIsSectionHeaderLoading(true);
    this.clientLoadingStore.setIsSectionFilterLoading(true);
    this.clientLoadingStore.setIsSectionBodyLoading(true);
    this.clientLoadingStore.setIsArticleLoading(true);
    this.clientLoadingStore.setFirstLoad(true);

    this.alreadyFetchingRooms = false;

    this.files = EMPTY_ARRAY;
    this.folders = EMPTY_ARRAY;

    this.selection = EMPTY_ARRAY;
    this.bufferSelection = null;
    this.selected = "close";
  };

  resetSelections = () => {
    this.setSelection(EMPTY_ARRAY);
    this.setBufferSelection(null);
  };

  setFiles = (files: TFile[]) => {
    if (files.length === 0 && this.files.length === 0) return;

    const roomPartsToUnsub = this.files
      .filter(
        (f) =>
          !files.some((nf) => nf.id === f.id) &&
          SocketHelper?.socketSubscribers.has(`FILE-${f.id}`),
      )
      .map((f) => `FILE-${f.id}`);

    const roomPartsToSub = files
      .map((f) => `FILE-${f.id}`)
      .filter((f) => !SocketHelper?.socketSubscribers.has(f));

    if (roomPartsToUnsub.length > 0) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: roomPartsToUnsub,
        individual: true,
      });
    }

    this.files = files;

    this.recoverEncryptedFilenamesForCurrentView();

    if (roomPartsToSub.length > 0) {
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: roomPartsToSub,
        individual: true,
      });

      // this.files?.forEach((file) =>
      //   console.log("[WS] subscribe to file's changes", file.id, file.title)
      // );
    }

    this.createThumbnails();
  };

  setFolders = (folders: (TFolder | TRoom)[]) => {
    if (folders.length === 0 && this.folders.length === 0) return;

    const roomPartsToUnsub = this.folders
      .filter(
        (f) =>
          !folders.some((nf) => nf.id === f.id) &&
          SocketHelper?.socketSubscribers.has(`DIR-${f.id}`) &&
          this.selectedFolderStore.id !== f.id,
      )
      .map((f) => `DIR-${f.id}`);

    const roomPartsToSub = folders
      .map((f) => `DIR-${f.id}`)
      .filter((f) => !SocketHelper?.socketSubscribers.has(f));

    if (roomPartsToUnsub.length > 0) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: roomPartsToUnsub,
        individual: true,
      });
    }

    this.folders = folders;

    if (roomPartsToSub.length > 0) {
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: roomPartsToSub,
        individual: true,
      });
    }
  };

  getFileIndex = (id: number | string) => {
    const index = this.files.findIndex((x) => x.id === id);
    return index;
  };

  updateFileStatus = (index: number, status: FileStatus) => {
    if (index < 0) return;

    this.files[index].fileStatus = status;
  };

  updateFileLiveEditingBy = (
    index: number,
    activeEditors?: Record<string, string>,
  ) => {
    if (index < 0) return;

    this.files[index].activeEditors = activeEditors;
  };

  updateFileVectorizationStatus = (
    fileId: number | string,
    status: VectorizationStatus,
  ) => {
    const foundIndex = this.files.findIndex((file) => file.id === fileId);
    if (foundIndex < 0) return;

    this.files[foundIndex].vectorizationStatus = status;
  };

  updateRoomMute = (index: number, status: boolean) => {
    this.folders[index].mute = status;
    this.updateSelection(this.folders[index]);
  };

  setFile = (file: TFile) => {
    const index = this.files.findIndex((x) => x.id === file.id);

    if (index !== -1) {
      this.files[index] = file;
      this.createThumbnail(file);
      this.updateSelection(file);
    }
  };

  removeStaleItemFromSelection = (item: TItem) => {
    if (!item.parentId) {
      if (this.activeFiles.some((elem) => elem.id === item.id)) return;
    } else if (this.activeFolders.some((elem) => elem.id === item.id)) return;

    if (
      this.bufferSelection?.id === item.id &&
      this.bufferSelection?.fileType === item.fileType
    ) {
      return this.setBufferSelection(null);
    }

    const newSelection = this.selection.filter(
      (select) => !(select.id === item.id && select.fileType === item.fileType),
    );
    this.setSelection(newSelection);
  };

  updateSelection = (item: TItem) => {
    const indexFileList = this.filesList.findIndex((file) =>
      isSameEntity(file as TFile, item as TFile),
    );
    const indexSelectedRoom = this.selection.findIndex((selectionItem) =>
      isSameEntity(selectionItem as TFile, item as TFile),
    );

    if (~indexFileList && ~indexSelectedRoom) {
      this.selection[indexSelectedRoom] = this.filesList[indexFileList];
    }

    if (this.bufferSelection) {
      const newBuffer = this.filesList.find((file) =>
        isSameEntity(file as TFile, this.bufferSelection as TFile),
      );

      if (!newBuffer) return;

      this.bufferSelection = newBuffer;
    }
  };

  getFolderIndex = (id: number | string) => {
    const index = this.folders.findIndex((x) => x.id === id);
    return index;
  };

  updateFolder = (index: number, folder: TFolder | TRoom) => {
    if (index !== -1) this.folders[index] = folder;

    this.updateSelection(folder);
  };

  setFolder = (folder: TFolder | TRoom) => {
    const index = this.getFolderIndex(folder.id);

    this.updateFolder(index, folder);
  };

  getFilesChecked = (file: TItem, selected: string) => {
    if (!file.parentId) {
      if (this.activeFiles.find((elem) => elem.id === file.id)) return false;
    } else if (this.activeFolders.find((elem) => elem.id === file.id))
      return false;

    const type = file.fileType;
    const roomType = file.roomType;

    switch (selected) {
      case "all":
        return true;
      case FilterType.FoldersOnly.toString():
        return file.parentId;
      case FilterType.DocumentsOnly.toString():
        return type === FileType.Document;
      case FilterType.PresentationsOnly.toString():
        return type === FileType.Presentation;
      case FilterType.SpreadsheetsOnly.toString():
        return type === FileType.Spreadsheet;
      case FilterType.ImagesOnly.toString():
        return type === FileType.Image;
      case FilterType.MediaOnly.toString():
        return type === FileType.Video || type === FileType.Audio;
      case FilterType.ArchiveOnly.toString():
        return type === FileType.Archive;
      case FilterType.FilesOnly.toString():
        return type || !file.parentId;
      case `room-${(RoomsType as TRemovedRoomsTypes).FillingFormsRoom}`:
        return roomType === (RoomsType as TRemovedRoomsTypes).FillingFormsRoom;
      case `room-${RoomsType.CustomRoom}`:
        return roomType === RoomsType.CustomRoom;
      case `room-${RoomsType.AIRoom}`:
        return roomType === RoomsType.AIRoom;
      case `room-${RoomsType.EditingRoom}`:
        return roomType === RoomsType.EditingRoom;
      case `room-${(RoomsType as TRemovedRoomsTypes).ReviewRoom}`:
        return roomType === (RoomsType as TRemovedRoomsTypes).ReviewRoom;
      case `room-${(RoomsType as TRemovedRoomsTypes).ReadOnlyRoom}`:
        return roomType === (RoomsType as TRemovedRoomsTypes).ReadOnlyRoom;
      case `room-${RoomsType.FormRoom}`:
        return roomType === RoomsType.FormRoom;
      case `room-${RoomsType.PublicRoom}`:
        return roomType === RoomsType.PublicRoom;
      case `room-${RoomsType.VirtualDataRoom}`:
        return roomType === RoomsType.VirtualDataRoom;
      default:
        return false;
    }
  };

  getFilesBySelected = (files: TItem[], selected: string) => {
    const newSelection: TItem[] = [];
    files.forEach((file) => {
      const checked = this.getFilesChecked(file, selected);

      if (checked) newSelection.push(file);
    });

    return newSelection;
  };

  setSelected = (selected: string, clearBuffer = true) => {
    if (selected === "close" || selected === "none") {
      clearBuffer && this.setBufferSelection(null);

      if (this.hotkeyCaret) {
        this.setHotkeyCaretStart(
          this.selection.at(-1) ?? this.hotkeyCaretStart,
        );
        this.setHotkeyCaret(this.selection.at(-1) ?? this.hotkeyCaret);
      }
    }

    this.selected = selected;
    const files = this.filesList;
    this.setSelection(this.getFilesBySelected(files, selected));
  };

  setHotkeyCaret = (hotkeyCaret: Nullable<TItem>) => {
    if (hotkeyCaret || this.hotkeyCaret) {
      this.hotkeyCaret = hotkeyCaret;
    }
  };

  setHotkeyCaretStart = (hotkeyCaretStart: Nullable<TItem>) => {
    this.hotkeyCaretStart = hotkeyCaretStart;
  };

  setSelection = (selection: TItem[]) => {
    this.selection = selection;
  };

  getSelection = () => {
    return this.selection;
  };

  setSelections = (added: Element[], removed: Element[], clear = false) => {
    if (clear) {
      this.setSelection(EMPTY_ARRAY);
    }

    let newSelections: TItem[] = JSON.parse(JSON.stringify(this.selection));

    added.forEach((item) => {
      if (!item) return;

      const value =
        this.viewAs === "tile"
          ? item.getAttribute("value")
          : item.getElementsByClassName("files-item")
            ? item
                .getElementsByClassName("files-item")[0]
                ?.getAttribute("value")
            : null;

      if (!value) return;
      const splitValue = (value && value.split("_")) as string[];

      const fileType = splitValue[0];
      const id = splitValue.slice(1, -3).join("_");

      if (fileType === "file") {
        if (this.activeFiles.findIndex((f) => f.id == id) === -1) {
          const selectableFile = this.filesList.find(
            (f) => f.id == id && !f.isFolder,
          );

          if (selectableFile) {
            newSelections.push(selectableFile);
          }
        }
      } else if (this.activeFolders.findIndex((f) => f.id == id) === -1) {
        const selectableFolder = this.filesList.find(
          (f) => f.id == id && f.isFolder,
        );

        if (selectableFolder) {
          selectableFolder.isFolder = true;

          newSelections.push(selectableFolder);
        }
      }
    });

    removed.forEach((item) => {
      if (!item) return;

      const value =
        this.viewAs === "tile"
          ? item.getAttribute("value")
          : item.getElementsByClassName("files-item")
            ? item
                .getElementsByClassName("files-item")[0]
                ?.getAttribute("value")
            : null;

      // unlike the `added` loop there is no `!value` guard
      // here, so the old JS would throw on a null value; the erased cast
      // keeps that behavior.
      const splitValue = (value && value.split("_")) as string[];

      const fileType = splitValue[0];
      const id = splitValue.slice(1, -3).join("_");

      if (fileType === "file") {
        if (this.activeFiles.findIndex((f) => f.id == id) === -1) {
          newSelections = newSelections.filter(
            (f) => !(f.id == id && !f.isFolder),
          );
        }
      } else if (this.activeFolders.findIndex((f) => f.id == id) === -1) {
        newSelections = newSelections.filter(
          (f) => !(f.id == id && f.isFolder),
        );
      }
    });

    const removeDuplicate = (items: TItem[]) => {
      return items.filter(
        (x, index, self) =>
          index ===
          self.findIndex((i) => i.id === x.id && i.isFolder === x.isFolder),
      );
    };

    this.setSelection(removeDuplicate(newSelections));
  };

  setBufferSelection = (bufferSelection: Nullable<TItem>) => {
    // console.log("setBufferSelection", bufferSelection);
    this.bufferSelection = bufferSelection;
  };

  setIsLoadedFetchFiles = (isLoadedFetchFiles: boolean) => {
    this.isLoadedFetchFiles = isLoadedFetchFiles;
  };

  setFilesFilter = (
    filter: TFilesFilter,
    folderId: Nullable<number | string> = null,
  ) => {
    const key = match(this.categoryType)
      .with(
        CategoryType.Archive,
        () => `${FILTER_ARCHIVE_DOCUMENTS}=${this.userStore.user?.id}`,
      )
      .with(
        CategoryType.SharedRoom,
        CategoryType.Form,
        () => `${FILTER_ROOM_DOCUMENTS}=${this.userStore.user?.id}`,
      )
      .with(
        CategoryType.Recent,
        () => `${FILTER_RECENT}=${this.userStore.user?.id}`,
      )
      .with(
        CategoryType.SharedWithMe,
        () => `${FILTER_SHARE}=${this.userStore.user?.id}`,
      )
      .with(
        CategoryType.Favorite,
        () => `${FILTER_FAVORITES}=${this.userStore.user?.id}`,
      )
      .when(
        () =>
          +(folderId as string) === this.treeFoldersStore.recycleBinFolderId,
        () => `${FILTER_TRASH}=${this.userStore.user?.id}`,
      )
      .when(
        () => !this.publicRoomStore.isPublicRoom,
        () => `${FILTER_DOCUMENTS}=${this.userStore.user?.id}`,
      )
      .otherwise(() => null);

    if (key) {
      setUserFilter(key, {
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      });
    }

    this.filter = filter;

    runInAction(() => {
      if (filter && this.isHidePagination) {
        this.isHidePagination = false;
      }
    });

    runInAction(() => {
      if (filter && this.isLoadingFilesFind) {
        this.isLoadingFilesFind = false;
      }
    });
  };

  resetUrl = () => {
    // tempFilter may still be null here (old JS passed it
    // through unchecked); the erased cast keeps the same runtime value.
    this.setFilesFilter(this.tempFilter as TFilesFilter);
  };

  setRoomsFilter = (filter: TRoomsFilter) => {
    filter.pageCount = 100;

    const isArchive = this.categoryType === CategoryType.Archive;
    const isTemplate = filter.searchArea === RoomSearchArea.Templates;

    const key = isArchive
      ? `${FILTER_ARCHIVE_ROOM}=${this.userStore.user?.id}`
      : isTemplate
        ? `${FILTER_TEMPLATES_ROOM}=${this.userStore.user?.id}`
        : `${FILTER_SHARED_ROOM}=${this.userStore.user?.id}`;

    const sharedStorageFilter = getUserFilter(key);

    sharedStorageFilter.sortBy = filter.sortBy;
    sharedStorageFilter.sortOrder = filter.sortOrder;

    setUserFilter(key, sharedStorageFilter);

    this.roomsFilter = filter;

    runInAction(() => {
      if (filter && this.isHidePagination) {
        this.isHidePagination = false;
      }
    });

    runInAction(() => {
      if (filter && this.isLoadingFilesFind) {
        this.isLoadingFilesFind = false;
      }
    });
  };

  setFilter = (filter: TFilesFilter) => {
    filter.pageCount = 100;
    this.filter = filter;
  };

  refreshFiles = async () => {
    const res = await this.fetchFiles(this.selectedFolderStore.id, this.filter);
    return res;
  };

  fetchFiles = (
    folderId: Nullable<number | string>,
    filter?: Nullable<TFilesFilter>,
    clearFilter = true,
    withSubfolders = false,
    clearSelection = true,
  ): Promise<unknown> => {
    const { setSelectedNode } = this.treeFoldersStore;
    const { setIsIndexEditingMode } = this.indexingStore;

    setIsIndexEditingMode(false);

    const filterData = filter ? filter.clone() : FilesFilter.getDefault();
    // FilesFilter.folder is typed `string` but folder ids are
    // numbers or strings at runtime; erased casts keep the values.
    filterData.folder = folderId as string;

    if (
      folderId === "@my" &&
      this.userStore.user?.isVisitor &&
      !this.userStore.user?.hasPersonalFolder
    ) {
      const url = getCategoryUrl(CategoryType.Shared);
      // this early-return escapes with the void result of
      // navigate() while the method is otherwise Promise-returning; the
      // erased cast keeps the old JS value.
      return window.DocSpace.navigate(
        `${url}?${RoomsFilter.getDefault().toUrlParams()}`,
      ) as unknown as Promise<unknown>;
    }

    this.setIsErrorAIAgentNotAvailable(false);
    this.setIsErrorRoomNotAvailable(false);
    this.setIsLoadedFetchFiles(false);

    if (this.userStore.user?.id && !filter) {
      const filterObj = getUserFilter(
        `${FILTER_DOCUMENTS}=${this.userStore.user.id}`,
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

    this.filesController?.abort();
    this.roomsController?.abort();
    this.aiAgentsController?.abort();

    this.filesController = new AbortController();
    this.roomsController = null;
    this.aiAgentsController = null;

    let room: Nullable<TItem> = null;

    return api.files
      .getFolder(folderId as string, filterData, this.filesController.signal)
      .then(async (data) => {
        let newTotal = data.total;

        // fixed row loader if total and items length is different
        const itemsLength = data.folders.length + data.files.length;
        if (itemsLength < filterData.pageCount) {
          newTotal =
            filterData.page > 0
              ? itemsLength + this.files.length + this.folders.length
              : itemsLength;
        }

        filterData.total = newTotal;

        if (
          (data.current.roomType === RoomsType.PublicRoom ||
            data.current.roomType === RoomsType.FormRoom ||
            data.current.roomType === RoomsType.CustomRoom) &&
          !this.publicRoomStore.isPublicRoom &&
          !data.current.private
        ) {
          await this.publicRoomStore.getExternalLinks(data.current.id);
        }

        if (data.current.private) {
          const keys = this.userStore?.encryptionKeys;
          if (!Array.isArray(keys) || keys.length === 0) {
            toastr.warning(getI18n().t("Common:EncryptionKeysNotConfigured"));
          }

          // The room id may differ from data.current.id when navigating into
          // a sub-folder: pathParts[1] is the room, current is the sub-folder.
          const resolvedRoomId = data.pathParts?.[1]?.id ?? data.current.id;
          // Backfill envelopes for members who registered their keypair after
          // being invited (their old files are otherwise locked out).
          this.maybeBackfillEncryptedRoom(
            resolvedRoomId,
            data.current.security,
          );
        }

        if (
          data.current.roomType === RoomsType.AIRoom &&
          this.categoryType !== CategoryType.Chat
        ) {
          this.categoryType = CategoryType.Chat;
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
            return this.fetchFiles(
              folderId,
              filterData,
              clearFilter,
              withSubfolders,
            );
          }
        }

        runInAction(() => {
          if (!this.publicRoomStore.isPublicRoom) {
            this.categoryType = getCategoryTypeByFolderType(
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
            //   this.treeFoldersStore.myRoomsId
            // ) {
            //   folderId = this.treeFoldersStore.myRoomsId;
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
                this.isMuteCurrentRoomNotifications = mute as boolean;
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
            this.aiRoomStore.setKnowledgeId(currentFolder.id as number);
            this.aiRoomStore.setResultId(null);
          } else if (currentFolder.type === FolderType.ResultStorage) {
            this.aiRoomStore.setKnowledgeId(null);
            this.aiRoomStore.setResultId(currentFolder.id as number);
          }

          // `room` is assigned inside the Promise.all map
          // above; the non-null assertions keep the old unchecked access.
          const aiRoom: TItem =
            room!.id === currentFolder.parentId
              ? room!
              : await api.files.getFolderInfo(currentFolder.parentId as number);

          this.aiRoomStore.setCurrentTab(
            currentFolder.type === FolderType.Knowledge
              ? "knowledge"
              : "result",
          );

          navigationPath = navigationPath.filter(
            (item) => item.folderType !== FolderType.AIAgent,
          );

          const currentFolderType: TItem["type"] = currentFolder.type;

          currentFolder = {
            ...aiRoom,
            security: {
              ...currentFolder.security,
              Create:
                currentFolder.security!.Create &&
                !this.settingsStore.aiConfig?.aiReadyNeedReset,
              Download: aiRoom.security!.Download,
              EditAccess:
                currentFolder.security!.security?.EditAccess &&
                !this.settingsStore.aiConfig?.aiReadyNeedReset,
              EditRoom:
                currentFolder.security!.security?.EditRoom &&
                !this.settingsStore.aiConfig?.aiReadyNeedReset,
              ChangeOwner:
                currentFolder.security!.security?.ChangeOwner &&
                !this.settingsStore.aiConfig?.aiReadyNeedReset,
              Delete: aiRoom.security!.Delete,

              Pin: aiRoom.security!.Pin,
              UseChat: aiRoom.security!.UseChat,
            },
            isRoom: true,
            type: currentFolderType,
          };
        } else if (currentFolder.roomType === RoomsType.AIRoom) {
          isChatTab = true;
          this.aiRoomStore.setCurrentTab("chat");
          this.aiRoomStore.setKnowledgeId(null);
          this.aiRoomStore.setResultId(null);
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

          this.aiRoomStore.setKnowledgeId(null);
          this.aiRoomStore.setResultId(null);
          this.aiRoomStore.setCurrentTab("result");
        } else {
          this.aiRoomStore.setKnowledgeId(null);
          this.aiRoomStore.setResultId(null);
          this.aiRoomStore.setCurrentTab(null);
        }

        runInAction(() => {
          if (this.isPreview) {
            // save filter for after closing preview change url
            this.setTempFilter(filterData);
          } else {
            this.setFilesFilter(filterData, folderId); // TODO: FILTER
          }

          this.selectedFolderStore.setSelectedFolder({
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
              this.setIsEmptyPage(false);
            } else {
              this.setIsEmptyPage(isEmptyList);
            }
          } else {
            this.setIsEmptyPage(isEmptyList);
          }

          if (!isChatTab) {
            this.setFolders(
              isPrivacyFolder && !isDesktop() ? EMPTY_ARRAY : data.folders,
            );
            this.setFiles(
              isPrivacyFolder && !isDesktop() ? EMPTY_ARRAY : data.files,
            );
          }
        });

        if (clearFilter) {
          if (clearSelection) {
            // Find not processed
            const tempSelection = this.selection.filter(
              (f) => !this.activeFiles.find((elem) => elem.id === f.id),
            );
            const tempBuffer =
              this.bufferSelection &&
              this.activeFiles.find(
                (elem) => elem.id === this.bufferSelection!.id,
              ) == null
                ? this.bufferSelection
                : null;

            // console.log({ tempSelection, tempBuffer });

            // Clear all selections
            this.setSelected("close");

            // TODO: see bug 63479
            if (this.selectedFolderStore?.id === folderId) {
              // Restore not processed
              tempSelection.length && this.setSelection(tempSelection);
              tempBuffer && this.setBufferSelection(tempBuffer);
            }
          }
        }

        const selectedFolder = {
          selectedFolder: { ...this.selectedFolderStore },
        };

        if (this.createdItem) {
          const newItem = this.filesList.find(
            (item) => item.id === this.createdItem!.id,
          );

          if (newItem) {
            this.setBufferSelection(newItem);
            this.setScrollToItem({
              id: newItem.id as number,
              type: this.createdItem!.type,
            });
          }

          this.setCreatedItem(null);
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
            this.currentTariffStatusStore as unknown as {
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
            this.setIsErrorAIAgentNotAvailable(true);
          } else {
            this.setIsErrorRoomNotAvailable(true);
          }
        } else {
          toastr.error(err);
          if (isThirdPartyError) {
            const userId = this.userStore?.user?.id;
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
        this.setIsLoadedFetchFiles(true);

        this.clientLoadingStore.setIsSectionHeaderLoading(false);
        this.clientLoadingStore.setIsSectionFilterLoading(false);

        if (
          (window?.DocSpace?.location?.state as THighlightState)
            ?.highlightFileId
        ) {
          this.setHighlightFile({
            highlightFileId: (window.DocSpace.location.state as THighlightState)
              .highlightFileId,
            isFileHasExst: (window.DocSpace.location.state as THighlightState)
              .isFileHasExst,
          });
        }
      });
  };

  fetchRooms = (
    folderId: Nullable<number | string>,
    filter?: Nullable<TRoomsFilter>,
    clearFilter = true,
    withSubfolders = false,
    clearSelection = true,
  ): Promise<unknown> => {
    const { setSelectedNode } = this.treeFoldersStore;

    const { setIsIndexEditingMode } = this.indexingStore;

    setIsIndexEditingMode(false);

    const filterData = filter
      ? filter.clone()
      : RoomsFilter.getDefault(this.userStore.user?.id);

    const isCustomCountPage =
      filter && filter.pageCount !== 100 && filter.pageCount !== 25;

    if (!isCustomCountPage) {
      filterData.page = 0;
      filterData.pageCount = 100;
    }

    if (folderId) setSelectedNode([`${folderId}`]);

    const defaultFilter = RoomsFilter.getDefault();

    const { provider, quotaFilter } = filterData;

    // ROOMS_PROVIDER_TYPE_NAME is keyed by RoomsProviderType
    // while RoomsFilter.provider is a nullable string; the erased cast keeps
    // the original lookup.
    if (
      !(ROOMS_PROVIDER_TYPE_NAME as Record<string, string>)[provider as string]
    )
      filterData.provider = defaultFilter.provider;

    if (
      quotaFilter &&
      quotaFilter !== FilterKeys.customQuota &&
      quotaFilter !== FilterKeys.defaultQuota
    )
      filterData.quotaFilter = defaultFilter.quotaFilter;

    this.filesController?.abort();
    this.roomsController?.abort();
    this.aiAgentsController?.abort();

    this.roomsController = new AbortController();
    this.filesController = null;
    this.aiAgentsController = null;

    this.aiRoomStore.setKnowledgeId(null);
    this.aiRoomStore.setResultId(null);
    this.aiRoomStore.setCurrentTab(null);

    // The Rooms/Forms split is enforced server-side by the room's folder type:
    // `searchArea=Active` never returns Form Filling Rooms, and the Forms
    // section requests `searchArea=Forms`. The filter (carrying searchArea)
    // maps directly to the request — no client-side room-type scoping needed.
    const request = () =>
      api.rooms
        .getRooms(filterData, this.roomsController!.signal)
        .then(async (data) => {
          if (!folderId) setSelectedNode([`${data.current.id}`]);

          filterData.total = data.total;

          if (data.total > 0) {
            const lastPage = filterData.getLastPage();

            if (filterData.page > lastPage) {
              filterData.page = lastPage;

              return this.fetchRooms(
                folderId,
                filterData,
                undefined,
                undefined,
                undefined,
              );
            }
          }

          runInAction(() => {
            this.categoryType = getCategoryTypeByFolderType(
              data.current.rootFolderType,
              data.current.parentId,
            );
          });

          this.setRoomsFilter(filterData);

          runInAction(() => {
            this.selectedFolderStore.setSelectedFolder({
              folders: data.folders,
              ...data.current,
              pathParts: data.pathParts,
              navigationPath: EMPTY_ARRAY,
              ...{ new: data.new },
            });

            const isEmptyList = data.folders.length === 0;
            if (filter && isEmptyList) {
              const {
                subjectId,
                filterValue,
                type,
                withSubfolders: withRoomsSubfolders,
                searchInContent: searchInContentRooms,
                tags,
                withoutTags,
              } = filter;

              const isFiltered =
                subjectId ||
                filter.subjectOwnerId ||
                filterValue ||
                type ||
                filter.provider ||
                withRoomsSubfolders ||
                searchInContentRooms ||
                tags ||
                withoutTags ||
                filter.quotaFilter;

              if (isFiltered) {
                this.setIsEmptyPage(false);
              } else {
                this.setIsEmptyPage(isEmptyList);
              }
            } else {
              this.setIsEmptyPage(isEmptyList);
            }

            this.setFolders(data.folders);
            this.setFiles(EMPTY_ARRAY);
          });

          if (clearFilter) {
            if (clearSelection) {
              this.setSelected("close");
            }
          }

          setInfoPanelSelectedRoom(null);

          const selectedFolder = {
            selectedFolder: { ...this.selectedFolderStore },
          };

          if (this.createdItem) {
            const newItem = this.filesList.find(
              (item) => item.id === this.createdItem!.id,
            );

            if (newItem) {
              this.setBufferSelection(newItem);
              this.setScrollToItem({
                id: newItem.id as number,
                type: this.createdItem!.type,
              });
            }

            this.setCreatedItem(null);
          }

          runInAction(() => {
            this.roomsController = null;
          });

          this.setIsErrorRoomNotAvailable(false);
          return Promise.resolve(selectedFolder);
        })
        .catch((err) => {
          if (err?.response?.status === 402)
            (
              this.currentTariffStatusStore as unknown as {
                setPortalTariff: () => void;
              }
            ).setPortalTariff();

          if (axios.isCancel(err)) {
            console.log("Request canceled", err.message);
            throw err;
          } else {
            toastr.error(err);
          }
        })
        .finally(() => {
          this.clientLoadingStore.setIsSectionHeaderLoading(false);
          this.clientLoadingStore.setIsSectionFilterLoading(false);
        });

    return request();
  };

  fetchAgents = (
    folderId: Nullable<number | string>,
    filter?: Nullable<TRoomsFilter>,
    clearFilter = true,
    clearSelection = true,
  ): Promise<unknown> => {
    const { setSelectedNode } = this.treeFoldersStore;

    const filterData = filter
      ? filter.clone()
      : RoomsFilter.getDefault(
          this.userStore.user?.id,
          RoomSearchArea.AIAgents,
        );

    const isCustomCountPage =
      filter && filter.pageCount !== 100 && filter.pageCount !== 25;

    if (!isCustomCountPage) {
      filterData.page = 0;
      filterData.pageCount = 100;
    }

    if (folderId) setSelectedNode([`${folderId}`]);

    this.filesController?.abort();
    this.roomsController?.abort();
    this.aiAgentsController?.abort();

    this.roomsController = null;
    this.filesController = null;
    this.aiAgentsController = new AbortController();

    this.aiRoomStore.setKnowledgeId(null);
    this.aiRoomStore.setResultId(null);

    this.aiRoomStore.setCurrentTab(null);

    const request = () =>
      api.ai
        .getNewAiAgents(filterData, this.aiAgentsController!.signal)
        .then(async (data) => {
          if (!folderId) setSelectedNode([`${data.current.id}`]);

          filterData.total = data.total;

          if (data.total > 0) {
            const lastPage = filterData.getLastPage();

            if (filterData.page > lastPage) {
              filterData.page = lastPage;

              return this.fetchAgents(folderId, filterData);
            }
          }

          runInAction(() => {
            this.categoryType = getCategoryTypeByFolderType(
              data.current.rootFolderType,
              data.current.parentId,
            );
          });

          this.setRoomsFilter(filterData);

          runInAction(() => {
            this.selectedFolderStore.setSelectedFolder({
              folders: data.folders,
              ...data.current,
              pathParts: data.pathParts,
              navigationPath: EMPTY_ARRAY,
              ...{ new: data.new },
              security: {
                ...data.current.security,
                Create:
                  data.current.security.Create &&
                  !this.settingsStore.aiConfig?.aiReadyNeedReset,
              },
            });

            const isEmptyList = data.folders.length === 0;
            if (filter && isEmptyList) {
              const {
                subjectId,
                filterValue,
                type,
                withSubfolders: withRoomsSubfolders,
                searchInContent: searchInContentRooms,
                tags,
                withoutTags,
              } = filter;

              const isFiltered =
                subjectId ||
                filter.subjectOwnerId ||
                filterValue ||
                type ||
                filter.provider ||
                withRoomsSubfolders ||
                searchInContentRooms ||
                tags ||
                withoutTags ||
                filter.quotaFilter;

              if (isFiltered) {
                this.setIsEmptyPage(false);
              } else {
                this.setIsEmptyPage(isEmptyList);
              }
            } else {
              this.setIsEmptyPage(isEmptyList);
            }

            this.setFolders(data.folders);
            this.setFiles(EMPTY_ARRAY);
          });

          if (clearFilter) {
            if (clearSelection) {
              this.setSelected("close");
            }
          }

          setInfoPanelSelectedRoom(null);

          const selectedFolder = {
            selectedFolder: { ...this.selectedFolderStore },
          };

          if (this.createdItem) {
            const newItem = this.filesList.find(
              (item) => item.id === this.createdItem!.id,
            );

            if (newItem) {
              this.setBufferSelection(newItem);
              this.setScrollToItem({
                id: newItem.id as number,
                type: this.createdItem!.type,
              });
            }

            this.setCreatedItem(null);
          }

          runInAction(() => {
            this.roomsController = null;
          });

          this.setIsErrorAIAgentNotAvailable(false);
          return Promise.resolve(selectedFolder);
        })
        .catch((err) => {
          if (err?.response?.status === 402)
            (
              this.currentTariffStatusStore as unknown as {
                setPortalTariff: () => void;
              }
            ).setPortalTariff();

          if (axios.isCancel(err)) {
            console.log("Request canceled", err.message);
            throw err;
          } else {
            toastr.error(err);
          }
        })
        .finally(() => {
          this.clientLoadingStore.setIsSectionHeaderLoading(false);
          this.clientLoadingStore.setIsSectionFilterLoading(false);
        });

    return request();
  };

  setCustomRoomQuota = async (
    itemsIDs: (number | string)[],
    quotaSize: number | string,
    inRoom = false,
    filter: Nullable<TRoomsFilter> = null,
  ) => {
    // rooms quota endpoints are typed with numeric ids;
    // string ids pass through unchanged at runtime.
    const rooms = await api.rooms.setCustomRoomQuota(
      itemsIDs as number[],
      +quotaSize,
    );

    if (!inRoom) {
      if (!filter && this.roomsFilter.searchArea === RoomSearchArea.Templates) {
        const newFilter = RoomsFilter.getDefault(this.userStore.user?.id);
        newFilter.searchArea = RoomSearchArea.Templates;
        await this.fetchRooms(null, newFilter, false, false, false);
      } else {
        await this.fetchRooms(null, filter, false, false, false);
      }
    }

    return rooms;
  };

  setCustomAIAgentQuota = async (
    itemsIDs: (number | string)[],
    quotaSize: number | string,
    inAgent = false,
    filter: Nullable<TRoomsFilter> = null,
  ) => {
    // the AI quota endpoints are typed with numeric agent
    // ids; string ids pass through unchanged at runtime.
    const agents = await api.ai.setNewAiAgentQuota(
      itemsIDs as number[],
      +quotaSize,
    );

    if (!inAgent) {
      await this.fetchAgents(null, filter, false, false);
    }

    return agents;
  };

  resetRoomQuota = async (
    itemsIDs: (number | string)[],
    inRoom = false,
    filter: Nullable<TRoomsFilter> = null,
  ) => {
    const rooms = await api.rooms.resetRoomQuota(itemsIDs as number[]);

    if (!inRoom) {
      if (!filter && this.roomsFilter.searchArea === RoomSearchArea.Templates) {
        const newFilter = RoomsFilter.getDefault(this.userStore.user?.id);
        newFilter.searchArea = RoomSearchArea.Templates;
        await this.fetchRooms(null, newFilter, false, false, false);
      } else {
        await this.fetchRooms(null, filter, false, false, false);
      }
    }

    return rooms;
  };

  resetAIAgentQuota = async (
    itemsIDs: (number | string)[],
    inAgent = false,
    filter: Nullable<TRoomsFilter> = null,
  ) => {
    const agents = await api.ai.resetNewAiAgentQuota(itemsIDs as number[]);

    if (!inAgent) {
      await this.fetchAgents(null, filter, false, false);
    }

    return agents;
  };

  setAlreadyFetchingRooms = (alreadyFetchingRooms: boolean) => {
    this.alreadyFetchingRooms = alreadyFetchingRooms;
  };

  isFileSelected = (fileId?: number | string, parentId?: number | string) => {
    const item = this.selection.find(
      (x) => x.id === fileId && x.parentId === parentId,
    );

    return item !== undefined;
  };

  selectFile = (file: TItem) => {
    const { id, parentId } = file;
    const isFileSelected = this.isFileSelected(id, parentId);
    if (!isFileSelected) this.selection = [...this.selection, file];
  };

  deselectFile = (file: TItem) => {
    const { id, parentId } = file;
    const isFileSelected = this.isFileSelected(id, parentId);
    if (isFileSelected) {
      const selectionIndex = this.selection.findIndex(
        (x) => x.parentId === parentId && x.id === id,
      );

      if (selectionIndex !== -1) {
        this.setSelection(
          this.selection.filter((x, index) => index !== selectionIndex),
        );
      }
    }
  };

  getFilesContextOptions = (item: TItem, optionsToRemove: string[] = []) => {
    const isFile = !!item.fileExst || item.contentLength;
    const isRoom = !!item.roomType;
    const isTemplate =
      item.rootFolderType === FolderType.RoomTemplates && isRoom;
    const isAIAgent =
      item.rootFolderType === FolderType.AIAgents &&
      item.roomType === RoomsType.AIRoom;

    // the non-null assertions in this method keep the old
    // unchecked reads of optional item fields (new/fileStatus/security/
    // viewAccessibility) — the original .js relied on them being present
    // (or on JS falsy/NaN semantics) for the item kinds that reach each
    // branch.
    const hasNew =
      item.new! > 0 ||
      (item.fileStatus! & FileStatus.IsNew) === FileStatus.IsNew;
    const canConvert = item.viewAccessibility?.CanConvert;
    const mustConvert = item.viewAccessibility?.MustConvert;
    const isEncrypted = item.encrypted;
    const isDocuSign = false; // TODO: need this prop;
    const isEditing = false; // (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

    const {
      isRecycleBinFolder,
      isMy,
      isArchiveFolder,
      isRecentFolder,
      isFavoritesFolder,
      isPrivacyFolder,
    } = this.treeFoldersStore;
    const { security } = this.selectedFolderStore;

    const { enablePlugins } = this.settingsStore;

    const isThirdPartyFolder =
      item.providerKey && item.id === item.rootFolderId;

    const isMyFolder = isMy(item.rootFolderType!);

    const { isDesktopClient } = this.settingsStore;

    const canRenameItem = item.security?.Rename;

    const canMove = this.accessRightsStore.canMoveItems({
      ...item,
      ...{ editing: isEditing },
    });

    const canDelete = !isEditing && item.security?.Delete;

    const canCopy = item.security?.Copy;
    const canCopyLink = item.security?.CopyLink;
    const canDuplicate = item.security?.Duplicate;
    const canDownload =
      item.security?.Download || isLockedSharedRoom(item as TRoom);
    const canEmbed = item.security?.Embed;
    const canSetUpCustomFilter = item.security?.CustomFilter;

    if (isFile) {
      const shouldFillForm = item.viewAccessibility!.WebRestrictedEditing;
      const canLockFile = item.security?.Lock;
      const canChangeVersionFileHistory =
        !isEditing && item.security?.EditHistory;

      const canViewVersionFileHistory = item.security?.ReadHistory;
      const canFillForm = item.security?.FillForms;

      const canSubmitToFormGallery = item.security?.SubmitToFormGallery;

      const canEditFile =
        item.security!.Edit && item.viewAccessibility!.WebEdit;
      const canOpenPlayer =
        item.viewAccessibility!.ImageView || item.viewAccessibility!.MediaView;
      const canViewFile = item.viewAccessibility!.WebView;

      const isOldForm =
        item.fileExst === ".docxf" || item.fileExst === ".oform"; // TODO: Remove after change security options
      const isPdf = item.fileExst === ".pdf";

      const extsCustomFilter =
        this.filesSettingsStore?.extsWebCustomFilterEditing || EMPTY_ARRAY;
      const extsWebEdited =
        this.filesSettingsStore?.extsWebEdited || EMPTY_ARRAY;
      const isExtsCustomFilter = extsCustomFilter.includes(item.fileExst!);
      const isExtsWebEdited = extsWebEdited.includes(item.fileExst!);
      const canShowCustomFilter =
        canSetUpCustomFilter && isExtsCustomFilter && isExtsWebEdited;

      const isSharedWithMeFolderSection =
        this.treeFoldersStore.sharedWithMeFolderId === item.rootFolderId &&
        item.rootFolderType === FolderType.SHARE;

      let fileOptions = [
        // "open",
        "select",
        "fill-form",
        "edit",
        "open-pdf",
        "vectorization",
        "preview",
        "view",
        "pdf-view",
        "make-form",
        "edit-pdf",
        "update-xlsx-data",
        "separator0",
        "ask-ai",
        "separator6",
        "filling-status",
        "start-filling",
        "reset-and-start-filling",
        "submit-to-gallery",
        "separator-SubmitToGallery",
        "link-for-room-members",
        "sharing-settings",
        "copy-shared-link",
        "manage-links",
        "create-room-separator",
        "create-room",
        "embedding-settings",
        // "external-link",
        // "owner-change",
        // "link-for-portal-users",
        "send-by-email",
        "docu-sign",
        "version", // category
        //   "finalize-version",
        "show-version-history",
        "custom-filter",
        "show-info",
        "block-unblock-version", // need split
        "separator1",

        "open-location",
        "mark-read",
        "mark-as-favorite",
        "remove-from-favorites",
        "download",
        "download-as",
        "convert",
        "move", // category
        "move-to",
        "copy-to",
        "duplicate",
        "restore",
        "rename",
        "edit-index",
        "separator2",
        // "unsubscribe",
        "separator5",
        "delete",
        "remove-from-recent",
        "remove-shared-folder-or-file",
        "copy-general-link",
        "separate-stop-filling",
        "stop-filling",
      ];

      const noAskAi =
        !item?.security?.AskAi || isPrivacyFolder || item.private || isEncrypted;

      if (noAskAi) {
        fileOptions = removeOptions(fileOptions, ["ask-ai", "separator6"]);
      }

      if (item.external && item.isLinkExpired) {
        fileOptions = ["select", "separator0", "remove-shared-folder-or-file"];
      }

      if (optionsToRemove.length) {
        fileOptions = removeOptions(fileOptions, optionsToRemove);
      }

      if (!isSharedWithMeFolderSection) {
        fileOptions = removeOptions(fileOptions, [
          "remove-shared-folder-or-file",
        ]);
      }

      if (!item.security?.UpdateXlsx) {
        fileOptions = removeOptions(fileOptions, ["update-xlsx-data"]);
      }

      if (this.publicRoomStore.isPublicRoom) {
        fileOptions = removeOptions(fileOptions, [
          "separator0",
          "sharing-settings",
          "send-by-email",
          "show-info",
          "separator1",
          "create-room-separator",
          "create-room",
          "separator2",
          "remove-from-recent",
          "copy-general-link",
          "mark-as-favorite",
          "remove-from-favorites",
          "copy-to",
          "ask-ai",
          "separator6",
        ]);

        if (!canMove && !canDuplicate) {
          fileOptions = removeOptions(fileOptions, ["move"]);
        }
      }

      if (!item.security?.FillingStatus) {
        fileOptions = removeOptions(fileOptions, ["filling-status"]);
      }

      if (!item.security?.StartFilling) {
        fileOptions = removeOptions(fileOptions, ["start-filling"]);
      }
      if (!item.security?.ResetFilling) {
        fileOptions = removeOptions(fileOptions, ["reset-and-start-filling"]);
      }

      if (!item.security?.StopFilling) {
        fileOptions = removeOptions(fileOptions, [
          "separate-stop-filling",
          "stop-filling",
        ]);
      }

      if (!canShowCustomFilter) {
        fileOptions = removeOptions(fileOptions, ["custom-filter"]);
      }

      if (!canDownload) {
        fileOptions = removeOptions(fileOptions, ["download"]);
      }

      if (
        !isPdf ||
        (shouldFillForm && canFillForm) ||
        isRecycleBinFolder ||
        !item.security?.OpenForm
      ) {
        fileOptions = removeOptions(fileOptions, ["open-pdf"]);
      }

      if (
        !isPdf ||
        !item.security!.EditForm ||
        item.startFilling ||
        !item.isForm
      ) {
        fileOptions = removeOptions(fileOptions, ["edit-pdf"]);
      }

      if (
        !isPdf ||
        !(window.ClientConfig as TClientConfigWithPdfViewer)?.pdfViewer ||
        isRecycleBinFolder
      ) {
        fileOptions = removeOptions(fileOptions, ["pdf-view"]);
      }

      if (!canLockFile) {
        fileOptions = removeOptions(fileOptions, ["block-unblock-version"]);
      }

      if (!canChangeVersionFileHistory) {
        fileOptions = removeOptions(fileOptions, ["finalize-version"]);
      }

      if (!canViewVersionFileHistory) {
        fileOptions = removeOptions(fileOptions, ["show-version-history"]);
      }

      if (!canChangeVersionFileHistory && !canViewVersionFileHistory) {
        fileOptions = removeOptions(fileOptions, ["version"]);
        if (item.rootFolderType === FolderType.Archive) {
          fileOptions = removeOptions(fileOptions, ["separator0"]);
        }
      }

      if (!canRenameItem) {
        fileOptions = removeOptions(fileOptions, ["rename"]);
      }

      if (canOpenPlayer || !canEditFile) {
        fileOptions = removeOptions(fileOptions, ["edit"]);
      }

      if (!(shouldFillForm && canFillForm) || !item.isForm) {
        fileOptions = removeOptions(fileOptions, ["fill-form"]);
      }

      if (!canDelete) {
        fileOptions = removeOptions(fileOptions, ["delete"]);
      }

      if (!canMove) {
        fileOptions = removeOptions(fileOptions, ["move-to"]);
      }

      if (!canCopy && !isEncrypted) {
        fileOptions = removeOptions(fileOptions, ["copy-to"]);
      }

      if (!canDuplicate) {
        fileOptions = removeOptions(fileOptions, ["duplicate"]);
      }

      if (!canMove && !canCopy && !canDuplicate && !isEncrypted) {
        fileOptions = removeOptions(fileOptions, ["move"]);
      }

      if (!(isOldForm && canDuplicate))
        fileOptions = removeOptions(fileOptions, ["make-form"]);

      if (!canSubmitToFormGallery || isOldForm) {
        fileOptions = removeOptions(fileOptions, [
          "submit-to-gallery",
          "separator-SubmitToGallery",
        ]);
      }

      if (item.rootFolderType === FolderType.Archive) {
        fileOptions = removeOptions(fileOptions, [
          "mark-read",
          "mark-as-favorite",
        ]);
      }

      if (!canConvert) {
        fileOptions = removeOptions(fileOptions, ["download-as"]);
      }

      if (!mustConvert || isEncrypted) {
        fileOptions = removeOptions(fileOptions, ["convert"]);
      }

      if (!canViewFile || isRecycleBinFolder) {
        fileOptions = removeOptions(fileOptions, ["preview"]);
      }

      if (!canOpenPlayer || isRecycleBinFolder) {
        fileOptions = removeOptions(fileOptions, ["view"]);
      }

      if (!isDocuSign) {
        fileOptions = removeOptions(fileOptions, ["docu-sign"]);
      }

      if (
        isEditing ||
        item.rootFolderType === FolderType.Archive ||
        (isFavoritesFolder && !item?.isFavorite) ||
        isFavoritesFolder ||
        isRecentFolder
      )
        fileOptions = removeOptions(fileOptions, ["separator2"]);

      if (item?.isFavorite) {
        fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
      } else {
        fileOptions = removeOptions(fileOptions, ["remove-from-favorites"]);
      }

      if (isFavoritesFolder) {
        fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
        fileOptions = removeOptions(fileOptions, ["delete"]);
      }

      if (isRecycleBinFolder) {
        fileOptions = removeOptions(fileOptions, [
          "mark-as-favorite",
          "remove-from-favorites",
        ]);
      }

      if (isEncrypted) {
        fileOptions = removeOptions(fileOptions, [
          "link-for-room-members",
          "sharing-settings",
          "copy-shared-link",
          "manage-links",
          "copy-general-link",
          "send-by-email",
          "create-room",
          "create-room-separator",
          "ask-ai",
          "separator6",
          "make-form",
          "submit-to-gallery",
          "separator-SubmitToGallery",
          "docu-sign",
          "custom-filter",
          "update-xlsx-data",
          "vectorization",
          "embedding-settings",
          "convert",
          "download-as",
          "mark-as-favorite",
          "rename",
          "edit-index",
          "show-version-history",
          "finalize-version",
          "version",
          "fill-form",
          "filling-status",
          "start-filling",
          "reset-and-start-filling",
          "separate-stop-filling",
          "stop-filling",
          "block-unblock-version",
        ]);

        fileOptions.push("download-encrypted");

        const userKeys = this.userStore?.encryptionKeys;
        const hasEncryptionKeys =
          Array.isArray(userKeys) && userKeys.length > 0;

        if (!hasEncryptionKeys) {
          fileOptions = removeOptions(fileOptions, [
            "view",
            "pdf-view",
            "download",
            "preview",
            "edit",
            "open-pdf",
            "edit-pdf",
          ]);
        }
      }

      // if (isFavoritesFolder || isRecentFolder) {
      //   fileOptions = removeOptions(fileOptions, [
      //     //"unsubscribe",
      //   ]);
      // }

      if (!isRecycleBinFolder) {
        fileOptions = removeOptions(fileOptions, ["restore"]);

        if (enablePlugins) {
          if (
            !item.viewAccessibility!.MediaView &&
            !item.viewAccessibility!.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.file,
              item.fileExst,
              security,
              item.security,
              item.id,
            );

            pluginFilesKeys &&
              pluginFilesKeys.forEach((key) => fileOptions.push(key));
          }

          if (
            !item.viewAccessibility!.MediaView &&
            item.viewAccessibility!.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.image,
              item.fileExst,
              security,
              item.security,
              item.id,
            );

            pluginFilesKeys &&
              pluginFilesKeys.forEach((key) => fileOptions.push(key));
          }

          if (
            item.viewAccessibility!.MediaView &&
            !item.viewAccessibility!.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.video,
              item.fileExst,
              security,
              item.security,
              item.id,
            );

            pluginFilesKeys &&
              pluginFilesKeys.forEach((key) => fileOptions.push(key));
          }
        }
      }

      if (!hasNew) {
        fileOptions = removeOptions(fileOptions, ["mark-read"]);
      }

      if (
        !(
          isRecentFolder ||
          isFavoritesFolder ||
          (isMyFolder && (this.filterType || this.filterSearch))
        )
      ) {
        fileOptions = removeOptions(fileOptions, ["open-location"]);
      }

      if (isMyFolder || isRecycleBinFolder || !canCopyLink) {
        fileOptions = removeOptions(fileOptions, ["link-for-room-members"]);
      }

      if (this.publicRoomStore.isPublicRoom || !canEmbed) {
        fileOptions = removeOptions(fileOptions, ["embedding-settings"]);
      }

      fileOptions = removeSeparator(fileOptions);

      return fileOptions;
    }
    if (isTemplate) {
      let templateOptions = [
        "select",
        "open",
        "separator0",
        "create-room-from-template",
        "edit-template",
        "access-settings",
        "link-for-room-members",
        "room-info",
        "separator1",
        "download",
        "delete",
      ];

      if (optionsToRemove.length) {
        templateOptions = removeOptions(templateOptions, optionsToRemove);
      }

      return templateOptions;
    } else if (isAIAgent) {
      const canInviteUserInAgent =
        item.security?.EditAccess &&
        !this.settingsStore.aiConfig?.aiReadyNeedReset;
      const canRemoveAgent = item.security?.Delete;

      const canPinAgent = item.security?.Pin;

      const canEditAgent =
        item.security?.EditRoom &&
        !this.settingsStore.aiConfig?.aiReadyNeedReset;

      const canViewAgentInfo = item.security?.Read;
      const canMuteAgent = item.security?.Mute;

      const canChangeOwner =
        item.security?.ChangeOwner &&
        !this.settingsStore.aiConfig?.aiReadyNeedReset;

      let agentOptions = [
        "select",
        "open",
        "separator0",
        "edit-agent",
        "invite-users-to-room",
        "link-for-room-members",
        "room-info",
        "pin-room",
        "unpin-room",
        "mute-room",
        "unmute-room",
        "separator1",
        "duplicate-room",
        "download",
        "change-agent-owner",
        "leave-room",
        "delete",
      ];

      if (optionsToRemove.length) {
        agentOptions = removeOptions(agentOptions, optionsToRemove);
      }

      if (!canEditAgent) {
        agentOptions = removeOptions(agentOptions, ["edit-agent"]);
      }

      if (!canInviteUserInAgent) {
        agentOptions = removeOptions(agentOptions, ["invite-users-to-room"]);
      }

      if (!canChangeOwner) {
        agentOptions = removeOptions(agentOptions, ["change-agent-owner"]);
      }

      if (!canRemoveAgent) {
        agentOptions = removeOptions(agentOptions, ["delete"]);
      }

      if (!canDuplicate) {
        agentOptions = removeOptions(agentOptions, ["duplicate-room"]);
      }

      if (!canDownload) {
        agentOptions = removeOptions(agentOptions, ["download"]);
      }

      if (!canPinAgent) {
        agentOptions = removeOptions(agentOptions, ["unpin-room", "pin-room"]);
      } else {
        agentOptions = item.pinned
          ? removeOptions(agentOptions, ["pin-room"])
          : removeOptions(agentOptions, ["unpin-room"]);
      }

      if (!canMuteAgent) {
        agentOptions = removeOptions(agentOptions, [
          "unmute-room",
          "mute-room",
        ]);
      } else {
        agentOptions = item.mute
          ? removeOptions(agentOptions, ["mute-room"])
          : removeOptions(agentOptions, ["unmute-room"]);
      }

      if (!canViewAgentInfo) {
        agentOptions = removeOptions(agentOptions, ["room-info"]);
      }

      agentOptions = removeSeparator(agentOptions);

      return agentOptions;
    }
    if (isRoom) {
      const canInviteUserInRoom = item.private
        ? item.security?.EditRoom
        : item.security?.EditAccess;
      const canRemoveRoom = item.security?.Delete;

      const canArchiveRoom = item.security?.Move;
      const canPinRoom = item.security?.Pin;

      const canEditRoom = item.security?.EditRoom;

      const canViewRoomInfo =
        item.security?.Read || isLockedSharedRoom(item as TRoom);
      const canMuteRoom = item.security?.Mute && item.inRoom;

      const canChangeOwner = item.security?.ChangeOwner;

      const isPublicRoomType =
        item.roomType === RoomsType.PublicRoom ||
        item.roomType === RoomsType.FormRoom ||
        item.roomType === RoomsType.CustomRoom;

      let roomOptions = [
        "select",
        "open",
        "separator0",
        "link-for-room-members",
        "reconnect-storage",
        "edit-room",
        "invite-users-to-room",
        "external-link",
        "embedding-settings",
        "room-info",
        "create-group",
        "add-to-group",
        "remove-from-group",
        "pin-room",
        "unpin-room",
        "mute-room",
        "unmute-room",
        "edit-index",
        "short-tour",
        "export-room-index",
        "save-as-template",
        "separator1",
        "duplicate-room",
        "download",
        "download-encrypted",
        "change-room-owner",
        "archive-room",
        "unarchive-room",
        "leave-room",
        "delete",
        "remove-shared-room",
      ];

      if (!item.private) {
        roomOptions = removeOptions(roomOptions, ["download-encrypted"]);
      }

      if (!item.external) {
        roomOptions = removeOptions(roomOptions, ["remove-shared-room"]);
      }

      if (optionsToRemove.length) {
        roomOptions = removeOptions(roomOptions, optionsToRemove);
      }

      if (isArchiveFolder) {
        roomOptions = removeOptions(roomOptions, [
          "external-link",
          "link-for-room-members",
        ]);
      }

      if (!isPublicRoomType || this.publicRoomStore.isPublicRoom) {
        roomOptions = removeOptions(roomOptions, ["external-link"]);
      }

      if (item.private) {
        roomOptions = removeOptions(roomOptions, [
          "external-link",
          "link-for-room-members",
          "embedding-settings",
          "edit-index",
          "export-room-index",
          "short-tour",
          "save-as-template",
          "duplicate-room",
          "download",
        ]);
      }

      if (!canEditRoom) {
        roomOptions = removeOptions(roomOptions, [
          "edit-room",
          "save-as-template",
          "reconnect-storage",
        ]);
      }

      if (!canInviteUserInRoom) {
        roomOptions = removeOptions(roomOptions, ["invite-users-to-room"]);
      }

      if (!canChangeOwner) {
        roomOptions = removeOptions(roomOptions, ["change-room-owner"]);
      }

      if (!canArchiveRoom) {
        roomOptions = removeOptions(roomOptions, [
          "archive-room",
          "unarchive-room",
        ]);
      }

      if (item.roomType === RoomsType.FormRoom) {
        roomOptions = removeOptions(roomOptions, ["archive-room"]);
      }

      if (!canRemoveRoom) {
        roomOptions = removeOptions(roomOptions, ["delete"]);
      }

      if (!canDuplicate) {
        roomOptions = removeOptions(roomOptions, ["duplicate-room"]);
      }

      if (!canDownload) {
        roomOptions = removeOptions(roomOptions, ["download"]);
      }

      if (!item.providerKey) {
        roomOptions = removeOptions(roomOptions, ["reconnect-storage"]);
      }

      if (!canPinRoom) {
        roomOptions = removeOptions(roomOptions, ["unpin-room", "pin-room"]);
      } else {
        item.pinned
          ? (roomOptions = removeOptions(roomOptions, ["pin-room"]))
          : (roomOptions = removeOptions(roomOptions, ["unpin-room"]));
      }

      if (!canMuteRoom) {
        roomOptions = removeOptions(roomOptions, ["unmute-room", "mute-room"]);
      } else {
        item.mute
          ? (roomOptions = removeOptions(roomOptions, ["mute-room"]))
          : (roomOptions = removeOptions(roomOptions, ["unmute-room"]));
      }

      if (this.publicRoomStore.isPublicRoom || !canEmbed) {
        roomOptions = removeOptions(roomOptions, ["embedding-settings"]);
      }

      if (!canViewRoomInfo) {
        roomOptions = removeOptions(roomOptions, ["room-info"]);
      }

      const { organizeRoomsGrouping } = this.filesSettingsStore;
      // dialogsStore is attached post-construction in
      // store/index.js; the non-null assertion keeps the old unchecked read.
      const { roomGroups } = this.dialogsStore!;
      const currentGroupId = this.roomsFilter?.groupId;
      if (
        !organizeRoomsGrouping ||
        isArchiveFolder ||
        item.rootFolderType === FolderType.Archive ||
        this.treeFoldersStore.isAIAgentsFolder
      ) {
        roomOptions = removeOptions(roomOptions, [
          "create-group",
          "add-to-group",
          "remove-from-group",
        ]);
      } else if (!roomGroups || roomGroups.length === 0) {
        roomOptions = removeOptions(roomOptions, [
          "add-to-group",
          "remove-from-group",
        ]);
      } else if (!currentGroupId) {
        roomOptions = removeOptions(roomOptions, ["remove-from-group"]);
      }

      if (isArchiveFolder || item.rootFolderType === FolderType.Archive) {
        roomOptions = removeOptions(roomOptions, ["archive-room"]);
      } else {
        roomOptions = removeOptions(roomOptions, ["unarchive-room"]);

        if (enablePlugins) {
          const pluginRoomsKeys = this.pluginStore.getContextMenuKeysByType(
            PluginFileType.room,
            null,
            security,
            item.security,
            item.id,
          );

          pluginRoomsKeys &&
            pluginRoomsKeys.forEach((key) => roomOptions.push(key));
        }
      }

      roomOptions = removeSeparator(roomOptions);

      return roomOptions;
    }

    const isSharedWithMeFolderSection =
      this.treeFoldersStore.sharedWithMeFolderId === item.rootFolderId &&
      item.rootFolderType === FolderType.SHARE;

    let folderOptions = [
      "select",
      "open",
      // "separator0",
      "update-xlsx-data",
      "sharing-settings",
      "copy-shared-link",
      "manage-links",
      "create-room-separator",
      "create-room",
      "link-for-room-members",
      // "owner-change",
      "show-info",
      // "link-for-portal-users",
      "separator1",
      "open-location",
      "mark-as-favorite",
      "remove-from-favorites",
      "download",
      "move", // category
      "move-to",
      "copy-to",
      "duplicate",
      "mark-read",
      "restore",
      "edit-index",
      "rename",
      // "change-thirdparty-info",
      "separator2",
      // "unsubscribe",
      "remove-shared-folder-or-file",
      "delete",
    ];

    if (item.external && item.isLinkExpired) {
      folderOptions = ["select", "separator0", "remove-shared-folder-or-file"];
    }

    if (!item.security?.UpdateXlsx) {
      folderOptions = removeOptions(folderOptions, ["update-xlsx-data"]);
    }

    if (!isSharedWithMeFolderSection) {
      folderOptions = removeOptions(folderOptions, [
        "remove-shared-folder-or-file",
      ]);
    }

    if (optionsToRemove.length) {
      folderOptions = removeOptions(folderOptions, optionsToRemove);
    }

    if (this.publicRoomStore.isPublicRoom) {
      folderOptions = removeOptions(folderOptions, [
        "show-info",
        "sharing-settings",
        "copy-shared-link",
        "manage-links",
        "create-room-separator",
        "separator1",
        "create-room",
        "mark-as-favorite",
        "remove-from-favorites",
        "copy-to",
      ]);

      if (!canMove && !canDuplicate) {
        folderOptions = removeOptions(folderOptions, ["move"]);
      }
    }

    if (!canDownload) {
      folderOptions = removeOptions(folderOptions, ["download"]);
    }

    if (!canRenameItem) {
      folderOptions = removeOptions(folderOptions, ["rename"]);
    }

    if (!canDelete) {
      folderOptions = removeOptions(folderOptions, ["delete"]);
    }
    if (!canMove) {
      folderOptions = removeOptions(folderOptions, ["move-to"]);
    }

    if (!canCopy) {
      folderOptions = removeOptions(folderOptions, ["copy-to"]);
    }

    if (!canDuplicate) {
      folderOptions = removeOptions(folderOptions, ["duplicate"]);
    }

    if (!canMove && !canCopy && !canDuplicate) {
      folderOptions = removeOptions(folderOptions, ["move"]);
    }

    // if (item.rootFolderType === FolderType.Archive) {
    //   folderOptions = removeOptions(folderOptions, [
    //     "change-thirdparty-info",
    //     "separator2",
    //   ]);
    // }

    if (isPrivacyFolder || item.private) {
      folderOptions = removeOptions(folderOptions, [
        "sharing-settings",
        "copy-shared-link",
        "manage-links",
        "link-for-room-members",
        "create-room-separator",
        "create-room",
        "mark-as-favorite",
        "remove-from-favorites",
        "edit-index",
        "copy-to",
        "duplicate",
        "download",
      ]);

      if (!canMove) {
        folderOptions = removeOptions(folderOptions, ["move", "move-to"]);
      }

      if (canDownload) {
        folderOptions.push("download-encrypted");
      }
    }

    if (isRecycleBinFolder) {
      folderOptions = removeOptions(folderOptions, [
        "open",
        "link-for-room-members",
        // "link-for-portal-users",
        // "sharing-settings",
        "mark-read",
        "separator0",
        "separator1",
        "mark-as-favorite",
        "remove-from-favorites",
      ]);
    } else {
      folderOptions = removeOptions(folderOptions, ["restore"]);

      if (enablePlugins) {
        const pluginFoldersKeys = this.pluginStore.getContextMenuKeysByType(
          PluginFileType.folder,
          null,
          security,
          item.security,
          item.id,
        );

        pluginFoldersKeys &&
          pluginFoldersKeys.forEach((key) => folderOptions.push(key));
      }
    }

    if (!hasNew) {
      folderOptions = removeOptions(folderOptions, ["mark-read"]);
    }

    if (isThirdPartyFolder && isDesktopClient)
      folderOptions = removeOptions(folderOptions, ["separator2"]);

    // if (!isThirdPartyFolder)
    //   folderOptions = removeOptions(folderOptions, [
    //     "change-thirdparty-info",
    //   ]);

    // if (isThirdPartyItem) {

    //   if (isSharedWithMeFolder) {
    //     folderOptions = removeOptions(folderOptions, [
    //       "change-thirdparty-info",
    //     ]);
    //   } else {
    //     if (isDesktopClient) {
    //       folderOptions = removeOptions(folderOptions, [
    //         "change-thirdparty-info",
    //       ]);
    //     }

    //     folderOptions = removeOptions(folderOptions, ["remove"]);

    //     if (!item) {
    //       //For damaged items
    //       folderOptions = removeOptions(folderOptions, [
    //         "open",
    //         "download",
    //       ]);
    //     }
    //   }
    // } else {
    //   folderOptions = removeOptions(folderOptions, [
    //     "change-thirdparty-info",
    //   ]);
    // }

    if (
      !(
        isRecentFolder ||
        isFavoritesFolder ||
        (isMyFolder && (this.filterType || this.filterSearch))
      )
    ) {
      folderOptions = removeOptions(folderOptions, ["open-location"]);
    }

    if (isMyFolder) {
      folderOptions = removeOptions(folderOptions, ["link-for-room-members"]);
    }

    if (item?.isFavorite) {
      folderOptions = removeOptions(folderOptions, ["mark-as-favorite"]);
    } else {
      folderOptions = removeOptions(folderOptions, ["remove-from-favorites"]);
    }

    if (isFavoritesFolder) {
      folderOptions = removeOptions(folderOptions, ["mark-as-favorite"]);
      folderOptions = removeOptions(folderOptions, ["delete"]);
    }

    folderOptions = removeSeparator(folderOptions);

    return folderOptions;
  };

  createFile = async (
    folderId: number | string,
    title: string,
    templateId?: number,
    formId?: number,
  ) => {
    return api.files.createFile(folderId, title, templateId, formId);
  };

  setRoomCreated = (roomCreated: boolean) => {
    this.roomCreated = roomCreated;
  };

  createRoom = (roomParams: unknown) => {
    this.roomCreated = true;
    return api.rooms.createRoom(roomParams);
  };

  updateRoomPin = (item: number | string) => {
    const idx = this.folders.findIndex((folder) => folder.id === item);

    if (idx === -1) return;
    this.folders[idx].pinned = !this.folders[idx].pinned;
  };

  scrollToTop = () => {
    if (this.selectedFolderStore.isIndexedFolder) return;

    const scrollElm = isMobile()
      ? document.querySelector("#customScrollBar > .scroll-wrapper > .scroller")
      : document.querySelector("#sectionScroll > .scroll-wrapper > .scroller");

    scrollElm && scrollElm.scrollTo(0, 0);
  };

  removeFiles = (
    fileIds?: Nullable<(number | string)[]>,
    folderIds?: Nullable<(number | string)[]>,
    showToast?: Nullable<() => void>,
    destFolderId?: Nullable<number | string>,
  ) => {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTemplatesFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = this.treeFoldersStore;

    const isRooms =
      isRoomsFolder ||
      isArchiveFolder ||
      isTemplatesFolder ||
      isAIAgentsFolder ||
      isFormsFolder;

    let deleteCount = 0;

    if (fileIds) {
      let i = fileIds.length;
      while (i !== 0) {
        const file = this.files.find((x) => x.id === fileIds[i - 1]);
        if (file) deleteCount += 1;

        i--;
      }
    }

    if (folderIds) {
      let i = folderIds.length;
      while (i !== 0) {
        const folder = this.folders.find((x) => x.id === folderIds[i - 1]);
        if (folder) deleteCount += 1;

        i--;
      }
    }

    const newFilter = isRooms ? this.roomsFilter.clone() : this.filter.clone();
    newFilter.total -= deleteCount;

    if (destFolderId && destFolderId === this.selectedFolderStore.id) return;

    if (newFilter.total <= this.filesList.length) {
      const files = fileIds
        ? this.files.filter((x) => !fileIds.includes(x.id))
        : this.files;
      const folders = folderIds
        ? this.folders.filter((x) => !folderIds.includes(x.id))
        : this.folders;

      // when only folderIds are passed the old JS still
      // reads `fileIds.includes` lazily via the ternary branches — the
      // non-null assertion below keeps the same unchecked access.
      const hotkeysClipboard = fileIds
        ? this.hotkeysClipboard.filter(
            (f) => !fileIds.includes(f.id!) && !f.isFolder,
          )
        : this.hotkeysClipboard.filter(
            (f) => !folderIds!.includes(f.id!) && f.isFolder,
          );

      if (!this.isFiltered) {
        this.setIsEmptyPage(newFilter.total <= 0);
      }

      runInAction(() => {
        isRooms
          ? this.setRoomsFilter(newFilter as TRoomsFilter)
          : this.setFilter(newFilter as TFilesFilter);
        this.setFiles(files);
        this.setFolders(folders);
        this.setHotkeysClipboard(hotkeysClipboard);
        if (fileIds) this.setTempActionFilesIds(EMPTY_ARRAY);
        if (folderIds) this.setTempActionFoldersIds(EMPTY_ARRAY);
        this.clearActiveOperations(fileIds, folderIds);
      });

      showToast && showToast();

      return;
    }

    if (this.filesList.length - deleteCount >= this.filter.pageCount) {
      const files = fileIds
        ? this.files.filter((x) => !fileIds.includes(x.id))
        : this.files;

      const folders = folderIds
        ? this.folders.filter((x) => !folderIds.includes(x.id))
        : this.folders;

      runInAction(() => {
        isRooms
          ? this.setRoomsFilter(newFilter as TRoomsFilter)
          : this.setFilter(newFilter as TFilesFilter);
        this.setFiles(files);
        this.setFolders(folders);
        if (fileIds) this.setTempActionFilesIds(EMPTY_ARRAY);
        if (folderIds) this.setTempActionFoldersIds(EMPTY_ARRAY);
        this.clearActiveOperations(fileIds, folderIds);
      });

      showToast && showToast();

      return;
    }

    // RoomsFilter has no declared startIndex/folder members
    // but the old JS sets/reads them on either filter kind; the erased casts
    // keep that dynamic behavior.
    (newFilter as TFilesFilter).startIndex =
      (newFilter.page + 1) * newFilter.pageCount - deleteCount;
    newFilter.pageCount = deleteCount;
    if (isRooms) {
      const req = isAIAgentsFolder ? api.ai.getNewAiAgents : api.rooms.getRooms;
      return req(newFilter as TRoomsFilter)
        .then((res) => {
          const folders = folderIds
            ? this.folders.filter((x) => !folderIds.includes(x.id))
            : this.folders;

          const newFolders = [...folders, ...res.folders];

          const roomsFilter = this.roomsFilter.clone();
          roomsFilter.total = res.total;

          runInAction(() => {
            this.setRoomsFilter(roomsFilter);
            this.setFolders(newFolders);
            this.clearActiveOperations(fileIds, folderIds);
          });

          showToast && showToast();
        })
        .catch((err) => {
          toastr.error(err);
        })
        .finally(() => {
          if (fileIds) this.setTempActionFilesIds(EMPTY_ARRAY);
          if (folderIds) this.setTempActionFoldersIds(EMPTY_ARRAY);
        });
    }
    api.files
      .getFolder((newFilter as TFilesFilter).folder, newFilter as TFilesFilter)
      .then((res) => {
        const files = fileIds
          ? this.files.filter((x) => !fileIds.includes(x.id))
          : this.files;
        const folders = folderIds
          ? this.folders.filter((x) => !folderIds.includes(x.id))
          : this.folders;

        const newFiles = [...files, ...res.files];
        const newFolders = [...folders, ...res.folders];

        const filter = this.filter.clone();
        filter.total = res.total;

        runInAction(() => {
          this.setFilter(filter);
          this.setFiles(newFiles);
          this.setFolders(newFolders);
          this.clearActiveOperations(fileIds, folderIds);
        });

        showToast && showToast();
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        if (fileIds) this.setTempActionFilesIds(EMPTY_ARRAY);
        if (folderIds) this.setTempActionFoldersIds(EMPTY_ARRAY);
      });
  };

  updateFile = (fileId: number | string, title: string) => {
    return api.files
      .updateFile(fileId, title)
      .then((file) => this.setFile(file));
  };

  recoverEncryptedFilenamesForCurrentView = () => {
    const userId = this.userStore?.user?.id;
    if (!userId) return;
    const identity = SecretStorage.getCached(String(userId));
    if (!identity) return;
    const candidates = (this.files ?? [])
      .filter((f) => f.encrypted && f.id && f.viewUrl)
      .map((f) => ({ id: f.id, viewUrl: f.viewUrl }));
    if (candidates.length === 0) return;
    const roomId =
      this.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
      (this.selectedFolderStore.isRoom ? this.selectedFolderStore.id : null);
    if (!roomId) return;
    void recoverEncryptedFilenames(
      candidates,
      String(userId),
      identity,
      roomId,
    );
  };

  ensureEncryptedFilenameForFile = (file: TFile) => {
    if (!file?.encrypted || !file.id || !file.viewUrl) return;
    const userId = this.userStore?.user?.id;
    if (!userId) return;
    const identity = SecretStorage.getCached(String(userId));
    if (!identity) return;
    const roomId =
      this.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
      (this.selectedFolderStore.isRoom ? this.selectedFolderStore.id : null);
    if (!roomId) return;
    void ensureDecryptedFilename(
      { id: file.id, viewUrl: file.viewUrl, encrypted: file.encrypted },
      String(userId),
      identity,
      roomId,
    );
  };

  syncEncryptedRoom = () => {
    this.recoverEncryptedFilenamesForCurrentView();

    const roomId =
      this.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
      (this.selectedFolderStore.isRoom ? this.selectedFolderStore.id : null);
    if (roomId) {
      this.maybeBackfillEncryptedRoom(roomId, this.selectedFolderStore.security);
    }
  };

  maybeBackfillEncryptedRoom = (
    roomId: Nullable<number | string>,
    security?: Nullable<{ EditRoom?: boolean }>,
  ) => {
    if (!roomId) return;
    // Only room managers/admins backfill — they're the likely "inviter" with
    // unwrap access. Regular members may not even have the DEK to re-share.
    if (!security?.EditRoom) {
      console.info(
        "[ENCRYPTION] Backfill skipped for room",
        roomId,
        "— no EditRoom permission",
      );
      return;
    }

    if (this._backfilledEncryptedRooms.has(roomId)) return;

    const userId = this.userStore?.user?.id;
    if (!userId) return;

    const identity = SecretStorage.getCached(String(userId));
    if (!identity) {
      console.info(
        "[ENCRYPTION] Backfill skipped for room",
        roomId,
        "— identity not unlocked yet (will retry on next entry)",
      );
      return;
    }

    this._backfilledEncryptedRooms.add(roomId);
    console.info("[ENCRYPTION] Starting backfill sweep for room", roomId);

    // backfillEncryptedFilesForRoomMembers is typed with a
    // numeric roomId; string ids pass through unchanged at runtime.
    void backfillEncryptedFilesForRoomMembers(roomId as number, {
      currentUserId: String(userId),
      identity,
      // Background sweep: don't surprise the user with a TOFU prompt.
      // Mismatches are skipped silently and re-considered next session.
      onKeyChange: async () => "refuse",
    })
      .then(({ fileResults, skippedMembers }) => {
        const wrappedFiles = fileResults.filter((r) => r.success).length;
        const failedFiles = fileResults.filter((r) => !r.success).length;
        console.info(
          "[ENCRYPTION] Backfill done for room",
          roomId,
          "— files processed:",
          wrappedFiles,
          "failed:",
          failedFiles,
          "skipped members:",
          skippedMembers.length,
        );
      })
      .catch((error) => {
        this._backfilledEncryptedRooms.delete(roomId);
        console.error("[ENCRYPTION] Backfill failed for room", roomId, error);
      });
  };

  renameFolder = (folderId: number | string, title: string) => {
    // api.files.renameFolder is typed with a numeric
    // folderId; the erased cast keeps the runtime pass-through of string ids.
    return api.files.renameFolder(folderId as number, title).then((folder) => {
      this.setFolder(folder);
    });
  };

  getFilesCount = () => {
    const { filesCount, foldersCount } = this.selectedFolderStore;
    // the original expression `filesCount + this.folders`
    // coerces the array to a string (always truthy) — preserved verbatim
    // with an erased cast; candidate for a real fix.
    return (filesCount + (this.folders as unknown as number))
      ? this.folders.length
      : foldersCount;
  };

  getServiceFilesCount = () => {
    const filesLength = this.files ? this.files.length : 0;
    const foldersLength = this.folders ? this.folders.length : 0;
    return filesLength + foldersLength;
  };

  get canShare() {
    const folderType = this.selectedFolderStore.rootFolderType;
    const isVisitor =
      (this.userStore.user && this.userStore.user.isVisitor) || false;

    if (isVisitor) {
      return false;
    }

    switch (folderType) {
      case FolderType.USER:
        return true;
      case FolderType.SHARE:
        return true;
      case FolderType.COMMON:
        return this.authStore.isAdmin;
      case FolderType.TRASH:
        return false;
      case FolderType.Favorites:
        return true; // false;
      case FolderType.Recent:
        return true; // false;
      case FolderType.Privacy:
        return true;
      default:
        return false;
    }
  }

  get currentFilesCount() {
    const serviceFilesCount = this.getServiceFilesCount();
    const filesCount = this.getFilesCount();
    return this.selectedFolderStore.providerItem
      ? serviceFilesCount
      : filesCount;
  }

  get iconOfDraggedFile() {
    const { getIcon } = this.filesSettingsStore;

    if (this.selection.length === 1) {
      return getIcon(
        32,
        this.selection[0].fileExst,
        this.selection[0].providerKey,
      );
    }
    return null;
  }

  get isHeaderVisible() {
    return this.selection.length > 0;
  }

  get isHeaderIndeterminate() {
    const items = [...this.files, ...this.folders];
    return this.isHeaderVisible && this.selection.length
      ? this.selection.length < items.length
      : false;
  }

  get isHeaderChecked() {
    const items = [...this.files, ...this.folders];
    return this.isHeaderVisible && this.selection.length === items.length;
  }

  get hasCommonFolder() {
    return (
      this.treeFoldersStore.commonFolder &&
      this.selectedFolderStore.pathParts &&
      this.treeFoldersStore.commonFolder.id ===
        this.selectedFolderStore.pathParts[0].id
    );
  }

  setFirsElemChecked = (checked: boolean) => {
    this.firstElemChecked = checked;
  };

  setHeaderBorder = (headerBorder: boolean) => {
    this.headerBorder = headerBorder;
  };

  get canCreate() {
    switch (this.selectedFolderStore.rootFolderType) {
      case FolderType.USER:
      case FolderType.Rooms:
        return true;
      case FolderType.SHARE: {
        const canCreateInSharedFolder = this.selectedFolderStore.access === 1;
        return (
          !this.selectedFolderStore.isRootFolder && canCreateInSharedFolder
        );
      }
      case FolderType.Privacy:
        return (
          this.settingsStore.isDesktopClient &&
          this.settingsStore.isEncryptionSupport
        );
      case FolderType.COMMON:
        return this.authStore.isAdmin;
      case FolderType.Archive:
      case FolderType.TRASH:
      default:
        return false;
    }
  }

  onCreateAddTempItem = (items: TItem[]) => {
    const { getFileIcon, getFolderIcon } = this.filesSettingsStore;
    // fileActionStore is never assigned — this destructuring
    // throws if onCreateAddTempItem is ever called (same as the old JS).
    const { extension, title } = this.fileActionStore!;

    if (items.length && items[0].id === -1) return; // TODO: if change media collection from state remove this;

    const icon = extension
      ? getFileIcon(`.${extension}`, 32)
      : getFolderIcon(32);

    items.unshift({
      id: -1,
      title,
      parentId: this.selectedFolderStore.id as number,
      fileExst: extension,
      icon,
    });
  };

  get filterType() {
    return this.filter.filterType;
  }

  get filterSearch() {
    return this.filter.search;
  }

  getItemUrl = (
    id: number | string | undefined,
    isFolder: boolean | undefined,
    needConvert: boolean | undefined,
    canOpenPlayer: boolean | undefined,
    shareKey?: string,
    isAiRoom?: boolean,
  ) => {
    const proxyURL = window.ClientConfig?.proxy?.url || window.location.origin;

    const url = getCategoryUrl(
      isAiRoom ? CategoryType.Chat : this.categoryType,
      id,
    );

    if (canOpenPlayer) {
      if (this.publicRoomStore.isPublicRoom) {
        const key = this.publicRoomStore.publicRoomKey;
        const filterObj = FilesFilter.getFilter(window.location);

        return `${combineUrl(
          proxyURL,
          config.homepage,
          "/rooms/share",
          MEDIA_VIEW_URL,
          id,
        )}?key=${key}&${filterObj.toUrlParams()}`;
      }

      return combineUrl(proxyURL, config.homepage, MEDIA_VIEW_URL, id);
    }

    if (isFolder) {
      const folderUrl = isFolder
        ? combineUrl(proxyURL, config.homepage, `${url}?folder=${id}`)
        : null;

      return folderUrl;
    }

    const newUrl = combineUrl(
      proxyURL,
      config.homepage,
      `/doceditor?fileId=${id}${needConvert ? "&action=view" : ""}${shareKey ? `&share=${shareKey}` : ""}`,
    );

    return newUrl;
  };

  getFilesListItems = (items: TItem[]): TItem[] => {
    const { fileItemsList } = this.pluginStore;
    const { enablePlugins } = this.settingsStore;
    const { getIcon } = this.filesSettingsStore;

    return items.map((item) => {
      const {
        access,
        autoDelete,
        originTitle,
        comment,
        contentLength,
        created,
        createdBy,
        encrypted,
        fileExst,
        filesCount,
        fileStatus,
        fileType,
        folderId,
        foldersCount,
        id,
        logo,
        locked,
        private: isPrivateRoom,
        originId,
        originFolderId,
        originRoomId,
        originRoomTitle,
        parentId,
        pureContentLength,
        rootFolderType,
        rootFolderId,
        shared,
        title,
        type,
        hasDraft,
        updated,
        updatedBy,
        version,
        versionGroup,
        viewUrl,
        webUrl,
        providerKey,
        thumbnailUrl,
        thumbnailStatus,
        canShare,
        canEdit,
        roomType,
        isArchive,
        tags,
        pinned,
        security,
        viewAccessibility,
        mute,
        inRoom,
        requestToken,
        indexing,
        lifetime,
        denyDownload,
        lastOpened,
        quotaLimit,
        usedSpace,
        isCustomQuota,
        providerId,
        order,
        startFilling,
        draftLocation,
        expired,
        external,
        passwordProtected,
        watermark,
        formFillingStatus,
        customFilterEnabled,
        chatSettings,
        customFilterEnabledBy,
        lockedBy,
        location,
        ...rest
      } = item;

      const thirdPartyIcon = this.thirdPartyStore.getThirdPartyIcon(
        item.providerKey!,
        "small",
      );

      // RoomsProviderType is a ui-kit `const enum` and may
      // not be enumerated/indexed dynamically (TS2475/TS2476); the runtime
      // object exists in the babel/esbuild build, so the original lookup is
      // kept under a suppression.
      const providerType =
        RoomsProviderType[
          // @ts-expect-error TS2475/TS2476 — dynamic const enum access.
          Object.keys(RoomsProviderType).find(
            (key) => key === item.providerKey,
          ) as keyof typeof RoomsProviderType
        ];

      const canOpenPlayer =
        item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
      const needConvert = item.viewAccessibility?.MustConvert;
      const isEditing =
        (item.fileStatus! & FileStatus.IsEditing) === FileStatus.IsEditing;

      const previewUrl = canOpenPlayer
        ? this.getItemUrl(id, false, needConvert, canOpenPlayer)
        : null;

      const contextOptions = this.getFilesContextOptions(item);
      const isThirdPartyFolder = providerKey && id === rootFolderId;

      const isAIAgent =
        item.rootFolderType === FolderType.AIAgents &&
        item.roomType === RoomsType.AIRoom;

      const newSecurity = {
        ...security,
        EditAccess:
          item.security?.EditAccess &&
          !this.settingsStore.aiConfig?.aiReadyNeedReset,
        EditRoom:
          item.security?.EditRoom &&
          !this.settingsStore.aiConfig?.aiReadyNeedReset,
        ChangeOwner:
          item.security?.ChangeOwner &&
          !this.settingsStore.aiConfig?.aiReadyNeedReset,
      };

      let isFolder = item.isFolder ?? false;
      this.folders.forEach((x) => {
        if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
      });

      const { isRecycleBinFolder } = this.treeFoldersStore;

      const folderUrl =
        isFolder &&
        this.getItemUrl(
          id,
          isFolder,
          false,
          false,
          "",
          roomType === RoomsType.AIRoom,
        );

      const docUrl =
        !canOpenPlayer &&
        !isFolder &&
        this.getItemUrl(id, false, needConvert, false, requestToken);

      const href = isRecycleBinFolder
        ? null
        : previewUrl ||
          (!isFolder
            ? item.fileType === FileType.Archive
              ? item.webUrl
              : docUrl
            : folderUrl);

      const isRoom = !!roomType;
      const isTemplate =
        item.rootFolderType === FolderType.RoomTemplates && isRoom;

      const icon =
        isRoom && logo?.medium
          ? logo?.medium
          : getIcon(
              32,
              fileExst,
              providerKey,
              contentLength,
              roomType,
              isArchive,
              type,
            );

      const defaultRoomIcon = isRoom
        ? getIcon(
            32,
            fileExst,
            providerKey,
            contentLength,
            roomType,
            isArchive,
            type,
          )
        : undefined;

      const pluginOptions: {
        fileTypeName?: string;
        isPlugin?: boolean;
        fileTileIcon?: string;
      } = {};

      if (!isAIAgents() && enablePlugins && fileItemsList) {
        fileItemsList.forEach(({ value }) => {
          if (value.extension === fileExst) {
            if (value.fileTypeName)
              pluginOptions.fileTypeName = value.fileTypeName;
            pluginOptions.isPlugin = true;
            if (value.fileIconTile)
              pluginOptions.fileTileIcon = value.fileIconTile;
          }
        });
      }

      const isForm = fileExst === ".oform";

      // `void` registers the MobX dep — background cache writes re-render.
      void this.encryptedFilenameCacheVersion;
      const displayTitle = resolveDisplayTitle({ id, title, encrypted });

      return {
        access,
        // getDaysRemaining is typed for Date but receives the
        // API date string at runtime (getDaysLeft accepts both).
        daysRemaining:
          autoDelete && getDaysRemaining(autoDelete as unknown as Date),
        originTitle,
        // checked,
        comment,
        contentLength,
        contextOptions,
        created,
        createdBy,
        encrypted,
        fileExst,
        filesCount,
        fileStatus,
        fileType,
        folderId,
        foldersCount,
        icon,
        defaultRoomIcon,
        id,
        isFolder,
        isPrivateRoom: !!isPrivateRoom,
        logo,
        locked,
        lockedBy,
        new: item.new,
        mute,
        parentId,
        pureContentLength,
        rootFolderType,
        rootFolderId,
        // selectedItem,
        shared,
        title: displayTitle,
        updated,
        updatedBy,
        version,
        versionGroup,
        viewUrl,
        webUrl,
        providerKey,
        canOpenPlayer,
        // canShare,
        canShare,
        canEdit,
        thumbnailUrl,
        thumbnailStatus,
        originId,
        originFolderId,
        originRoomId,
        originRoomTitle,
        previewUrl,
        folderUrl,
        href,
        isThirdPartyFolder,
        isEditing,
        roomType,
        isRoom,
        isTemplate,
        isAIAgent,
        isArchive,
        tags,
        pinned,
        thirdPartyIcon,
        providerType,
        security: isAIAgent ? newSecurity : security,
        viewAccessibility,
        ...pluginOptions,
        inRoom,
        indexing,
        lifetime,
        denyDownload,
        type,
        hasDraft,
        isForm,
        isPDFForm: item.isForm || item.isPDFForm,
        requestToken,
        lastOpened,
        quotaLimit,
        usedSpace,
        isCustomQuota,
        providerId,
        order,
        startFilling,
        draftLocation,
        expired,
        external,
        passwordProtected,
        watermark,
        formFillingStatus,
        customFilterEnabled,
        chatSettings,
        customFilterEnabledBy,
        location,
        ...rest,
      } as TItem;
    });
  };

  get filesList() {
    // return [...this.folders, ...this.files];

    const newFolders = [...this.folders];
    const orderItems = [...this.folders, ...this.files].filter(
      (x: TItem) => x.order,
    );

    const { isVDRRoomRoot, isRoot, isSharedWithMeFolderRoot } =
      this.treeFoldersStore;

    if (
      (isVDRRoomRoot || (isSharedWithMeFolderRoot && !isRoot)) &&
      orderItems.length > 0
    ) {
      this.isEmptyPage && this.setIsEmptyPage(false);

      // `order` is guaranteed by the `.filter((x) => x.order)`
      // above; the non-null assertions keep the same unchecked access.
      orderItems.sort((a: TItem, b: TItem) => {
        if (a.order!.includes(".")) {
          return (
            Number(a.order!.split(".").at(-1)) -
            Number(b.order!.split(".").at(-1))
          );
        }

        return Number(a.order) - Number(b.order);
      });

      return this.getFilesListItems(orderItems);
    }

    newFolders.sort((a, b) => {
      const firstValue = a.pinned ? 1 : 0;
      const secondValue = b.pinned ? 1 : 0;

      return secondValue - firstValue;
    });

    const items = [...newFolders, ...this.files];

    if (items.length > 0 && this.isEmptyPage) {
      this.setIsEmptyPage(false);
    }

    return this.getFilesListItems(items);
  }

  get cbMenuItems() {
    const { isDocument, isPresentation, isSpreadsheet, isArchive, isDiagram } =
      this.filesSettingsStore;
    const { isRecentFolder } = this.treeFoldersStore;

    let cbMenu: (string | FilterType)[] = ["all"];
    const filesItems: TItem[] = [...this.files, ...this.folders];

    if (this.folders.length) {
      this.folders.forEach((item) => {
        if (item.roomType && RoomsTypes[item.roomType]) {
          cbMenu.push(`room-${RoomsTypes[item.roomType]}`);
        } else {
          cbMenu.push(FilterType.FoldersOnly);
        }
      });
    }

    filesItems.forEach((item) => {
      if (isDocument(item.fileExst!)) cbMenu.push(FilterType.DocumentsOnly);
      else if (isPresentation(item.fileExst!))
        cbMenu.push(FilterType.PresentationsOnly);
      else if (isSpreadsheet(item.fileExst!))
        cbMenu.push(FilterType.SpreadsheetsOnly);
      else if (item.viewAccessibility?.ImageView)
        cbMenu.push(FilterType.ImagesOnly);
      else if (item.viewAccessibility?.MediaView)
        cbMenu.push(FilterType.MediaOnly);
      else if (isArchive(item.fileExst!)) cbMenu.push(FilterType.ArchiveOnly);
      else if (isDiagram(item.fileExst!)) cbMenu.push(FilterType.DiagramsOnly);
    });

    const hasFiles = cbMenu.some(
      (elem) =>
        elem !== "all" &&
        elem !== `room-${FilterType.FoldersOnly}` &&
        elem !== `room-${(RoomsType as TRemovedRoomsTypes).FillingFormsRoom}` &&
        elem !== `room-${RoomsType.CustomRoom}` &&
        elem !== `room-${RoomsType.AIRoom}` &&
        elem !== `room-${RoomsType.EditingRoom}` &&
        elem !== `room-${(RoomsType as TRemovedRoomsTypes).ReviewRoom}` &&
        elem !== `room-${RoomsType.FormRoom}` &&
        elem !== `room-${(RoomsType as TRemovedRoomsTypes).ReadOnlyRoom}` &&
        elem !== `room-${RoomsType.PublicRoom}` &&
        elem !== `room-${RoomsType.VirtualDataRoom}`,
    );

    if (hasFiles && !isRecentFolder) cbMenu.push(FilterType.FilesOnly);

    cbMenu = cbMenu.filter((item, index) => cbMenu.indexOf(item) === index);

    return cbMenu;
  }

  get sortedFiles() {
    const {
      isDiagram,
      isDocument,
      isMasterFormExtension,
      isPresentation,
      isSpreadsheet,
    } = this.filesSettingsStore;

    const sortedFiles: {
      documents: TItem[];
      spreadsheets: TItem[];
      presentations: TItem[];
      masterForms: TItem[];
      pdfForms: TItem[];
      diagrams: TItem[];
      other: TItem[];
    } = {
      documents: [],
      spreadsheets: [],
      presentations: [],
      masterForms: [],
      pdfForms: [],
      diagrams: [],
      other: [],
    };

    let selection: TItem[] = this.selection.length
      ? this.selection
      : this.bufferSelection
        ? [this.bufferSelection]
        : EMPTY_ARRAY;

    selection = JSON.parse(JSON.stringify(selection));

    selection.forEach((item) => {
      item.checked = true;
      item.format = null;

      if (item.fileExst && item.viewAccessibility?.CanConvert) {
        if (isSpreadsheet(item.fileExst)) {
          sortedFiles.spreadsheets.push(item);
        } else if (isPresentation(item.fileExst)) {
          sortedFiles.presentations.push(item);
        } else if (isMasterFormExtension(item.fileExst)) {
          sortedFiles.masterForms.push(item);
        } else if (isDiagram(item.fileExst)) {
          sortedFiles.diagrams.push(item);
        } else if (!item.isPDFForm && isDocument(item.fileExst)) {
          sortedFiles.documents.push(item);
        } else if (item.isPDFForm) {
          sortedFiles.pdfForms.push(item);
        } else {
          sortedFiles.other.push(item);
        }
      } else {
        sortedFiles.other.push(item);
      }
    });

    return sortedFiles;
  }

  get userAccess() {
    switch (this.selectedFolderStore.rootFolderType) {
      case FolderType.USER:
        return true;
      case FolderType.SHARE:
        return false;
      case FolderType.COMMON:
        return (
          this.authStore.isAdmin ||
          this.selection.some((x) => x.access === 0 || x.access === 1)
        );
      case FolderType.Privacy:
        return true;
      case FolderType.TRASH:
        return true;
      default:
        return false;
    }
  }

  get isAccessedSelected() {
    return (
      this.selection.length &&
      this.selection.every((x) => x.access === 1 || x.access === 0)
    );
  }

  // get isThirdPartyRootSelection() {
  //   const withProvider = this.selection.find((x) => x.providerKey);
  //   return withProvider && withProvider.rootFolderId === withProvider.id;
  // }

  get isThirdPartySelection() {
    const withProvider = this.selection.find((x) => x.providerKey);
    return !!withProvider;
  }

  get canConvertSelected() {
    const selection = this.selection.length
      ? this.selection
      : this.bufferSelection
        ? [this.bufferSelection]
        : EMPTY_ARRAY;

    return selection.some((selected) => {
      if (
        selected.isFolder === true ||
        !selected.fileExst ||
        !selected.viewAccessibility
      )
        return false;

      return selected.viewAccessibility?.CanConvert;
    });
  }

  get isViewedSelected() {
    return this.selection.some((selected) => {
      if (selected.isFolder === true || !selected.fileExst) return false;
      return selected.viewAccessibility?.WebView;
    });
  }

  get isMediaSelected() {
    return this.selection.some((selected) => {
      if (selected.isFolder === true || !selected.fileExst) return false;
      return (
        selected.viewAccessibility?.ImageView ||
        selected.viewAccessibility?.MediaView
      );
    });
  }

  get selectionTitle() {
    if (this.selection.length === 0 && this.bufferSelection) {
      return this.bufferSelection.title;
    }

    return this.selection.find((el) => el.title)?.title || null;
  }

  get hasRoomsToResetQuota() {
    const canResetCustomQuota = (item: TItem) => {
      const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

      if (!isDefaultRoomsQuotaSet) return false;

      if (item.providerKey) return false;

      return item.security?.EditRoom && item.isCustomQuota;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canResetCustomQuota(x));

    return rooms.length > 0;
  }

  get hasAIAgentsToResetQuota() {
    const canResetCustomQuota = (item: TItem) => {
      const { isDefaultAIAgentsQuotaSet } = this.authStore.currentQuotaStore;

      if (!isDefaultAIAgentsQuotaSet) return false;

      return item.security?.EditRoom && item.isCustomQuota;
    };

    const aiAgents = this.selection.filter((x) => canResetCustomQuota(x));

    return aiAgents.length > 0;
  }

  get hasRoomsToDisableQuota() {
    const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

    const canDisableQuota = (item: TItem) => {
      if (!isDefaultRoomsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canDisableQuota(x));

    return rooms.length > 0;
  }

  get hasAIAgentsToDisableQuota() {
    const { isDefaultAIAgentsQuotaSet } = this.authStore.currentQuotaStore;

    const canDisableQuota = (item: TItem) => {
      if (!isDefaultAIAgentsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    const aiAgents = this.selection.filter((x) => canDisableQuota(x));

    return aiAgents.length > 0;
  }

  get hasRoomsToChangeQuota() {
    const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

    const canChangeQuota = (item: TItem) => {
      if (!isDefaultRoomsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canChangeQuota(x));

    return rooms.length > 0;
  }

  get hasAIAgentsToChangeQuota() {
    const { isDefaultAIAgentsQuotaSet } = this.authStore.currentQuotaStore;

    const canChangeQuota = (item: TItem) => {
      if (!isDefaultAIAgentsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    const aiAgents = this.selection.filter((x) => canChangeQuota(x));

    return aiAgents.length > 0;
  }

  get hasOneSelection() {
    return this.selection.length === 1;
  }

  get hasSelection() {
    return !!this.selection.length;
  }

  get hasBufferSelection() {
    return !!this.bufferSelection;
  }

  get isEmptyFilesList() {
    const filesList = [...this.files, ...this.folders];
    return filesList.length <= 0;
  }

  get hasNew() {
    const newFiles = [...this.files, ...this.folders].filter(
      (item: TItem) =>
        (item.fileStatus! & FileStatus.IsNew) === FileStatus.IsNew,
    );
    return newFiles.length > 0;
  }

  get allFilesIsEditing() {
    const hasFolders = this.selection.find(
      (x) => !x.fileExst || !x.contentLength,
    );
    if (!hasFolders) {
      return this.selection.every((x) => x.isEditing);
    }
    return false;
  }

  fetchFavoritesFolder = async (folderId: number | string) => {
    // api.files.getFolder is typed with a mandatory filter
    // param but the old JS calls it with the folder id only; the erased
    // function cast keeps the reduced call arity.
    const favoritesFolder = await (
      api.files.getFolder as unknown as (
        folderIdParam: number | string,
      ) => Promise<TGetFolder>
    )(folderId);
    this.setFolders(favoritesFolder.folders);
    this.setFiles(favoritesFolder.files);

    const newFilter = this.filter.clone();
    newFilter.total = favoritesFolder.total;
    this.setFilter(newFilter);

    this.selectedFolderStore.setSelectedFolder({
      folders: favoritesFolder.folders,
      ...favoritesFolder.current,
      pathParts: favoritesFolder.pathParts,
    });
  };

  getFileInfo = async (
    id: number | string,
    share?: string,
    skipRedirect?: boolean,
  ) => {
    const fileInfo = await api.files.getFileInfo(id, share, skipRedirect);
    this.setFile(fileInfo);

    return fileInfo;
  };

  getFolderInfo = async (id: number | string, skipRedirect?: boolean) => {
    const folderInfo = await api.files.getFolderInfo(id, skipRedirect);
    this.setFolder(folderInfo);
    return folderInfo;
  };

  openDocEditor = (
    id: number | string,
    preview = false,
    shareKey: Nullable<string> = null,
    editForm = false,
    fillForm = false,
  ) => {
    const { openOnNewPage } = this.filesSettingsStore;

    const share = shareKey || this.publicRoomStore.publicRoomKey;

    const folderType = this.selectedFolderStore.type;

    const isFormRoom = this.selectedFolderStore.roomType === RoomsType.FormRoom;
    const isPublic = this.publicRoomStore.isPublicRoom;

    const { isFrame, frameConfig } = this.settingsStore;

    const canShare =
      share && (isPublic || !isFormRoom) && !isSystemFolder(folderType!);

    const searchParams = new URLSearchParams();

    // URLSearchParams.append is typed for strings while the
    // old JS passes numeric ids / nullable share keys; erased casts keep
    // the values (they are stringified by the browser API).
    searchParams.append("fileId", id as string);
    if (canShare) searchParams.append("share", share as string);
    if (preview) searchParams.append("action", "view");
    if (editForm) searchParams.append("action", "edit");
    if (fillForm) searchParams.append("action", "fill");

    const url = combineUrl(
      window.ClientConfig?.proxy?.url,
      config.homepage,
      `/doceditor?${searchParams.toString()}`,
    );

    if (isFrame && frameConfig?.events?.onEditorOpen) {
      const item = this.files.find((f) => f.id === id);

      frameCallEvent({
        event: "onEditorOpen",
        data: {
          ...item,
          share,
          action: preview ? "view" : fillForm ? "fill" : "edit",
        },
      });

      return;
    }

    return window.open(url, openOnNewPage ? "_blank" : "_self");
  };

  createThumbnails = async (files: Nullable<TFile[]> = null) => {
    if ((this.viewAs !== "tile" || !this.files) && !files) return;

    const currentFiles = files || this.files;

    const newFiles = currentFiles.filter((f) => {
      return (
        typeof f.id !== "string" &&
        f?.thumbnailStatus === thumbnailStatuses.WAITING &&
        !this.thumbnails.has(`${f.id}|${f.versionGroup}`)
      );
    });

    if (!newFiles.length) return;

    if (this.thumbnails.size > THUMBNAILS_CACHE) this.thumbnails.clear();

    newFiles.forEach((f) => this.thumbnails.add(`${f.id}|${f.versionGroup}`));

    console.log("thumbnails", this.thumbnails);

    const fileIds = newFiles.map((f) => f.id);

    const res = await api.files.createThumbnails(fileIds);

    return res;
  };

  createThumbnail = async (file?: TFile) => {
    if (
      this.viewAs !== "tile" ||
      !file ||
      !file.id ||
      typeof file.id === "string" ||
      file.thumbnailStatus !== thumbnailStatuses.WAITING ||
      this.thumbnails.has(`${file.id}|${file.versionGroup}`)
    ) {
      return;
    }

    if (this.thumbnails.size > THUMBNAILS_CACHE) this.thumbnails.clear();

    this.thumbnails.add(`${file.id}|${file.versionGroup}`);

    console.log("thumbnails", this.thumbnails);

    const res = await api.files.createThumbnails([file.id]);

    return res;
  };

  setIsUpdatingRowItem = (updating: boolean) => {
    this.isUpdatingRowItem = updating;
  };

  setPasswordEntryProcess = (process: boolean) => {
    this.passwordEntryProcess = process;
  };

  setEnabledHotkeys = (enabledHotkeys: boolean) => {
    this.enabledHotkeys = enabledHotkeys;
  };

  setCreatedItem = (createdItem: TCreatedItem) => {
    this.createdItem = createdItem;

    // if (createdItem?.type == "file") {
    //   console.log(
    //     "[WS] subscribe to file's changes",
    //     createdItem.id,
    //     createdItem.title
    //   );

    //   SocketHelper?.emit({
    //     command: "subscribe",
    //     data: { roomParts: `FILE-${createdItem.id}`, individual: true },
    //   });
    // }
  };

  setScrollToItem = (item: TCreatedItem) => {
    this.scrollToItem = item;
  };

  getIsEmptyTrash = async () => {
    const res = await api.files.getTrashFolderList();
    const items = [...res.files, ...res.folders];
    this.setTrashIsEmpty(items.length === 0);
  };

  setTrashIsEmpty = (isEmpty: boolean) => {
    this.trashIsEmpty = isEmpty;
  };

  setMainButtonMobileVisible = (visible: boolean) => {
    this.mainButtonMobileVisible = visible;
  };

  get indexColumnSize() {
    if (!this.selectedFolderStore.isIndexedFolder) return 0;

    const minWidth = 33;
    const maxIndexLength = 5;

    const lastFile = this.filesList[this.filesList.length - 1];

    const orderLength = lastFile?.order?.length ?? 0;

    if (orderLength > maxIndexLength) {
      return minWidth + maxIndexLength * 3;
    }

    return minWidth + orderLength * 2;
  }

  get hasMoreFiles() {
    const {
      isRoomsFolder,
      isArchiveFolder,
      isTemplatesFolder,
      isRecentFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = this.treeFoldersStore;

    // Only 100 files on recent page should be shown
    if (isRecentFolder) return false;

    // The Forms section is a rooms listing (served via searchArea=Forms), so
    // its pagination total lives on roomsFilter, not the files filter.
    const isRooms =
      isRoomsFolder || isArchiveFolder || isTemplatesFolder || isFormsFolder;
    const filterTotal =
      isRooms || isAIAgentsFolder ? this.roomsFilter.total : this.filter.total;

    if (this.clientLoadingStore.isLoading) return false;
    return this.filesList.length < filterTotal;
  }

  setFilesIsLoading = (filesIsLoading: boolean) => {
    this.filesIsLoading = filesIsLoading;
  };

  fetchMoreFiles = async () => {
    if (
      !this.hasMoreFiles ||
      this.filesIsLoading ||
      this.clientLoadingStore.isLoading
    )
      return;

    const { isRoomsFolder, isArchiveFolder, isAIAgentsFolder, isFormsFolder } =
      this.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder || isFormsFolder;

    this.setFilesIsLoading(true);
    // console.log("fetchMoreFiles");

    const newFilter =
      isRooms || isAIAgentsFolder
        ? this.roomsFilter.clone()
        : this.filter.clone();
    newFilter.page += 1;
    if (isRooms || isAIAgentsFolder)
      this.setRoomsFilter(newFilter as TRoomsFilter);
    else this.setFilter(newFilter as TFilesFilter);

    const newFilesData = isRooms
      ? await api.rooms.getRooms(newFilter as TRoomsFilter)
      : isAIAgentsFolder
        ? await api.ai.getNewAiAgents(newFilter as TRoomsFilter)
        : await api.files.getFolder(
            (newFilter as TFilesFilter).folder,
            newFilter as TFilesFilter,
          );

    const newFiles = [...this.files, ...newFilesData.files].filter(
      (x, index, self) => index === self.findIndex((i) => i.id === x.id),
    );
    const newFolders = [...this.folders, ...newFilesData.folders].filter(
      (x, index, self) => index === self.findIndex((i) => i.id === x.id),
    );

    runInAction(() => {
      this.setFiles(newFiles);
      this.setFolders(newFolders);
      this.setFilesIsLoading(false);
    });
  };

  withCtrlSelect = (item: TItem) => {
    this.setHotkeyCaret(item);
    this.setHotkeyCaretStart(item);

    const fileIndex = this.selection.findIndex(
      (f) => f.id === item.id && f.isFolder === item.isFolder,
    );
    if (fileIndex === -1) {
      this.setSelection([...this.selection, item]);
    } else {
      this.deselectFile(item);
    }
  };

  withShiftSelect = (item: TItem) => {
    const caretStart = this.hotkeyCaretStart
      ? this.hotkeyCaretStart
      : this.filesList[0];
    const caret = this.hotkeyCaret ? this.hotkeyCaret : caretStart;

    if (!caret || !caretStart) return;

    const startCaretIndex = this.filesList.findIndex(
      (f) => f.id === caretStart.id && f.isFolder === caretStart.isFolder,
    );

    const caretIndex = this.filesList.findIndex(
      (f) => f.id === caret.id && f.isFolder === caret.isFolder,
    );

    const itemIndex = this.filesList.findIndex(
      (f) => f.id === item.id && f.isFolder === item.isFolder,
    );

    const isMoveDown = caretIndex < itemIndex;

    let newSelection: TItem[] = JSON.parse(JSON.stringify(this.selection));
    let index = caretIndex;
    const newItemIndex = isMoveDown ? itemIndex + 1 : itemIndex - 1;

    while (index !== newItemIndex) {
      const filesItem = this.filesList[index];

      const selectionIndex = newSelection.findIndex(
        (f) => f.id === filesItem.id && f.isFolder === filesItem.isFolder,
      );
      if (selectionIndex === -1) {
        newSelection.push(filesItem);
      } else {
        newSelection = newSelection.filter(
          (_, fIndex) => selectionIndex !== fIndex,
        );
        newSelection.push(filesItem);
      }

      if (isMoveDown) {
        index++;
      } else {
        index--;
      }
    }

    const lastSelection = this.selection[this.selection.length - 1];
    const indexOfLast = this.filesList.findIndex(
      (f) =>
        f.id === lastSelection?.id && f.isFolder === lastSelection?.isFolder,
    );

    newSelection = newSelection.filter((f) => {
      const listIndex = this.filesList.findIndex(
        (x) => x.id === f.id && x.isFolder === f.isFolder,
      );

      if (isMoveDown) {
        const isSelect = listIndex < indexOfLast;
        if (isSelect) return true;

        if (listIndex >= startCaretIndex) {
          return true;
        }
        return listIndex >= itemIndex;
      }
      const isSelect = listIndex > indexOfLast;
      if (isSelect) return true;

      if (listIndex <= startCaretIndex) {
        return true;
      }
      return listIndex <= itemIndex;
    });

    this.setSelection(newSelection);
    this.setHotkeyCaret(item);
  };

  get disableDrag() {
    const {
      isRecycleBinFolder,
      isRoomsFolder,
      isArchiveFolder,
      isFavoritesFolder,
      isRecentFolder,
      isAIAgentsFolder,
    } = this.treeFoldersStore;

    const { isInsideResultStorage } = this.selectedFolderStore;

    return (
      isRecycleBinFolder ||
      isRoomsFolder ||
      isArchiveFolder ||
      isFavoritesFolder ||
      isRecentFolder ||
      isInsideResultStorage ||
      isAIAgentsFolder
    );
  }

  get roomsForRestore() {
    return this.folders.filter((f) => f.security.Move);
  }

  get roomsForDelete() {
    return this.folders.filter((f) => f.security.Delete);
  }

  getRooms = async (filter: Partial<TRoomsFilter>) => {
    const userId = this.userStore.user && this.userStore.user.id;
    // RoomsFilter.getDefault types userId as
    // `string | undefined` but the old JS passes `null` when there is no
    // user; the erased cast keeps the exact runtime value.
    const newFilter = RoomsFilter.getDefault(userId as string);
    Object.assign(newFilter, filter);

    return api.rooms.getRooms(newFilter);
  };

  setHotkeysClipboard = (hotkeysClipboard?: TItem[]) => {
    this.hotkeysClipboard = hotkeysClipboard || this.selection;
  };

  getPrimaryLink = async (roomId: number | string) => {
    const link = await api.rooms.getPrimaryLink(roomId);
    return link;
  };

  setInRoomFolder = (roomId: number | string, inRoom: boolean) => {
    const newFolders = this.folders;
    const folderIndex = newFolders.findIndex((r) => r.id === roomId);

    const isRoot = this.selectedFolderStore.isRootFolder;

    if (!isRoot) {
      this.selectedFolderStore.setInRoom(true);
    } else if (folderIndex > -1) {
      newFolders[folderIndex].inRoom = inRoom;
      this.setFolders(newFolders);

      if (
        this.bufferSelection &&
        this.bufferSelection.id === newFolders[folderIndex].id
      ) {
        const newBufferSelection = { ...this.bufferSelection };
        newBufferSelection.inRoom = inRoom;
        this.setBufferSelection(newBufferSelection);
      }
    }
  };

  updateRoom = (oldRoom: TItem, newRoom: TFolder | TRoom) => {
    // After rename of room with providerKey, it's id value changes too
    if (oldRoom.providerKey) {
      let index = this.getFolderIndex(oldRoom.id!);

      if (index === -1) {
        index = this.getFolderIndex(newRoom.id);
      }

      return this.updateFolder(index, newRoom);
    }

    this.setFolder(newRoom);
  };

  get isFiltered() {
    const { isRoomsFolder, isArchiveFolder, isAIAgentsFolder, isFormsFolder } =
      this.treeFoldersStore;

    const {
      subjectId,
      subjectOwnerId,
      filterValue,
      type,
      withSubfolders: withRoomsSubfolders,
      searchInContent: searchInContentRooms,
      tags,
      withoutTags,
      quotaFilter,
      provider,
    } = this.roomsFilter;

    const {
      authorType,
      roomId,
      search,
      withSubfolders,
      filterType,
      searchInContent,
      sharedBy,
    } = this.filter;

    const isFiltered =
      isRoomsFolder || isArchiveFolder || isAIAgentsFolder || isFormsFolder
        ? filterValue ||
          type ||
          provider ||
          withRoomsSubfolders ||
          searchInContentRooms ||
          subjectId ||
          subjectOwnerId ||
          tags ||
          withoutTags ||
          quotaFilter
        : authorType ||
          roomId ||
          search ||
          withSubfolders ||
          filterType ||
          searchInContent ||
          sharedBy;

    return isFiltered;
  }

  get needResetFilesSelection() {
    return this.selection.length > 1;
  }

  get showNewFilesInList() {
    if (
      this.selectedFolderStore.isIndexedFolder &&
      this.filesList.length < this.filter.total
    ) {
      return false;
    }

    return true;
  }

  setMainButtonVisible = (mainButtonVisible: boolean) => {
    this.mainButtonVisible = mainButtonVisible;
  };

  clearActiveOperations = (
    fileIds: Nullable<(number | string)[]> = EMPTY_ARRAY,
    folderIds: Nullable<(number | string)[]> = EMPTY_ARRAY,
  ) => {
    const newActiveFiles = this.activeFiles.filter(
      (el) => !fileIds?.includes(el.id),
    );
    const newActiveFolders = this.activeFolders.filter(
      (el) => !folderIds?.includes(el.id),
    );

    this.setActiveFiles(newActiveFiles);
    this.setActiveFolders(newActiveFolders);
  };
}

export default FilesStore;
