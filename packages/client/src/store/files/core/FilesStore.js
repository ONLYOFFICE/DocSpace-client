// (c) Copyright Ascensio System SIA 2009-2024
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

import { makeAutoObservable, runInAction } from "mobx";
import { thumbnailStatuses } from "SRC_DIR/helpers/filesConstants";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";
import {
  FileStatus,
  FilterType,
  RoomsProviderType,
} from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getCategoryType } from "SRC_DIR/helpers/category";

const THUMBNAILS_CACHE = 500;
let timerId;

class FilesStore {
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

    this.socketService = new SocketService(this);

    this.createNewFilesQueue.on("resolve", this.onResolveNewFile);
  }

  /**
   * Collection of files
   * @type {Array}
   */
  files = [];
  /**
   * Collection of folders
   * @type {Array}
   */
  folders = [];

  /**
   * Filter for files
   * @type {Object}
   */
  filter = FilesFilter.getDefault();

  /**
   * Filter for rooms
   * @type {Object}
   */
  roomsFilter = RoomsFilter.getDefault();

  /**
   * Currently selected items
   * @type {Array}
   */
  selection = [];

  /**
   * Temporary selection buffer
   * @type {Object|null}
   */
  bufferSelection = null;

  /**
   * Thumbnails
   * @type {Set}
   */
  thumbnails = new Set();

  /**
   * Queue for creating new files
   * @type {Queue}
   */
  createNewFilesQueue = new Queue({
    concurrent: 5,
    interval: 500,
    start: true,
  });

  /**
   * Flag indicating if a room has been created
   * @type {boolean}
   */
  roomCreated = false;

  /**
   * Temporary action files IDs
   * @type {Array}
   */
  tempActionFilesIds = [];

  /**
   * Active files
   * @type {Array}
   */
  activeFiles = [];

  /**
   * Active folders
   * @type {Array}
   */
  activeFolders = [];

  /**
   * Flag indicating if the page is empty
   * @type {boolean}
   */
  isEmptyPage = true;

  /**
   * Category type for the current folder
   * @type {string}
   */
  categoryType = getCategoryType(window.location);

  /**
   * Flag indicating if pagination is hidden
   * @type {boolean}
   */
  isHidePagination = false;

  /**
   * Flag indicating if files are being loaded
   * @type {boolean}
   */
  isLoadingFilesFind = false;

  /**
   * Length of the page items
   * @type {number|null}
   */
  pageItemsLength = null;

  get filesList() {
    //return [...this.folders, ...this.files];

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
      const firstValue = a.roomType ? 1 : 0;
      const secondValue = b.roomType ? 1 : 0;

      return secondValue - firstValue;
    });

    const items = [...newFolders, ...this.files];

    if (items.length > 0 && this.isEmptyPage) {
      this.setIsEmptyPage(false);
    }

    return this.getFilesListItems(items);
  }

  /**
   * Gets the list of files and folders
   * @param {Array} items - Array of items
   * @returns {Array} List of files and folders
   */
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

      const previewUrl = canOpenPlayer
        ? this.getItemUrl(id, false, needConvert, canOpenPlayer)
        : null;

      const contextOptions = this.getFilesContextOptions(item);
      const isThirdPartyFolder = providerKey && id === rootFolderId;

      let isFolder = false;
      this.folders.map((x) => {
        if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
      });

      const { isRecycleBinFolder } = this.treeFoldersStore;

      const folderUrl = isFolder && this.getItemUrl(id, isFolder, false, false);

      const needConvert = item.viewAccessibility?.MustConvert;
      const isEditing =
        (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

      const docUrl =
        !canOpenPlayer && !isFolder && this.getItemUrl(id, false, needConvert);

      const href = isRecycleBinFolder
        ? null
        : previewUrl
          ? previewUrl
          : !isFolder
            ? item.fileType === FilterType.Archive
              ? item.webUrl
              : docUrl
            : folderUrl;

      const isRoom = !!roomType;

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
        fileItemsList.forEach(({ key, value }) => {
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
        //checked,
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
        //selectedItem,
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
        //canShare,
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
    } else {
      const url = combineUrl(
        proxyURL,
        config.homepage,
        `/doceditor?fileId=${id}${needConvert ? "&action=view" : ""}`,
      );

      return url;
    }
  };

  get showNewFilesInList() {
    if (
      this.selectedFolderStore.isIndexedFolder &&
      this.filesList.length < this.filter.total
    ) {
      return false;
    }

    return true;
  }

  updateSelectionStatus = (id, status, isEditing) => {
    const index = this.selection.findIndex((x) => x.id === id);

    if (index !== -1) {
      this.selection[index].fileStatus = status;
      this.selection[index].isEditing = isEditing;
    }
  };

  updateFileStatus = (index, status) => {
    if (index < 0) return;

    this.files[index].fileStatus = status;
  };

  updateSelectionStatus = (id, status, isEditing) => {
    const index = this.selection.findIndex((x) => x.id === id);

    if (index !== -1) {
      this.selection[index].fileStatus = status;
      this.selection[index].isEditing = isEditing;
    }
  };

  setSelection = (selection) => {
    this.selection = selection;
  };

  setBufferSelection = (bufferSelection) => {
    // console.log("setBufferSelection", bufferSelection);
    this.bufferSelection = bufferSelection;
  };

  setTempActionFilesIds = (tempActionFilesIds) => {
    this.tempActionFilesIds = tempActionFilesIds;
  };

  setTempActionFoldersIds = (tempActionFoldersIds) => {
    this.tempActionFoldersIds = tempActionFoldersIds;
  };

  getFileInfo = async (id) => {
    const fileInfo = await api.files.getFileInfo(id);
    this.setFile(fileInfo);
    return fileInfo;
  };

  setFile = (file) => {
    const index = this.files.findIndex((x) => x.id === file.id);
    if (index !== -1) {
      this.files[index] = file;
      this.createThumbnail(file);
    }
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

  getFolderIndex = (id) => {
    const index = this.folders.findIndex((x) => x.id === id);
    return index;
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

  setFilter = (filter) => {
    filter.pageCount = 100;
    this.filter = filter;
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

  removeStaleItemFromSelection = (item) => {
    if (!item.parentId) {
      if (this.activeFiles.some((elem) => elem.id === item.id)) return;
    } else {
      if (this.activeFolders.some((elem) => elem.id === item.id)) return;
    }

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

  debounceRemoveFiles = debounce(() => {
    this.removeFiles(this.tempActionFilesIds);
  }, 1000);

  /**
   * Removes files
   * @param {Array} fileIds - Array of file IDs to remove
   * @param {Array} folderIds - Array of folder IDs to remove
   * @param {Function} showToast - Function to show a toast notification
   * @param {string} destFolderId - Destination folder ID
   */
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
          // toastr.error(err);
          console.error(err);
        })
        .finally(() => {
          this.setTempActionFilesIds([]);
          this.setTempActionFoldersIds([]);
        });
    } else {
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
          // toastr.error(err);
          console.error(err);
        })
        .finally(() => {
          this.setTempActionFilesIds([]);
          this.setTempActionFoldersIds([]);
        });
    }
  };

  setIsEmptyPage = (isEmptyPage) => {
    this.isEmptyPage = isEmptyPage;
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

  setFiles = (files) => {
    if (files.length === 0 && this.files.length === 0) return;

    this.socketService.subscribeToFiles(files);

    this.files = files;

    this.createThumbnails();
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
}

export default FilesStore;
