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
import ItemService from "../services/item/itemService";

const storageViewAs = localStorage.getItem("viewAs");

class FilesStore {
  /**
   * Authentication store instance
   * @type {Object}
   */
  authStore;
  /**
   * User store instance
   * @type {Object}
   */
  userStore;
  /**
   * Current tariff status store instance
   * @type {Object}
   */
  currentTariffStatusStore;
  /**
   * Selected folder store instance
   * @type {Object}
   */
  selectedFolderStore;
  /**
   * Tree folders store instance
   * @type {Object}
   */
  treeFoldersStore;
  /**
   * Files settings store instance
   * @type {Object}
   */
  filesSettingsStore;
  /**
   * Third party integration store instance
   * @type {Object}
   */
  thirdPartyStore;
  /**
   * Client loading state store instance
   * @type {Object}
   */
  clientLoadingStore;
  /**
   * Info panel store instance
   * @type {Object}
   */
  infoPanelStore;
  /**
   * Access rights store instance
   * @type {Object}
   */
  accessRightsStore;
  /**
   * Public room store instance
   * @type {Object}
   */
  publicRoomStore;
  /**
   * Settings store instance
   * @type {Object}
   */
  settingsStore;
  /**
   * Current quota store instance
   * @type {Object}
   */
  currentQuotaStore;
  /**
   * Indexing store instance
   * @type {Object}
   */
  indexingStore;
  /**
   * Plugin store instance
   * @type {Object}
   */
  pluginStore;

  /**
   * View mode for files display (tile, row, or table)
   * @type {string}
   */
  privateViewAs =
    !isDesktop() && storageViewAs !== "tile" ? "row" : storageViewAs || "table";
  /**
   * Flag indicating if drag operation is in progress
   * @type {boolean}
   */
  dragging = false;
  /**
   * URL for privacy instructions
   * @type {string}
   */
  privacyInstructions = "https://www.onlyoffice.com/private-rooms.aspx";

  /**
   * Store initialization status
   * @type {boolean}
   */
  isInit = false;
  /**
   * Flag indicating if a row item is being updated
   * @type {boolean}
   */
  isUpdatingRowItem = false;
  /**
   * Flag for password entry process
   * @type {boolean}
   */
  passwordEntryProcess = false;
  /**
   * X coordinate for tooltip positioning
   * @type {number}
   */
  tooltipPageX = 0;
  /**
   * Y coordinate for tooltip positioning
   * @type {number}
   */
  tooltipPageY = 0;
  /**
   * Flag indicating drag start
   * @type {boolean}
   */
  startDrag = false;

  /**
   * Flag to prevent concurrent room fetching
   * @type {boolean}
   */
  alreadyFetchingRooms = false;
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
   * Selection state
   * @type {string}
   */
  selected = "close";
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
   * Filter for members
   * @type {Object}
   */
  membersFilter = {
    page: 0,
    pageCount: 100,
    total: 0,
    startIndex: 0,
  };

  /**
   * Category type for the current folder
   * @type {string}
   */
  categoryType = getCategoryType(window.location);

  /**
   * Timeout for loading files
   * @type {number|null}
   */
  loadTimeout = null;
  /**
   * Hotkey caret
   * @type {Object|null}
   */
  hotkeyCaret = null;
  /**
   * Hotkey caret start
   * @type {Object|null}
   */
  hotkeyCaretStart = null;

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
   * Flag indicating if the first element is checked
   * @type {boolean}
   */
  firstElemChecked = false;
  /**
   * Flag indicating if the header border is visible
   * @type {boolean}
   */
  headerBorder = false;

  /**
   * Flag indicating if hotkeys are enabled
   * @type {boolean}
   */
  enabledHotkeys = true;

  /**
   * Created item
   * @type {Object|null}
   */
  createdItem = null;
  /**
   * Item to scroll to
   * @type {Object|null}
   */
  scrollToItem = null;

  /**
   * Flag indicating if a room has been created
   * @type {boolean}
   */
  roomCreated = false;

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
   * Flag indicating if pagination is hidden
   * @type {boolean}
   */
  isHidePagination = false;
  /**
   * Flag indicating if the trash is empty
   * @type {boolean}
   */
  trashIsEmpty = false;
  /**
   * Flag indicating if the main button is visible on mobile
   * @type {boolean}
   */
  mainButtonMobileVisible = true;
  /**
   * Flag indicating if files are being loaded
   * @type {boolean}
   */
  filesIsLoading = false;

  /**
   * Flag indicating if the page is empty
   * @type {boolean}
   */
  isEmptyPage = true;
  /**
   * Flag indicating if the page has been loaded
   * @type {boolean}
   */
  isLoadedFetchFiles = false;
  /**
   * Temporary action files IDs
   * @type {Array}
   */
  tempActionFilesIds = [];

  /**
   * Temporary action folders IDs
   * @type {Array}
   */
  tempActionFoldersIds = [];

  /**
   * Flag indicating if there is an error with the room not being available
   * @type {boolean}
   */
  isErrorRoomNotAvailable = false;

  /**
   * Rooms controller
   * @type {AbortController}
   */
  roomsController = null;
  /**
   * Files controller
   * @type {AbortController}
   */
  filesController = null;

  /**
   * Flag indicating if the search should be cleared
   * @type {boolean}
   */
  clearSearch = false;

  /**
   * Flag indicating if the page is loaded
   * @type {boolean}
   */
  isLoadedEmptyPage = false;
  /**
   * Flag indicating if the current room notifications are muted
   * @type {boolean}
   */
  isMuteCurrentRoomNotifications = false;
  /**
   * Flag indicating if the preview is enabled
   * @type {boolean}
   */
  isPreview = false;
  /**
   * Temporary filter
   * @type {Object|null}
   */
  tempFilter = null;

  /**
   * Highlighted file
   * @type {Object}
   */
  highlightFile = {};
  /**
   * Thumbnails
   * @type {Set}
   */
  thumbnails = new Set();
  /**
   * Flag indicating if a move operation is in progress
   * @type {boolean}
   */
  movingInProgress = false;
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
   * Hotkeys clipboard
   * @type {Array}
   */
  hotkeysClipboard = [];

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
    this.itemService = new ItemService(this);

    this.createNewFilesQueue.on("resolve", this.onResolveNewFile);
  }

  /**
   * Thumbnails proxy
   */
  get thumbnails() {
    return this.thumbnailService.thumbnails;
  }

  get filesList() {
    return this.itemService.getFilesList();
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

  getFilesListItems = (items) => {
    return this.itemService.getFilesListItems(items);
  };

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
