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
import {
  FileStatus,
  FilterType,
  RoomsProviderType,
} from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils/device";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getCategoryType } from "SRC_DIR/helpers/category";
import ThumbnailService from "../services/thumbnail/thumbnailService";
import SocketService from "../services/socket/socketService";
import { getViewForCurrentRoom } from "@docspace/shared/utils/getViewForCurrentRoom";
import FileService from "../services/file/fileService";
import SelectionService from "../services/selection/selectionService";
import FilterService from "../services/filter/filterService";
import { getItemUrl } from "SRC_DIR/helpers/filesUtils";

const storageViewAs = localStorage.getItem("viewAs");

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
    this.thumbnailService = new ThumbnailService(this);
    this.fileService = new FileService(this);
    this.selectionService = new SelectionService(this);
    this.filterService = new FilterService(this);

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

  /**
   * View mode for files display (tile, row, or table)
   * @type {string}
   */
  privateViewAs =
    !isDesktop() && storageViewAs !== "tile" ? "row" : storageViewAs || "table";

  /**
   * Thumbnails proxy
   */
  get thumbnails() {
    return this.thumbnailService.thumbnails;
  }

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
        ? getItemUrl(
            id,
            false,
            this.categoryType,
            needConvert,
            canOpenPlayer,
            this.publicRoomStore.publicRoomKey,
          )
        : null;

      const contextOptions = this.getFilesContextOptions(item);
      const isThirdPartyFolder = providerKey && id === rootFolderId;

      let isFolder = false;
      this.folders.map((x) => {
        if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
      });

      const { isRecycleBinFolder } = this.treeFoldersStore;

      const folderUrl =
        isFolder &&
        getItemUrl(
          id,
          isFolder,
          this.categoryType,
          false,
          false,
          this.publicRoomStore.publicRoomKey,
        );

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

  get showNewFilesInList() {
    if (
      this.selectedFolderStore.isIndexedFolder &&
      this.filesList.length < this.filter.total
    ) {
      return false;
    }

    return true;
  }

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

  updateSelectionStatus = (id, status, isEditing) => {
    this.selectionService.updateSelectionStatus(id, status, isEditing);
  };

  updateFileStatus = (index, status) => {
    if (index < 0) return;

    this.files[index].fileStatus = status;
  };

  setSelection = (selection) => {
    this.selectionService.setSelection(selection);
  };

  setBufferSelection = (bufferSelection) => {
    this.selectionService.setBufferSelection(bufferSelection);
  };

  setTempActionFilesIds = (tempActionFilesIds) => {
    this.tempActionFilesIds = tempActionFilesIds;
  };

  setTempActionFoldersIds = (tempActionFoldersIds) => {
    this.tempActionFoldersIds = tempActionFoldersIds;
  };

  getFileInfo = async (id) => {
    return this.fileService.getFileInfo(id);
  };

  setFile = (file) => {
    this.fileService.setFile(file);
  };

  createThumbnail = async (file) => {
    return this.thumbnailService.createThumbnail(file);
  };

  getFolderIndex = (id) => {
    const index = this.folders.findIndex((x) => x.id === id);
    return index;
  };

  checkSelection = (file) => {
    this.selectionService.checkSelection(file);
  };

  setFilter = (filter) => {
    this.filterService.setFilter(filter);
  };

  setFolders = (folders) => {
    if (folders.length === 0 && this.folders.length === 0) return;

    this.socketService.subscribeToFolders(folders);

    this.folders = folders;
  };

  removeStaleItemFromSelection = (item) => {
    this.selectionService.removeStaleItemFromSelection(item);
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
    return this.fileService.removeFiles(
      fileIds,
      folderIds,
      showToast,
      destFolderId,
    );
  };

  setIsEmptyPage = (isEmptyPage) => {
    this.isEmptyPage = isEmptyPage;
  };

  setRoomsFilter = (filter) => {
    this.filterService.setRoomsFilter(filter);
  };

  setFiles = (files) => {
    if (files.length === 0 && this.files.length === 0) return;

    this.socketService.subscribeToFiles(files);

    this.files = files;

    this.createThumbnails();
  };

  createThumbnails = async (files = null) => {
    return this.thumbnailService.createThumbnails(files);
  };
}

export default FilesStore;
