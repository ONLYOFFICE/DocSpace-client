// (c) Copyright Ascensio System SIA 2009-2025
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

import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";

import api from "@docspace/shared/api";
import {
  FileType,
  FilterType,
  FolderType,
  FileStatus,
  RoomsType,
  RoomsProviderType,
  Events,
  FilterKeys,
  RoomSearchArea,
} from "@docspace/shared/enums";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

import {
  isLockedSharedRoom,
  RoomsTypes,
  isDesktop,
  isMobile,
} from "@docspace/shared/utils";
import { getViewForCurrentRoom } from "@docspace/shared/utils/getViewForCurrentRoom";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  updateTempContent,
  isPublicRoom,
  getDaysRemaining,
  frameCallEvent,
} from "@docspace/shared/utils/common";

import { toastr } from "@docspace/shared/components/toast";
import config from "PACKAGE_FILE";
import {
  LOADER_TIMEOUT,
  MEDIA_VIEW_URL,
  PDF_FORM_DIALOG_KEY,
  ROOMS_PROVIDER_TYPE_NAME,
  thumbnailStatuses,
} from "@docspace/shared/constants";

import {
  getCategoryType,
  getCategoryUrl,
  getCategoryTypeByFolderType,
} from "SRC_DIR/helpers/utils";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";

import { CategoryType } from "SRC_DIR/helpers/constants";
import debounce from "lodash.debounce";
import clone from "lodash/clone";
import Queue from "queue-promise";
import { toJSON } from "@docspace/shared/api/rooms/filter";
import {
  mappingActiveItems,
  removeOptions,
  removeSeparator,
} from "SRC_DIR/helpers/filesUtils";

const { FilesFilter, RoomsFilter } = api;
const storageViewAs = localStorage.getItem("viewAs");

let requestCounter = 0;

const NotFoundHttpCode = 404;
const ForbiddenHttpCode = 403;
const PaymentRequiredHttpCode = 402;
const UnauthorizedHttpCode = 401;

const THUMBNAILS_CACHE = 500;
let timerId;

const DEFAULT_MEMBERS_FILTER = {
  page: 0,
  pageCount: 100,
  total: 0,
  startIndex: 0,
};

class FilesStore {
  authStore;

  userStore;

  currentTariffStatusStore;

  selectedFolderStore;

  treeFoldersStore;

  filesSettingsStore;

  thirdPartyStore;

  clientLoadingStore;

  infoPanelStore;

  accessRightsStore;

  publicRoomStore;

  settingsStore;

  currentQuotaStore;

  indexingStore;

  pluginStore;

  privateViewAs =
    !isDesktop() && storageViewAs !== "tile" ? "row" : storageViewAs || "table";

  dragging = false;

  isInit = false;

  isUpdatingRowItem = false;

  passwordEntryProcess = false;

  tooltipPageX = 0;

  tooltipPageY = 0;

  startDrag = false;

  alreadyFetchingRooms = false;

  files = [];

  folders = [];

  selection = [];

  bufferSelection = null;

  selected = "close";

  filter = FilesFilter.getDefault();

  roomsFilter = RoomsFilter.getDefault();

  membersFilter = DEFAULT_MEMBERS_FILTER;

  categoryType = getCategoryType(window.location);

  loadTimeout = null;

  hotkeyCaret = null;

  hotkeyCaretStart = null;

  activeFiles = [];

  activeFolders = [];

  firstElemChecked = false;

  headerBorder = false;

  enabledHotkeys = true;

  createdItem = null;

  scrollToItem = null;

  roomCreated = false;

  isLoadingFilesFind = false;

  pageItemsLength = null;

  isHidePagination = false;

  trashIsEmpty = false;

  mainButtonMobileVisible = true;

  filesIsLoading = false;

  isEmptyPage = true;

  isLoadedFetchFiles = false;

  tempActionFilesIds = [];

  tempActionFoldersIds = [];

  isErrorRoomNotAvailable = false;

  roomsController = null;

  filesController = null;

  clearSearch = false;

  isLoadedEmptyPage = false;

  isMuteCurrentRoomNotifications = false;

  isPreview = false;

  tempFilter = null;

  highlightFile = {};

  thumbnails = new Set();

  movingInProgress = false;

  createNewFilesQueue = new Queue({
    concurrent: 5,
    interval: 500,
    start: true,
  });

  hotkeysClipboard = [];

  mainButtonVisible = false;

  constructor(
    authStore,
    selectedFolderStore,
    treeFoldersStore,
    filesSettingsStore,
    thirdPartyStore,
    accessRightsStore,
    clientLoadingStore,
    pluginStore,
    publicRoomStore,
    infoPanelStore,
    userStore,
    currentTariffStatusStore,
    settingsStore,
    indexingStore,
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
    this.infoPanelStore = infoPanelStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.settingsStore = settingsStore;
    this.indexingStore = indexingStore;

    this.roomsController = new AbortController();
    this.filesController = new AbortController();

    SocketHelper.on(SocketEvents.ModifyFolder, async (opt) => {
      const { socketSubscribers } = SocketHelper;

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

    SocketHelper.on(SocketEvents.UpdateHistory, ({ id, type }) => {
      const { infoPanelSelection, fetchHistory, isVisible } =
        this.infoPanelStore;

      if (!isVisible) return;
      let infoPanelSelectionType = "file";
      if (infoPanelSelection?.isRoom || infoPanelSelection?.isFolder)
        infoPanelSelectionType = "folder";

      if (id === infoPanelSelection?.id && type === infoPanelSelectionType) {
        console.log("[WS] s:update-history", id);
        fetchHistory();
      }
    });

    SocketHelper.on(SocketEvents.MarkAsNewFolder, ({ folderId, count }) => {
      const { socketSubscribers } = SocketHelper;
      const pathParts = `DIR-${folderId}`;

      if (!socketSubscribers.has(pathParts)) return;

      console.log(`[WS] markasnew-folder ${folderId}:${count}`);

      const foundIndex =
        folderId && this.folders.findIndex((x) => x.id === folderId);

      const treeFoundIndex =
        folderId &&
        this.treeFoldersStore.treeFolders.findIndex((x) => x.id === folderId);
      if (foundIndex === -1 && treeFoundIndex === -1) return;

      runInAction(() => {
        if (foundIndex > -1)
          this.folders[foundIndex].new = count >= 0 ? count : 0;
        if (treeFoundIndex > -1) this.treeFoldersStore.fetchTreeFolders();
      });
    });

    SocketHelper.on(SocketEvents.MarkAsNewFile, ({ fileId, count }) => {
      const { socketSubscribers } = SocketHelper;
      const pathParts = `FILE-${fileId}`;

      if (!socketSubscribers.has(pathParts)) return;

      console.log(`[WS] markasnew-file ${fileId}:${count}`);

      const foundIndex = fileId && this.files.findIndex((x) => x.id === fileId);

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
    SocketHelper.on(SocketEvents.StartEditFile, (id) => {
      const { socketSubscribers } = SocketHelper;
      const pathParts = `FILE-${id}`;

      if (!socketSubscribers.has(pathParts)) return;

      const foundIndex = this.files.findIndex((x) => x.id === id);
      if (foundIndex == -1) return;

      console.log(`[WS] s:start-edit-file`, id, this.files[foundIndex].title);

      this.updateSelectionStatus(
        id,
        this.files[foundIndex].fileStatus | FileStatus.IsEditing,
        true,
      );

      this.updateFileStatus(
        foundIndex,
        this.files[foundIndex].fileStatus | FileStatus.IsEditing,
      );
    });

    SocketHelper.on(SocketEvents.ModifyRoom, (option) => {
      switch (option.cmd) {
        case "create-form":
          setTimeout(() => this.wsCreatedPDFForm(option), LOADER_TIMEOUT * 2);
          break;

        default:
          break;
      }
    });

    SocketHelper.on(SocketEvents.StopEditFile, (id) => {
      const { socketSubscribers } = SocketHelper;
      const pathParts = `FILE-${id}`;

      const { isVisible, infoPanelSelection, setInfoPanelSelection } =
        this.infoPanelStore;

      if (!socketSubscribers.has(pathParts)) return;

      const foundIndex = this.files.findIndex((x) => x.id === id);
      if (foundIndex == -1) return;

      console.log(`[WS] s:stop-edit-file`, id, this.files[foundIndex].title);

      this.updateSelectionStatus(
        id,
        this.files[foundIndex].fileStatus & ~FileStatus.IsEditing,
        false,
      );

      this.updateFileStatus(
        foundIndex,
        this.files[foundIndex].fileStatus & ~FileStatus.IsEditing,
      );

      this.getFileInfo(id).then((file) => {
        if (
          isVisible &&
          file.id === infoPanelSelection?.id &&
          infoPanelSelection?.fileExst === file.fileExst
        ) {
          setInfoPanelSelection(merge(cloneDeep(infoPanelSelection), file));
        }
      });

      this.createThumbnail(this.files[foundIndex]);
    });

    this.createNewFilesQueue.on("resolve", this.onResolveNewFile);
  }

  onResolveNewFile = (fileInfo) => {
    if (!fileInfo) return;

    // console.log("onResolveNewFiles", { fileInfo });

    if (this.files.findIndex((x) => x.id === fileInfo.id) > -1) return;

    if (this.selectedFolderStore.id !== fileInfo.folderId) return;

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

  wsModifyFolderCreate = async (opt) => {
    if (opt?.type === "file" && opt?.id) {
      const foundIndex = this.getFileIndex(opt?.id);

      const file = JSON.parse(opt?.data);

      if (this.selectedFolderStore.id !== file.folderId) {
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
        this.checkSelection(file);
      }

      if (foundIndex > -1) return;

      this.selectedFolderStore.setFilesCount(
        this.selectedFolderStore.filesCount + 1,
      );

      setTimeout(() => {
        if (this.getFileIndex(file.id) > -1) {
          // console.log("Skip in timeout");
          return null;
        }

        this.createNewFilesQueue.enqueue(() => {
          if (this.getFileIndex(file.id) > -1) {
            // console.log("Skip in queue");
            return null;
          }

          return api.files.getFileInfo(file.id);
        });
      }, 300);
    } else if (opt?.type === "folder" && opt?.id) {
      this.selectedFolderStore.setFoldersCount(
        this.selectedFolderStore.foldersCount + 1,
      );

      const foundIndex = this.folders.findIndex((x) => x.id == opt?.id);

      if (foundIndex > -1) return;

      const folder = JSON.parse(opt?.data);

      if (this.selectedFolderStore.id != folder.parentId) {
        const movedToIndex = this.getFolderIndex(folder.parentId);
        if (movedToIndex > -1) this.folders[movedToIndex].foldersCount++;
      }

      if (
        this.selectedFolderStore.id != folder.parentId ||
        (folder.roomType &&
          folder.createdBy.id === this.userStore.user.id &&
          this.roomCreated)
      ) {
        return (this.roomCreated = false);
      }

      const folderInfo = await api.files.getFolderInfo(folder.id);

      console.log("[WS] create new folder", folderInfo.id, folderInfo.title);

      const newFolders = [folderInfo, ...this.folders];

      const newFilter = this.filter;
      newFilter.total += 1;

      runInAction(() => {
        this.setFilter(newFilter);
        this.setFolders(newFolders);
      });
    }
  };

  wsModifyFolderUpdate = (opt) => {
    const { infoPanelSelection, updateInfoPanelSelection } =
      this.infoPanelStore;

    if (opt?.type === "file" && opt?.data) {
      const file = JSON.parse(opt?.data);
      if (!file || !file.id) return;

      this.getFileInfo(file.id); // this.setFile(file);
      console.log("[WS] update file", file.id, file.title);

      if (
        infoPanelSelection?.id == file.id &&
        !infoPanelSelection?.isFolder &&
        !infoPanelSelection?.isRoom
      ) {
        const newInfoPanelSelection = this.getFilesListItems([file]);
        updateInfoPanelSelection(newInfoPanelSelection[0]);
      }

      this.checkSelection(file);
    } else if (opt?.type === "folder" && opt?.data) {
      const folder = JSON.parse(opt?.data);
      if (!folder || !folder.id) return;

      api.files
        .getFolderInfo(folder.id)
        .then((f) => {
          console.log("[WS] update folder", f.id, f.title);

          if (this.selection?.length) {
            const foundIndex = this.selection?.findIndex((x) => x.id === f.id);
            if (foundIndex > -1) {
              runInAction(() => {
                this.selection[foundIndex] = f;
              });
            }
          }

          if (this.bufferSelection) {
            if (
              this.bufferSelection.id === f.id &&
              (this.bufferSelection.isFolder || this.bufferSelection.isRoom)
            ) {
              this.setBufferSelection(f);
            }
          }

          const navigationPath = [...this.selectedFolderStore.navigationPath];

          const idx = navigationPath.findIndex((p) => p.id === f.id);

          if (idx !== -1) {
            navigationPath[idx].title = f?.title;
          }

          if (f.id === this.selectedFolderStore.id) {
            this.selectedFolderStore.setSelectedFolder({
              ...f,
              navigationPath,
            });
          }

          if (
            infoPanelSelection?.id == f.id &&
            (infoPanelSelection?.isFolder || infoPanelSelection?.isRoom)
          ) {
            const newInfoPanelSelection = this.getFilesListItems([f]);
            updateInfoPanelSelection(newInfoPanelSelection[0]);
          }

          this.setFolder(f);
        })
        .catch(() => {
          // console.log("Folder deleted")
        });
    }
  };

  wsModifyFolderDelete = (opt) => {
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
          this.pageItemsLength > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    } else if (opt?.type === "folder" && opt?.id) {
      const foundIndex = this.folders.findIndex((x) => x.id === opt?.id);
      if (foundIndex == -1) {
        const removedId = opt.id;
        const pathParts = this.selectedFolderStore.pathParts;

        const includePathPart = pathParts.some(({ id }) => id === removedId);

        if (includePathPart) {
          window.DocSpace.navigate("/");
        }

        return;
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
          this.pageItemsLength > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    }
  };

  wsCreatedPDFForm = (option) => {
    if (!option.data) return;

    const file = JSON.parse(option.data);

    if (this.selectedFolderStore.id !== file.folderId) return;

    const localKey = `${PDF_FORM_DIALOG_KEY}-${this.userStore.user.id}`;

    const show = !JSON.parse(localStorage.getItem(localKey) ?? "false");

    const event = new CustomEvent(Events.CREATE_PDF_FORM_FILE, {
      detail: {
        file,
        show,
        localKey,
      },
    });

    window?.dispatchEvent(event);
  };

  setIsErrorRoomNotAvailable = (state) => {
    this.isErrorRoomNotAvailable = state;
  };

  setTempActionFilesIds = (tempActionFilesIds) => {
    this.tempActionFilesIds = tempActionFilesIds;
  };

  setTempActionFoldersIds = (tempActionFoldersIds) => {
    this.tempActionFoldersIds = tempActionFoldersIds;
  };

  setClearSearch = (clearSearch) => {
    this.clearSearch = clearSearch;
  };

  setIsPreview = (predicate) => {
    this.isPreview = predicate;
  };

  setTempFilter = (filter) => {
    this.tempFilter = filter;
  };

  setHighlightFile = (highlightFile) => {
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

  checkSelection = (file) => {
    if (this.selection) {
      const foundIndex = this.selection?.findIndex((x) => x.id === file.id);
      if (foundIndex > -1) {
        runInAction(() => {
          this.selection[foundIndex] = file;
        });
      }
    }

    if (this.bufferSelection) {
      const foundIndex = [this.bufferSelection].findIndex(
        (x) => x.id === file.id,
      );
      if (foundIndex > -1) {
        runInAction(() => {
          this.bufferSelection[foundIndex] = file;
        });
      }
    }
  };

  updateSelectionStatus = (id, status, isEditing) => {
    const index = this.selection.findIndex((x) => x.id === id);

    if (index !== -1) {
      this.selection[index].fileStatus = status;
      this.selection[index].isEditing = isEditing;
    }
  };

  removeActiveItem = (file) => {
    this.activeFiles =
      this.activeFiles?.filter((item) => item.id !== file.id) ?? [];
  };

  addActiveItems = (files, folders, destFolderId) => {
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

  updateActiveFiles = (items) => {
    this.activeFiles = items;
  };

  updateActiveFolders = (items) => {
    this.activeFolders = items;
  };

  clearFiles = () => {
    this.setFolders([]);
    this.setFiles([]);

    this.selectedFolderStore.setSelectedFolder(null);
  };

  setActiveFiles = (activeFiles, destFolderId) => {
    const arrayFormation = mappingActiveItems(activeFiles, destFolderId);

    this.activeFiles = arrayFormation;
  };

  setActiveFolders = (activeFolders, destFolderId) => {
    const arrayFormation = mappingActiveItems(activeFolders, destFolderId);

    this.activeFolders = arrayFormation;
  };

  setViewAs = (viewAs) => {
    this.privateViewAs = viewAs;
    localStorage.setItem("viewAs", viewAs);
    viewAs === "tile" && this.createThumbnails();
  };

  get viewAs() {
    const view = this.privateViewAs;

    const { parentRoomType, roomType, isIndexedFolder } =
      this.selectedFolderStore;
    const currentDeviceType = this.settingsStore.currentDeviceType;

    return getViewForCurrentRoom(view, {
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

    return [];
  }

  setPageItemsLength = (pageItemsLength) => {
    this.pageItemsLength = pageItemsLength;
  };

  setDragging = (dragging) => {
    this.dragging = dragging;
  };

  setTooltipPosition = (tooltipPageX, tooltipPageY) => {
    this.tooltipPageX = tooltipPageX;
    this.tooltipPageY = tooltipPageY;
  };

  setStartDrag = (startDrag) => {
    this.selection = this.selection.filter(
      (x) => !x.providerKey || x.id !== x.rootFolderId,
    ); // removed root thirdparty folders
    this.startDrag = startDrag;
  };

  setIsEmptyPage = (isEmptyPage) => {
    this.isEmptyPage = isEmptyPage;
  };

  setIsLoadedEmptyPage = (isLoadedEmptyPage) => {
    this.isLoadedEmptyPage = isLoadedEmptyPage;
  };

  get tooltipOptions() {
    if (!this.dragging) return null;

    const selectionLength = this.selection.length;
    const elementTitle = selectionLength && this.selection[0].title;
    const singleElement = selectionLength === 1;
    const filesCount = singleElement ? elementTitle : selectionLength;
    const { isShareFolder, isCommonFolder } = this.treeFoldersStore;

    let operationName;

    if (this.authStore.isAdmin && isShareFolder) {
      operationName = "copy";
    } else if (!this.authStore.isAdmin && (isShareFolder || isCommonFolder)) {
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

    const {
      getPortalCultures,
      getIsEncryptionSupport,
      getEncryptionKeys,
      // setModuleInfo,
      isDesktopClient,
    } = this.settingsStore;

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
        requests.push(getIsEncryptionSupport(), getEncryptionKeys());
      }
    }
    requests.push(getFilesSettings());

    return Promise.all(requests).then(() => {
      this.clientLoadingStore.setIsArticleLoading(false);
      this.clientLoadingStore.setFirstLoad(false);

      this.setIsInit(true);
    });
  };

  setIsInit = (isInit) => {
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

    this.files = [];
    this.folders = [];

    this.selection = [];
    this.bufferSelection = null;
    this.selected = "close";
  };

  resetSelections = () => {
    this.setSelection([]);
    this.setBufferSelection(null);
  };

  setFiles = (files) => {
    if (files.length === 0 && this.files.length === 0) return;

    const roomPartsToUnsub = this.files
      .filter(
        (f) =>
          !files.some((nf) => nf.id === f.id) &&
          SocketHelper.socketSubscribers.has(`FILE-${f.id}`),
      )
      .map((f) => `FILE-${f.id}`);

    const roomPartsToSub = files
      .map((f) => `FILE-${f.id}`)
      .filter((f) => !SocketHelper.socketSubscribers.has(f));

    if (roomPartsToUnsub.length > 0) {
      SocketHelper.emit(SocketCommands.Unsubscribe, {
        roomParts: roomPartsToUnsub,
        individual: true,
      });
    }

    this.files = files;

    if (roomPartsToSub.length > 0) {
      SocketHelper.emit(SocketCommands.Subscribe, {
        roomParts: roomPartsToSub,
        individual: true,
      });

      // this.files?.forEach((file) =>
      //   console.log("[WS] subscribe to file's changes", file.id, file.title)
      // );
    }

    this.createThumbnails();
  };

  setFolders = (folders) => {
    if (folders.length === 0 && this.folders.length === 0) return;

    const roomPartsToUnsub = this.folders
      .filter(
        (f) =>
          !folders.some((nf) => nf.id === f.id) &&
          SocketHelper.socketSubscribers.has(`DIR-${f.id}`) &&
          this.selectedFolderStore.id !== f.id,
      )
      .map((f) => `DIR-${f.id}`);

    const roomPartsToSub = folders
      .map((f) => `DIR-${f.id}`)
      .filter((f) => !SocketHelper.socketSubscribers.has(f));

    if (roomPartsToUnsub.length > 0) {
      SocketHelper.emit(SocketCommands.Unsubscribe, {
        roomParts: roomPartsToUnsub,
        individual: true,
      });
    }

    this.folders = folders;

    if (roomPartsToSub.length > 0) {
      SocketHelper.emit(SocketCommands.Subscribe, {
        roomParts: roomPartsToSub,
        individual: true,
      });
    }
  };

  getFileIndex = (id) => {
    const index = this.files.findIndex((x) => x.id === id);
    return index;
  };

  updateFileStatus = (index, status) => {
    if (index < 0) return;

    this.files[index].fileStatus = status;
  };

  updateRoomMute = (index, status) => {
    if (index < 0) return;

    this.folders[index].mute = status;
  };

  setFile = (file) => {
    const index = this.files.findIndex((x) => x.id === file.id);
    if (index !== -1) {
      this.files[index] = file;
      this.createThumbnail(file);
    }
  };

  removeStaleItemFromSelection = (item) => {
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

  updateSelection = (id) => {
    const indexFileList = this.filesList.findIndex(
      (filelist) => filelist.id === id,
    );
    const indexSelectedRoom = this.selection.findIndex(
      (room) => room.id === id,
    );

    if (~indexFileList && ~indexSelectedRoom) {
      this.selection[indexSelectedRoom] = this.filesList[indexFileList];
    }
    if (this.bufferSelection) {
      this.bufferSelection = this.filesList.find(
        (file) => file.id === this.bufferSelection.id,
      );
    }
  };

  getFolderIndex = (id) => {
    const index = this.folders.findIndex((x) => x.id === id);
    return index;
  };

  updateFolder = (index, folder) => {
    if (index !== -1) this.folders[index] = folder;

    this.updateSelection(folder.id);
  };

  setFolder = (folder) => {
    const index = this.getFolderIndex(folder.id);

    this.updateFolder(index, folder);
  };

  getFilesChecked = (file, selected) => {
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
      case `room-${RoomsType.FillingFormsRoom}`:
        return roomType === RoomsType.FillingFormsRoom;
      case `room-${RoomsType.CustomRoom}`:
        return roomType === RoomsType.CustomRoom;
      case `room-${RoomsType.EditingRoom}`:
        return roomType === RoomsType.EditingRoom;
      case `room-${RoomsType.ReviewRoom}`:
        return roomType === RoomsType.ReviewRoom;
      case `room-${RoomsType.ReadOnlyRoom}`:
        return roomType === RoomsType.ReadOnlyRoom;
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

  getFilesBySelected = (files, selected) => {
    const newSelection = [];
    files.forEach((file) => {
      const checked = this.getFilesChecked(file, selected);

      if (checked) newSelection.push(file);
    });

    return newSelection;
  };

  setSelected = (selected, clearBuffer = true) => {
    if (selected === "close" || selected === "none") {
      clearBuffer && this.setBufferSelection(null);

      this.setHotkeyCaretStart(this.selection.at(-1) ?? this.hotkeyCaretStart);
      this.setHotkeyCaret(this.selection.at(-1) ?? this.hotkeyCaret);
    }

    this.selected = selected;
    const files = this.filesList;
    this.selection = this.getFilesBySelected(files, selected);
  };

  setHotkeyCaret = (hotkeyCaret) => {
    if (hotkeyCaret || this.hotkeyCaret) {
      this.hotkeyCaret = hotkeyCaret;
    }
  };

  setHotkeyCaretStart = (hotkeyCaretStart) => {
    this.hotkeyCaretStart = hotkeyCaretStart;
  };

  setSelection = (selection) => {
    this.selection = selection;
  };

  setSelections = (added, removed, clear = false) => {
    if (clear) {
      this.selection = [];
    }

    let newSelections = JSON.parse(JSON.stringify(this.selection));

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
      const splitValue = value && value.split("_");

      const fileType = splitValue[0];
      const id = splitValue.slice(1, -3).join("_");

      if (fileType === "file") {
        if (this.activeFiles.findIndex((f) => f.id == id) === -1) {
          newSelections.push(
            this.filesList.find((f) => f.id == id && !f.isFolder),
          );
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

      const splitValue = value && value.split("_");

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

    const removeDuplicate = (items) => {
      return items.filter(
        (x, index, self) =>
          index ===
          self.findIndex((i) => i.id === x.id && i.isFolder === x.isFolder),
      );
    };

    this.setSelection(removeDuplicate(newSelections));
  };

  setBufferSelection = (bufferSelection) => {
    // console.log("setBufferSelection", bufferSelection);
    this.bufferSelection = bufferSelection;
  };

  setIsLoadedFetchFiles = (isLoadedFetchFiles) => {
    this.isLoadedFetchFiles = isLoadedFetchFiles;
  };

  // TODO: FILTER
  setFilesFilter = (filter, folderId = null) => {
    const { recycleBinFolderId } = this.treeFoldersStore;

    const key =
      this.categoryType === CategoryType.Archive
        ? `UserFilterArchiveRoom=${this.userStore.user?.id}`
        : this.categoryType === CategoryType.SharedRoom
          ? `UserFilterSharedRoom=${this.userStore.user?.id}`
          : folderId === "recent"
            ? `UserFilterRecent=${this.userStore.user?.id}`
            : +folderId === recycleBinFolderId
              ? `UserFilterTrash=${this.userStore.user?.id}`
              : !this.publicRoomStore.isPublicRoom
                ? `UserFilter=${this.userStore.user?.id}`
                : null;

    if (key) {
      const value = `${filter.sortBy},${filter.sortOrder}`;
      localStorage.setItem(key, value);
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
    this.setFilesFilter(this.tempFilter);
  };

  setRoomsFilter = (filter) => {
    filter.pageCount = 100;

    const isArchive = this.categoryType === CategoryType.Archive;

    const key = isArchive
      ? `UserRoomsArchivedFilter=${this.userStore.user?.id}`
      : `UserRoomsSharedFilter=${this.userStore.user?.id}`;

    const sharedStorageFilter = JSON.parse(localStorage.getItem(key));
    if (sharedStorageFilter) {
      sharedStorageFilter.sortBy = filter.sortBy;
      sharedStorageFilter.sortOrder = filter.sortOrder;

      const value = toJSON(sharedStorageFilter);
      localStorage.setItem(key, value);
    }

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

  setFilter = (filter) => {
    filter.pageCount = 100;
    this.filter = filter;
  };

  refreshFiles = async () => {
    const res = await this.fetchFiles(this.selectedFolderStore.id, this.filter);
    return res;
  };

  abortAllFetch = () => {
    this.filesController.abort();
    this.roomsController.abort();
    this.filesController = new AbortController();
    this.roomsController = new AbortController();
  };

  fetchFiles = (
    folderId,
    filter,
    clearFilter = true,
    withSubfolders = false,
    clearSelection = true,
  ) => {
    const { setSelectedNode } = this.treeFoldersStore;
    const { setIsIndexEditingMode } = this.indexingStore;

    setIsIndexEditingMode(false);

    if (this.clientLoadingStore.isLoading) {
      this.abortAllFetch();
    }

    const filterData = filter ? filter.clone() : FilesFilter.getDefault();
    filterData.folder = folderId;

    if (folderId === "@my" && this.userStore.user.isVisitor) {
      const url = getCategoryUrl(CategoryType.Shared);
      return window.DocSpace.navigate(
        `${url}?${RoomsFilter.getDefault().toUrlParams()}`,
      );
    }
    this.setIsErrorRoomNotAvailable(false);
    this.setIsLoadedFetchFiles(false);

    const filterStorageItem =
      this.userStore.user?.id &&
      localStorage.getItem(`UserFilter=${this.userStore.user.id}`);

    if (filterStorageItem && !filter) {
      const splitFilter = filterStorageItem.split(",");
      filterData.sortBy = splitFilter[0];
      filterData.sortOrder = splitFilter[1];
    }

    filterData.page = 0;
    filterData.pageCount = 100;

    const defaultFilter = FilesFilter.getDefault();

    const { filterType, searchInContent } = filterData;

    if (!filterData.withSubfolders)
      filterData.withSubfolders = defaultFilter.withSubfolders;

    if (!searchInContent)
      filterData.searchInContent = defaultFilter.searchInContent;

    if (!Object.keys(FilterType).find((key) => FilterType[key] === filterType))
      filterData.filterType = defaultFilter.filterType;

    setSelectedNode([`${folderId}`]);

    return api.files
      .getFolder(folderId, filterData, this.filesController.signal)
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
          !this.publicRoomStore.isPublicRoom
        ) {
          await this.publicRoomStore.getExternalLinks(data.current.id);
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

        if (this.isPreview) {
          // save filter for after closing preview change url
          this.setTempFilter(filterData);
        } else {
          this.setFilesFilter(filterData, folderId); // TODO: FILTER
        }

        const isPrivacyFolder =
          data.current.rootFolderType === FolderType.Privacy;

        const navigationPath = await Promise.all(
          data.pathParts.map(async (folder, idx) => {
            const { Rooms, Archive } = FolderType;

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

            const { title, roomType } = folderInfo;

            const isRootRoom =
              idx === 0 &&
              (data.current.rootFolderType === Rooms ||
                data.current.rootFolderType === Archive);

            let shared;
            let quotaLimit;
            let usedSpace;
            let external;
            if (idx === 1) {
              let room = data.current;

              if (!isCurrentFolder) {
                room = await api.files.getFolderInfo(folder.id);

                shared = room.shared;
                external = room.external;
                quotaLimit = room.quotaLimit;
                usedSpace = room.usedSpace;
                this.infoPanelStore.setInfoPanelRoom(room);
              } else {
                const newInfoPanelSelection = this.getFilesListItems([room]);

                if (
                  !newInfoPanelSelection[0].isFolder &&
                  !newInfoPanelSelection[0].isRoom &&
                  data.current.rootFolderType === FolderType.USER &&
                  this.selectedFolderStore.isFolder
                ) {
                  newInfoPanelSelection[0].isFolder = true;
                }

                this.infoPanelStore.updateInfoPanelSelection(
                  newInfoPanelSelection[0],
                );
              }
              const { mute } = room;

              runInAction(() => {
                this.isMuteCurrentRoomNotifications = mute;
              });
            }

            const isTemplatesFolder =
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
            };
          }),
        ).then((res) => {
          return res
            .filter((item, index) => {
              return index !== res.length - 1;
            })
            .reverse();
        });

        runInAction(() => {
          this.selectedFolderStore.setSelectedFolder({
            folders: data.folders,
            ...data.current,
            inRoom: !!data.current.inRoom,
            isRoom: !!data.current.roomType,
            isTemplate:
              data.current.rootFolderType === FolderType.RoomTemplates,
            pathParts: data.pathParts,
            navigationPath,
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
              filter.searchInContent;

            if (isFiltered) {
              this.setIsEmptyPage(false);
            } else {
              this.setIsEmptyPage(isEmptyList);
            }
          } else {
            this.setIsEmptyPage(isEmptyList);
          }
          this.setFolders(isPrivacyFolder && !isDesktop() ? [] : data.folders);
          this.setFiles(isPrivacyFolder && !isDesktop() ? [] : data.files);
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
                (elem) => elem.id === this.bufferSelection.id,
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

        this.clientLoadingStore.setIsSectionHeaderLoading(false);
        this.clientLoadingStore.setIsSectionFilterLoading(false);

        const selectedFolder = {
          selectedFolder: { ...this.selectedFolderStore },
        };

        if (this.createdItem) {
          const newItem = this.filesList.find(
            (item) => item.id === this.createdItem.id,
          );

          if (newItem) {
            this.setBufferSelection(newItem);
            this.setScrollToItem({
              id: newItem.id,
              type: this.createdItem.type,
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
        if (err?.response?.status === 402)
          this.currentTariffStatusStore.setPortalTariff();

        const isThirdPartyError = Number.isNaN(+folderId);

        const isUserError = [
          NotFoundHttpCode,
          ForbiddenHttpCode,
          PaymentRequiredHttpCode,
          UnauthorizedHttpCode,
        ].includes(err?.response?.status);

        if (requestCounter > 0 && !isThirdPartyError && !isUserError) return;

        requestCounter++;

        if (isUserError && !isThirdPartyError) {
          if (isPublicRoom()) return Promise.reject(err);

          if (err?.response?.status === NotFoundHttpCode) {
            frameCallEvent({ event: "onNotFound" });
          }

          if (err?.response?.status === ForbiddenHttpCode) {
            frameCallEvent({ event: "onNoAccess" });
          }

          this.setIsErrorRoomNotAvailable(true);
        } else if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else {
          toastr.error(err);
          if (isThirdPartyError) {
            const userId = this.userStore?.user?.id;
            const searchArea = window.DocSpace.location.pathname.includes(
              "shared",
            )
              ? RoomSearchArea.Active
              : RoomSearchArea.Archive;

            return window.DocSpace.navigate(
              `${window.DocSpace.location.pathname}?${RoomsFilter.getDefault(userId, searchArea).toUrlParams(userId, true)}`,
            );
          }
        }
      })
      .finally(() => {
        this.setIsLoadedFetchFiles(true);

        if (window?.DocSpace?.location?.state?.highlightFileId) {
          this.setHighlightFile({
            highlightFileId: window.DocSpace.location.state.highlightFileId,
            isFileHasExst: window.DocSpace.location.state.isFileHasExst,
          });
        }
      });
  };

  fetchRooms = (
    folderId,
    filter,
    clearFilter = true,
    withSubfolders = false, // eslint-disable-line  @typescript-eslint/no-unused-vars
    clearSelection = true,
    withFilterLocalStorage = false, // eslint-disable-line  @typescript-eslint/no-unused-vars
  ) => {
    const { setSelectedNode } = this.treeFoldersStore;

    const { setIsIndexEditingMode } = this.indexingStore;

    setIsIndexEditingMode(false);

    if (this.clientLoadingStore.isLoading) {
      this.abortAllFetch();
    }

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

    if (!ROOMS_PROVIDER_TYPE_NAME[provider])
      filterData.provider = defaultFilter.provider;

    if (
      quotaFilter &&
      quotaFilter !== FilterKeys.customQuota &&
      quotaFilter !== FilterKeys.defaultQuota
    )
      filterData.quotaFilter = defaultFilter.quotaFilter;

    const request = () =>
      api.rooms
        .getRooms(filterData, this.roomsController.signal)
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
                true,
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
              navigationPath: [],
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
            this.setFiles([]);
          });

          if (clearFilter) {
            if (clearSelection) {
              this.setSelected("close");
            }
          }

          this.infoPanelStore.setInfoPanelRoom(null);

          this.clientLoadingStore.setIsSectionHeaderLoading(false);
          this.clientLoadingStore.setIsSectionFilterLoading(false);

          const selectedFolder = {
            selectedFolder: { ...this.selectedFolderStore },
          };

          if (this.createdItem) {
            const newItem = this.filesList.find(
              (item) => item.id === this.createdItem.id,
            );

            if (newItem) {
              this.setBufferSelection(newItem);
              this.setScrollToItem({
                id: newItem.id,
                type: this.createdItem.type,
              });
            }

            this.setCreatedItem(null);
          }
          this.setIsErrorRoomNotAvailable(false);
          return Promise.resolve(selectedFolder);
        })
        .catch((err) => {
          if (err?.response?.status === 402)
            this.currentTariffStatusStore.setPortalTariff();

          if (axios.isCancel(err)) {
            console.log("Request canceled", err.message);
          } else {
            toastr.error(err);
          }
        });

    return request();
  };

  setCustomRoomQuota = async (
    quotaSize,
    itemsIDs,
    inRoom = false,
    filter = null,
  ) => {
    const rooms = await api.rooms.setCustomRoomQuota(itemsIDs, +quotaSize);

    if (!inRoom) await this.fetchRooms(null, filter, false, false, false);

    return rooms;
  };

  resetRoomQuota = async (itemsIDs, inRoom = false, filter = null) => {
    const rooms = await api.rooms.resetRoomQuota(itemsIDs);

    if (!inRoom) await this.fetchRooms(null, filter, false, false, false);

    return rooms;
  };

  setAlreadyFetchingRooms = (alreadyFetchingRooms) => {
    this.alreadyFetchingRooms = alreadyFetchingRooms;
  };

  isFileSelected = (fileId, parentId) => {
    const item = this.selection.find(
      (x) => x.id === fileId && x.parentId === parentId,
    );

    return item !== undefined;
  };

  selectFile = (file) => {
    const { id, parentId } = file;
    const isFileSelected = this.isFileSelected(id, parentId);
    if (!isFileSelected) this.selection.push(file);
  };

  deselectFile = (file) => {
    const { id, parentId } = file;
    const isFileSelected = this.isFileSelected(id, parentId);
    if (isFileSelected) {
      const selectionIndex = this.selection.findIndex(
        (x) => x.parentId === parentId && x.id === id,
      );

      if (selectionIndex !== -1) {
        this.selection = this.selection.filter(
          (x, index) => index !== selectionIndex,
        );
      }
    }
  };

  getFilesContextOptions = (item, optionsToRemove = []) => {
    const isFile = !!item.fileExst || item.contentLength;
    const isRoom = !!item.roomType;
    const isTemplate =
      item.rootFolderType === FolderType.RoomTemplates && isRoom;

    const hasNew =
      item.new > 0 || (item.fileStatus & FileStatus.IsNew) === FileStatus.IsNew;
    const canConvert = item.viewAccessibility?.CanConvert;
    const mustConvert = item.viewAccessibility?.MustConvert;
    const isEncrypted = item.encrypted;
    const isDocuSign = false; // TODO: need this prop;
    const isEditing = false; // (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

    const { isRecycleBinFolder, isMy, isArchiveFolder } = this.treeFoldersStore;
    const { security } = this.selectedFolderStore;

    const { enablePlugins } = this.settingsStore;

    const isThirdPartyFolder =
      item.providerKey && item.id === item.rootFolderId;

    const isMyFolder = isMy(item.rootFolderType);

    const { isDesktopClient } = this.settingsStore;

    const pluginAllKeys =
      enablePlugins &&
      this.pluginStore.getContextMenuKeysByType(null, null, security);

    const canRenameItem = item.security?.Rename;

    const canMove = this.accessRightsStore.canMoveItems({
      ...item,
      ...{ editing: isEditing },
    });

    const canDelete = !isEditing && item.security?.Delete;

    const canCopy = item.security?.Copy;
    const canCopyLink = item.security?.CopyLink;
    const canDuplicate = item.security?.Duplicate;
    const canDownload = item.security?.Download || isLockedSharedRoom(item);
    const canEmbed = item.security?.Embed;
    const canSetUpCustomFilter = item.security?.CustomFilter;

    if (isFile) {
      const shouldFillForm = item.viewAccessibility.WebRestrictedEditing;
      const canLockFile = item.security?.Lock;
      const canChangeVersionFileHistory =
        !isEditing && item.security?.EditHistory;

      const canViewVersionFileHistory = item.security?.ReadHistory;
      const canFillForm = item.security?.FillForms;

      const canSubmitToFormGallery = item.security?.SubmitToFormGallery;

      const canEditFile = item.security.Edit && item.viewAccessibility.WebEdit;
      const canOpenPlayer =
        item.viewAccessibility.ImageView || item.viewAccessibility.MediaView;
      const canViewFile = item.viewAccessibility.WebView;

      const isOldForm =
        item.fileExst === ".docxf" || item.fileExst === ".oform"; // TODO: Remove after change security options
      const isPdf = item.fileExst === ".pdf";
      const isXlsx = item.fileExst === ".xlsx";

      let fileOptions = [
        // "open",
        "select",
        "fill-form",
        "edit",
        "open-pdf",
        "preview",
        "view",
        "pdf-view",
        "make-form",
        "edit-pdf",
        "separator0",
        "submit-to-gallery",
        "separator-SubmitToGallery",
        "link-for-room-members",
        "sharing-settings",
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
        // "mark-as-favorite",
        // "remove-from-favorites",
        "create-room",
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
        "delete",
        "remove-from-recent",
        "copy-general-link",
      ];

      if (optionsToRemove.length) {
        fileOptions = removeOptions(fileOptions, optionsToRemove);
      }

      if (this.publicRoomStore.isPublicRoom) {
        fileOptions = removeOptions(fileOptions, [
          "separator0",
          "sharing-settings",
          "send-by-email",
          "show-info",
          "separator1",
          "create-room",
          "separator2",
          "remove-from-recent",
          "copy-general-link",
        ]);
      }

      if (!canSetUpCustomFilter && !isXlsx) {
        fileOptions = removeOptions(fileOptions, ["custom-filter"]);
      }

      if (!canDownload) {
        fileOptions = removeOptions(fileOptions, ["download"]);
      }

      if (!isPdf || (shouldFillForm && canFillForm) || isRecycleBinFolder) {
        fileOptions = removeOptions(fileOptions, ["open-pdf"]);
      }

      if (
        !isPdf ||
        !item.security.EditForm ||
        item.startFilling ||
        !item.isForm
      ) {
        fileOptions = removeOptions(fileOptions, ["edit-pdf"]);
      }

      if (!isPdf || !window.ClientConfig?.pdfViewer || isRecycleBinFolder) {
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

      if (!canCopy) {
        fileOptions = removeOptions(fileOptions, ["copy-to"]);
      }

      if (!canDuplicate) {
        fileOptions = removeOptions(fileOptions, ["duplicate"]);
      }

      if (!canMove && !canCopy && !canDuplicate) {
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
          "remove-from-favorites",
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
        item.rootFolderType === FolderType.Archive
        // ||
        // (isFavoritesFolder && !isFavorite) ||
        // isFavoritesFolder ||
        // isRecentFolder
      )
        fileOptions = removeOptions(fileOptions, ["separator2"]);

      // if (isFavorite) {
      //   fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
      // } else {
      //   fileOptions = removeOptions(fileOptions, [
      //     "remove-from-favorites",
      //   ]);

      //   if (isFavoritesFolder) {
      //     fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
      //   }
      // }

      if (isEncrypted) {
        fileOptions = removeOptions(fileOptions, [
          "open",
          "link-for-room-members",
          // "link-for-portal-users",
          // "external-link",
          "send-by-email",
          "mark-as-favorite",
        ]);
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
            !item.viewAccessibility.MediaView &&
            !item.viewAccessibility.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.Files,
              item.fileExst,
              security,
            );

            pluginAllKeys &&
              pluginAllKeys.forEach((key) => fileOptions.push(key));
            pluginFilesKeys &&
              pluginFilesKeys.forEach((key) => fileOptions.push(key));
          }

          if (
            !item.viewAccessibility.MediaView &&
            item.viewAccessibility.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.Image,
              item.fileExst,
              security,
            );

            pluginAllKeys &&
              pluginAllKeys.forEach((key) => fileOptions.push(key));
            pluginFilesKeys &&
              pluginFilesKeys.forEach((key) => fileOptions.push(key));
          }

          if (
            item.viewAccessibility.MediaView &&
            !item.viewAccessibility.ImageView
          ) {
            const pluginFilesKeys = this.pluginStore.getContextMenuKeysByType(
              PluginFileType.Video,
              item.fileExst,
              security,
            );

            pluginAllKeys &&
              pluginAllKeys.forEach((key) => fileOptions.push(key));
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
          // isRecentFolder ||
          // isFavoritesFolder ||
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

      // if (isPrivacyFolder) {
      //   fileOptions = removeOptions(fileOptions, [
      //     "preview",
      //     "view",
      //     "separator0",
      //     "download-as",
      //   ]);

      //   // if (!isDesktopClient) {
      //   //   fileOptions = removeOptions(fileOptions, ["sharing-settings"]);
      //   // }
      // }

      fileOptions = removeSeparator(fileOptions);

      return fileOptions;
    }
    if (isTemplate) {
      const templateOptions = [
        "select",
        "open",
        "separator0",
        "create-room-from-template",
        "edit-template",
        "access-settings",
        "room-info",
        "separator1",
        "delete",
      ];

      return templateOptions;
    }
    if (isRoom) {
      const canInviteUserInRoom = item.security?.EditAccess;
      const canRemoveRoom = item.security?.Delete;

      const canArchiveRoom = item.security?.Move;
      const canPinRoom = item.security?.Pin;

      const canEditRoom = item.security?.EditRoom;

      const canViewRoomInfo = item.security?.Read || isLockedSharedRoom(item);
      const canMuteRoom = item.security?.Mute;

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
        "change-room-owner",
        "archive-room",
        "unarchive-room",
        "leave-room",
        "delete",
        "remove-shared-room",
      ];

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

      if (!canRemoveRoom) {
        roomOptions = removeOptions(roomOptions, ["delete"]);
      }

      if (!canDuplicate) {
        roomOptions = removeOptions(roomOptions, ["duplicate-room"]);
      }

      if (!canDownload) {
        roomOptions = removeOptions(roomOptions, ["download"]);
      }

      if (!canDownload && !canDuplicate) {
        roomOptions = removeOptions(roomOptions, ["separator1"]);
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

      if (isArchiveFolder || item.rootFolderType === FolderType.Archive) {
        roomOptions = removeOptions(roomOptions, ["archive-room"]);
      } else {
        roomOptions = removeOptions(roomOptions, ["unarchive-room"]);

        if (enablePlugins) {
          const pluginRoomsKeys = this.pluginStore.getContextMenuKeysByType(
            PluginFileType.Rooms,
            null,
            security,
          );

          pluginAllKeys &&
            pluginAllKeys.forEach((key) => roomOptions.push(key));
          pluginRoomsKeys &&
            pluginRoomsKeys.forEach((key) => roomOptions.push(key));
        }
      }

      roomOptions = removeSeparator(roomOptions);

      return roomOptions;
    }
    let folderOptions = [
      "select",
      "open",
      // "separator0",
      "sharing-settings",
      "link-for-room-members",
      // "owner-change",
      "show-info",
      // "link-for-portal-users",
      "separator1",
      "open-location",
      "create-room",
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
      "delete",
    ];

    if (optionsToRemove.length) {
      folderOptions = removeOptions(folderOptions, optionsToRemove);
    }

    if (this.publicRoomStore.isPublicRoom) {
      folderOptions = removeOptions(folderOptions, [
        "show-info",
        "sharing-settings",
        "separator1",
        "create-room",
      ]);
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

    // if (isPrivacyFolder) {
    //   folderOptions = removeOptions(folderOptions, [
    //     // "sharing-settings",
    //   ]);
    // }

    if (isRecycleBinFolder) {
      folderOptions = removeOptions(folderOptions, [
        "open",
        "link-for-room-members",
        // "link-for-portal-users",
        // "sharing-settings",
        "mark-read",
        "separator0",
        "separator1",
      ]);
    } else {
      folderOptions = removeOptions(folderOptions, ["restore"]);

      if (enablePlugins) {
        const pluginFoldersKeys = this.pluginStore.getContextMenuKeysByType(
          PluginFileType.Folders,
          null,
          security,
        );

        pluginAllKeys &&
          pluginAllKeys.forEach((key) => folderOptions.push(key));
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

    //   if (isShareFolder) {
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

    if (!(isMyFolder && (this.filterType || this.filterSearch))) {
      folderOptions = removeOptions(folderOptions, ["open-location"]);
    }

    if (isMyFolder) {
      folderOptions = removeOptions(folderOptions, ["link-for-room-members"]);
    }

    folderOptions = removeSeparator(folderOptions);

    return folderOptions;
  };

  createFile = async (folderId, title, templateId, formId) => {
    return api.files
      .createFile(folderId, title, templateId, formId)
      .then((file) => {
        return Promise.resolve(file);
      })
      .then(() => this.fetchFiles(folderId, this.filter, true, true, false));
  };

  setRoomCreated = (roomCreated) => {
    this.roomCreated = roomCreated;
  };

  createRoom = (roomParams) => {
    this.roomCreated = true;
    return api.rooms.createRoom(roomParams);
  };

  setRoomMembersFilter = (roomMembersFilter) => {
    this.roomMembersFilter = roomMembersFilter;
  };

  getRoomMembers = (id, clearFilter = true, membersFilter = null) => {
    let newFilter = membersFilter || clone(this.membersFilter);

    if (clearFilter) {
      newFilter = DEFAULT_MEMBERS_FILTER;
    } else if (!membersFilter) {
      newFilter.page += 1;
      newFilter.pageCount = 100;
      newFilter.startIndex = newFilter.page * newFilter.pageCount;
      this.setRoomMembersFilter(newFilter);
    }

    const membersFilters = {
      startIndex: newFilter.startIndex,
      count: newFilter.pageCount,
      filterType: 0, // 0 (Members)
      filterValue: this.infoPanelStore.searchValue,
    };

    return api.rooms.getRoomMembers(id, membersFilters).then((res) => {
      newFilter.total = res.total;
      this.setMembersFilter(newFilter);

      return res.items;
    });
  };

  setMembersFilter = (filter) => {
    this.membersFilter = filter;
  };

  updateRoomPin = (item) => {
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

  removeFiles = (fileIds, folderIds, showToast, destFolderId) => {
    const { isRoomsFolder, isArchiveFolder } = this.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

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

      const hotkeysClipboard = fileIds
        ? this.hotkeysClipboard.filter(
            (f) => !fileIds.includes(f.id) && !f.isFolder,
          )
        : this.hotkeysClipboard.filter(
            (f) => !folderIds.includes(f.id) && f.isFolder,
          );

      this.setIsEmptyPage(newFilter.total <= 0);

      runInAction(() => {
        isRooms ? this.setRoomsFilter(newFilter) : this.setFilter(newFilter);
        this.setFiles(files);
        this.setFolders(folders);
        this.setTempActionFilesIds([]);
        this.setHotkeysClipboard(hotkeysClipboard);
        this.setTempActionFoldersIds([]);
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
        isRooms ? this.setRoomsFilter(newFilter) : this.setFilter(newFilter);
        this.setFiles(files);
        this.setFolders(folders);
        this.setTempActionFilesIds([]);
        this.setTempActionFoldersIds([]);
      });

      showToast && showToast();

      return;
    }

    newFilter.startIndex =
      (newFilter.page + 1) * newFilter.pageCount - deleteCount;
    newFilter.pageCount = deleteCount;
    if (isRooms) {
      return api.rooms
        .getRooms(newFilter)
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
          });

          showToast && showToast();
        })
        .catch((err) => {
          toastr.error(err);
        })
        .finally(() => {
          this.setTempActionFilesIds([]);
          this.setTempActionFoldersIds([]);
        });
    }
    api.files
      .getFolder(newFilter.folder, newFilter)
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
        });

        showToast && showToast();
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        this.setTempActionFilesIds([]);
        this.setTempActionFoldersIds([]);
      });
  };

  updateFile = (fileId, title) => {
    return api.files
      .updateFile(fileId, title)
      .then((file) => this.setFile(file));
  };

  renameFolder = (folderId, title) => {
    return api.files.renameFolder(folderId, title).then((folder) => {
      this.setFolder(folder);
    });
  };

  getFilesCount = () => {
    const { filesCount, foldersCount } = this.selectedFolderStore;
    return filesCount + this.folders ? this.folders.length : foldersCount;
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

  setFirsElemChecked = (checked) => {
    this.firstElemChecked = checked;
  };

  setHeaderBorder = (headerBorder) => {
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

  onCreateAddTempItem = (items) => {
    const { getFileIcon, getFolderIcon } = this.filesSettingsStore;
    const { extension, title } = this.fileActionStore;

    if (items.length && items[0].id === -1) return; // TODO: if change media collection from state remove this;

    const icon = extension
      ? getFileIcon(`.${extension}`, 32)
      : getFolderIcon(32);

    items.unshift({
      id: -1,
      title,
      parentId: this.selectedFolderStore.id,
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

  getItemUrl = (id, isFolder, needConvert, canOpenPlayer) => {
    const proxyURL = window.ClientConfig?.proxy?.url || window.location.origin;

    const url = getCategoryUrl(this.categoryType, id);

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
      `/doceditor?fileId=${id}${needConvert ? "&action=view" : ""}`,
    );

    return newUrl;
  };

  getFilesListItems = (items) => {
    const { fileItemsList } = this.pluginStore;
    const { enablePlugins } = this.settingsStore;
    const { getIcon } = this.filesSettingsStore;

    return items.map((item) => {
      const {
        availableExternalRights,
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
      } = item;

      const thirdPartyIcon = this.thirdPartyStore.getThirdPartyIcon(
        item.providerKey,
        "small",
      );

      const providerType =
        RoomsProviderType[
          Object.keys(RoomsProviderType).find((key) => key === item.providerKey)
        ];

      const canOpenPlayer =
        item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
      const needConvert = item.viewAccessibility?.MustConvert;
      const isEditing =
        (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

      const previewUrl = canOpenPlayer
        ? this.getItemUrl(id, false, needConvert, canOpenPlayer)
        : null;

      const contextOptions = this.getFilesContextOptions(item);
      const isThirdPartyFolder = providerKey && id === rootFolderId;

      let isFolder = false;
      this.folders.forEach((x) => {
        if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
      });

      const { isRecycleBinFolder } = this.treeFoldersStore;

      const folderUrl = isFolder && this.getItemUrl(id, isFolder, false, false);

      const docUrl =
        !canOpenPlayer && !isFolder && this.getItemUrl(id, false, needConvert);

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

      const pluginOptions = {};

      if (enablePlugins && fileItemsList) {
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

      return {
        availableExternalRights,
        access,
        daysRemaining: autoDelete && getDaysRemaining(autoDelete),
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
        logo,
        locked,
        new: item.new,
        mute,
        parentId,
        pureContentLength,
        rootFolderType,
        rootFolderId,
        // selectedItem,
        shared,
        title,
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
        isArchive,
        tags,
        pinned,
        thirdPartyIcon,
        providerType,
        security,
        viewAccessibility,
        ...pluginOptions,
        inRoom,
        indexing,
        lifetime,
        denyDownload,
        type,
        hasDraft,
        isForm,
        isPDFForm: item.isForm,
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
      };
    });
  };

  get filesList() {
    // return [...this.folders, ...this.files];

    const newFolders = [...this.folders];
    const orderItems = [...this.folders, ...this.files].filter((x) => x.order);

    if (orderItems.length > 0) {
      this.isEmptyPage && this.setIsEmptyPage(false);

      orderItems.sort((a, b) => {
        if (a.order.includes(".")) {
          return (
            Number(a.order.split(".").at(-1)) -
            Number(b.order.split(".").at(-1))
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
    const { isDocument, isPresentation, isSpreadsheet, isArchive } =
      this.filesSettingsStore;

    let cbMenu = ["all"];
    const filesItems = [...this.files, ...this.folders];

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
      if (isDocument(item.fileExst)) cbMenu.push(FilterType.DocumentsOnly);
      else if (isPresentation(item.fileExst))
        cbMenu.push(FilterType.PresentationsOnly);
      else if (isSpreadsheet(item.fileExst))
        cbMenu.push(FilterType.SpreadsheetsOnly);
      else if (item.viewAccessibility?.ImageView)
        cbMenu.push(FilterType.ImagesOnly);
      else if (item.viewAccessibility?.MediaView)
        cbMenu.push(FilterType.MediaOnly);
      else if (isArchive(item.fileExst)) cbMenu.push(FilterType.ArchiveOnly);
    });

    const hasFiles = cbMenu.some(
      (elem) =>
        elem !== "all" &&
        elem !== `room-${FilterType.FoldersOnly}` &&
        elem !== `room-${RoomsType.FillingFormsRoom}` &&
        elem !== `room-${RoomsType.CustomRoom}` &&
        elem !== `room-${RoomsType.EditingRoom}` &&
        elem !== `room-${RoomsType.ReviewRoom}` &&
        elem !== `room-${RoomsType.FormRoom}` &&
        elem !== `room-${RoomsType.ReadOnlyRoom}` &&
        elem !== `room-${RoomsType.PublicRoom}` &&
        elem !== `room-${RoomsType.VirtualDataRoom}`,
    );

    if (hasFiles) cbMenu.push(FilterType.FilesOnly);

    cbMenu = cbMenu.filter((item, index) => cbMenu.indexOf(item) === index);

    return cbMenu;
  }

  get sortedFiles() {
    const { isSpreadsheet, isPresentation, isDocument, isMasterFormExtension } =
      this.filesSettingsStore;

    const sortedFiles = {
      documents: [],
      spreadsheets: [],
      presentations: [],
      masterForms: [],
      other: [],
    };

    let selection = this.selection.length
      ? this.selection
      : this.bufferSelection
        ? [this.bufferSelection]
        : [];

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
        } else if (isDocument(item.fileExst)) {
          sortedFiles.documents.push(item);
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
        : [];

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
    const canResetCustomQuota = (item) => {
      const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

      if (!isDefaultRoomsQuotaSet) return false;

      if (item.providerKey) return false;

      return item.security?.EditRoom && item.isCustomQuota;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canResetCustomQuota(x));

    return rooms.length > 0;
  }

  get hasRoomsToDisableQuota() {
    const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

    const canDisableQuota = (item) => {
      if (!isDefaultRoomsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canDisableQuota(x));

    return rooms.length > 0;
  }

  get hasRoomsToChangeQuota() {
    const { isDefaultRoomsQuotaSet } = this.authStore.currentQuotaStore;

    const canChangeQuota = (item) => {
      if (!isDefaultRoomsQuotaSet) return false;

      return item.security?.EditRoom;
    };

    if (this.hasOneSelection && this.isThirdPartySelection) return false;

    const rooms = this.selection.filter((x) => canChangeQuota(x));

    return rooms.length > 0;
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
      (item) => (item.fileStatus & FileStatus.IsNew) === FileStatus.IsNew,
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

  fetchFavoritesFolder = async (folderId) => {
    const favoritesFolder = await api.files.getFolder(folderId);
    this.setFolders(favoritesFolder.folders);
    this.setFiles(favoritesFolder.files);

    this.selectedFolderStore.setSelectedFolder({
      folders: favoritesFolder.folders,
      ...favoritesFolder.current,
      pathParts: favoritesFolder.pathParts,
    });
  };

  getFileInfo = async (id) => {
    const fileInfo = await api.files.getFileInfo(id);
    this.setFile(fileInfo);
    return fileInfo;
  };

  getFolderInfo = async (id) => {
    const folderInfo = await api.files.getFolderInfo(id);
    this.setFolder(folderInfo);
    return folderInfo;
  };

  openDocEditor = (
    id,
    preview = false,
    shareKey = null,
    editForm = false,
    fillForm = false,
  ) => {
    const { openOnNewPage } = this.filesSettingsStore;

    const share = shareKey || this.publicRoomStore.publicRoomKey;

    const searchParams = new URLSearchParams();

    searchParams.append("fileId", id);
    if (share) searchParams.append("share", share);
    if (preview) searchParams.append("action", "view");
    if (editForm) searchParams.append("action", "edit");
    if (fillForm) searchParams.append("action", "fill");

    const url = combineUrl(
      window.ClientConfig?.proxy?.url,
      config.homepage,
      `/doceditor?${searchParams.toString()}`,
    );

    window.open(url, openOnNewPage ? "_blank" : "_self");
  };

  createThumbnails = async (files = null) => {
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

  createThumbnail = async (file) => {
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

  setIsUpdatingRowItem = (updating) => {
    this.isUpdatingRowItem = updating;
  };

  setPasswordEntryProcess = (process) => {
    this.passwordEntryProcess = process;
  };

  setEnabledHotkeys = (enabledHotkeys) => {
    this.enabledHotkeys = enabledHotkeys;
  };

  setCreatedItem = (createdItem) => {
    this.createdItem = createdItem;

    // if (createdItem?.type == "file") {
    //   console.log(
    //     "[WS] subscribe to file's changes",
    //     createdItem.id,
    //     createdItem.title
    //   );

    //   SocketHelper.emit({
    //     command: "subscribe",
    //     data: { roomParts: `FILE-${createdItem.id}`, individual: true },
    //   });
    // }
  };

  setScrollToItem = (item) => {
    this.scrollToItem = item;
  };

  getIsEmptyTrash = async () => {
    const res = await api.files.getTrashFolderList();
    const items = [...res.files, ...res.folders];
    this.setTrashIsEmpty(items.length === 0);
  };

  setTrashIsEmpty = (isEmpty) => {
    this.trashIsEmpty = isEmpty;
  };

  setMovingInProgress = (movingInProgress) => {
    this.movingInProgress = movingInProgress;
  };

  setMainButtonMobileVisible = (visible) => {
    this.mainButtonMobileVisible = visible;
  };

  get indexColumnSize() {
    if (!this.selectedFolderStore.isIndexedFolder) return;

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
    const { isRoomsFolder, isArchiveFolder, isTemplatesFolder } =
      this.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder || isTemplatesFolder;
    const filterTotal = isRooms ? this.roomsFilter.total : this.filter.total;

    if (this.clientLoadingStore.isLoading) return false;
    return this.filesList.length < filterTotal;
  }

  setFilesIsLoading = (filesIsLoading) => {
    this.filesIsLoading = filesIsLoading;
  };

  fetchMoreFiles = async () => {
    if (
      !this.hasMoreFiles ||
      this.filesIsLoading ||
      this.clientLoadingStore.isLoading
    )
      return;

    const { isRoomsFolder, isArchiveFolder } = this.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

    this.setFilesIsLoading(true);
    // console.log("fetchMoreFiles");

    const newFilter = isRooms ? this.roomsFilter.clone() : this.filter.clone();
    newFilter.page += 1;
    if (isRooms) this.setRoomsFilter(newFilter);
    else this.setFilter(newFilter);

    const newFilesData = isRooms
      ? await api.rooms.getRooms(newFilter)
      : await api.files.getFolder(newFilter.folder, newFilter);

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

  withCtrlSelect = (item) => {
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

  withShiftSelect = (item) => {
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

    let newSelection = JSON.parse(JSON.stringify(this.selection));
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
    } = this.treeFoldersStore;

    return (
      isRecycleBinFolder ||
      isRoomsFolder ||
      isArchiveFolder ||
      isFavoritesFolder ||
      isRecentFolder
    );
  }

  get roomsForRestore() {
    return this.folders.filter((f) => f.security.Move);
  }

  get roomsForDelete() {
    return this.folders.filter((f) => f.security.Delete);
  }

  getRooms = async (filter) => {
    const userId = this.userStore.user && this.userStore.user.id;
    const newFilter = RoomsFilter.getDefault(userId);
    Object.assign(newFilter, filter);

    return api.rooms.getRooms(newFilter);
  };

  setHotkeysClipboard = (hotkeysClipboard) => {
    this.hotkeysClipboard = hotkeysClipboard || this.selection;
  };

  getPrimaryLink = async (roomId) => {
    const link = await api.rooms.getPrimaryLink(roomId);
    if (link) {
      this.setRoomShared(roomId, true);
    }

    return link;
  };

  setRoomShared = (roomId, shared) => {
    const roomIndex = this.folders.findIndex((r) => r.id === roomId);

    if (roomIndex !== -1) {
      this.folders[roomIndex].shared = shared;
    }

    const navigationPath = [...this.selectedFolderStore.navigationPath];

    if (this.selectedFolderStore.id === roomId) {
      this.selectedFolderStore.setShared(shared);
      return;
    }

    const pathPartsRoomIndex = navigationPath.findIndex((f) => f.id === roomId);
    if (pathPartsRoomIndex === -1) return;
    navigationPath[pathPartsRoomIndex].shared = shared;
    this.selectedFolderStore.setNavigationPath(navigationPath);
  };

  setInRoomFolder = (roomId, inRoom) => {
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

  updateRoom = (oldRoom, newRoom) => {
    // After rename of room with providerKey, it's id value changes too
    if (oldRoom.providerKey) {
      let index = this.getFolderIndex(oldRoom.id);

      if (index === -1) {
        index = this.getFolderIndex(newRoom.id);
      }

      return this.updateFolder(index, newRoom);
    }

    this.setFolder(newRoom);
  };

  get isFiltered() {
    const { isRoomsFolder, isArchiveFolder } = this.treeFoldersStore;

    const {
      subjectId,
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
    } = this.filter;

    const isFiltered =
      isRoomsFolder || isArchiveFolder
        ? filterValue ||
          type ||
          provider ||
          withRoomsSubfolders ||
          searchInContentRooms ||
          subjectId ||
          tags ||
          withoutTags ||
          quotaFilter
        : authorType ||
          roomId ||
          search ||
          withSubfolders ||
          filterType ||
          searchInContent;

    return isFiltered;
  }

  get needResetFilesSelection() {
    const { isVisible: infoPanelVisible } = this.infoPanelStore;

    return !infoPanelVisible || this.selection.length > 1;
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

  setMainButtonVisible = (mainButtonVisible) => {
    this.mainButtonVisible = mainButtonVisible;
  };
}

export default FilesStore;
