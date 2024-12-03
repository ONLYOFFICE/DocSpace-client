import { makeAutoObservable } from "mobx";
import FileState from "../modules/state/fileState";
import SelectionState from "../modules/state/selectionState";
import ViewState from "../modules/state/viewState";
import FilterState from "../modules/filtering/filters";
import FileOperations from "../modules/operations/fileOperations";
import SocketHandler from "../modules/socket/socketHandler";
import RoomManager from "../modules/rooms/roomManager";
import ErrorHandler from "../modules/error/errorHandler";
import ThumbnailManager from "../modules/thumbnails/thumbnailManager";
import AccessManager from "../modules/access/accessManager";
import LoadingManager from "../modules/loading/loadingManager";
import HistoryManager from "../modules/history/historyManager";
import PluginManager from "../modules/plugins/pluginManager";
import SearchManager from "../modules/search/searchManager";
import MetadataManager from "../modules/metadata/metadataManager";
import SharingManager from "../modules/sharing/sharingManager";
import NotificationManager from "../modules/notifications/notificationManager";
import BatchManager from "../modules/batch/batchManager";
import QuotaManager from "../modules/quota/quotaManager";
import SettingsManager from "../modules/settings/settingsManager";
import FolderManager from "../modules/folders/folderManager";
import AuthManager from "../modules/auth/authManager";
import TrashManager from "../modules/trash/trashManager";
import TagManager from "../modules/tags/tagManager";
import VersionManager from "../modules/versions/versionManager";
import SecurityManager from "../modules/security/securityManager";
import TemplateManager from "../modules/templates/templateManager";

class FilesStore {
  constructor(
    // authStore,
    // userStore,
    // selectedFolderStore,
    // settingsStore,
    // currentQuotaStore
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
    socketTurnOn = true,
  ) {
    this.authStore = authStore;
    this.selectedFolderStore = selectedFolderStore;
    this.treeFoldersStore = treeFoldersStore;
    this.filesSettingsStore = filesSettingsStore;
    this.thirdPartyStore = thirdPartyStore;
    this.accessRightsStore = accessRightsStore;
    this.clientLoadingStore = clientLoadingStore;
    this.pluginStore = pluginStore;
    this.publicRoomStore = publicRoomStore;
    this.infoPanelStore = infoPanelStore;
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.settingsStore = settingsStore;
    this.indexingStore = indexingStore;

    this.socketTurnOn = socketTurnOn;
    //this.currentQuotaStore = currentQuotaStore;

    // Initialize sub-modules
    this.loadingManager = new LoadingManager(this);
    this.errorHandler = new ErrorHandler(this);
    this.fileState = new FileState(this);
    this.selectionState = new SelectionState(this);
    this.viewState = new ViewState(this);
    this.filterState = new FilterState(this);
    this.fileOperations = new FileOperations(this);
    this.socketHandler = new SocketHandler(this);
    this.roomManager = new RoomManager(this);
    this.thumbnailManager = new ThumbnailManager(this);
    this.accessManager = new AccessManager(this);
    this.historyManager = new HistoryManager(this);
    this.pluginManager = new PluginManager(this);
    this.searchManager = new SearchManager(this);
    this.metadataManager = new MetadataManager(this);
    this.sharingManager = new SharingManager(this);
    this.notificationManager = new NotificationManager(this);
    this.batchManager = new BatchManager(this);
    this.quotaManager = new QuotaManager(this);
    this.settingsManager = new SettingsManager(this);
    this.folderManager = new FolderManager(this);
    this.authManager = new AuthManager(this);
    this.trashManager = new TrashManager(this);
    this.tagManager = new TagManager(this);
    this.versionManager = new VersionManager(this);
    this.securityManager = new SecurityManager(this);
    this.templateManager = new TemplateManager(this);

    makeAutoObservable(this, {
      authStore: false,
      userStore: false,
      selectedFolderStore: false,
      settingsStore: false,
      currentQuotaStore: false,
      socketHandler: false,
      errorHandler: false,
      thumbnailManager: false,
      loadingManager: false,
      historyManager: false,
      pluginManager: false,
      searchManager: false,
      metadataManager: false,
      sharingManager: false,
      notificationManager: false,
      batchManager: false,
      quotaManager: false,
      settingsManager: false,
      folderManager: false,
      authManager: false,
      trashManager: false,
      tagManager: false,
      versionManager: false,
      securityManager: false,
      templateManager: false,
    });
  }

  // Loading state proxy methods
  get isLoading() {
    return this.loadingManager.isLoading;
  }

  // History proxy methods
  get history() {
    return this.historyManager.currentHistory;
  }

  fetchHistory = (fileId) => {
    return this.historyManager.fetchHistory(fileId);
  };

  // Search proxy methods
  search = (query) => {
    return this.searchManager.search(query);
  };

  searchInFolder = (folderId, query) => {
    return this.searchManager.searchInFolder(folderId, query);
  };

  // Metadata proxy methods
  getMetadata = (fileId) => {
    return this.metadataManager.getMetadata(fileId);
  };

  updateMetadata = (fileId, updates) => {
    return this.metadataManager.updateMetadata(fileId, updates);
  };

  // Sharing proxy methods
  shareWithUsers = (fileId, users, accessRights) => {
    return this.sharingManager.shareWithUsers(fileId, users, accessRights);
  };

  getSharing = (fileId) => {
    return this.sharingManager.getSharing(fileId);
  };

  // Plugin proxy methods
  registerPlugin = (pluginId, plugin) => {
    return this.pluginManager.registerPlugin(pluginId, plugin);
  };

  activatePlugin = (pluginId) => {
    return this.pluginManager.activatePlugin(pluginId);
  };

  // File state proxy methods
  get files() {
    return this.fileState.files;
  }

  get folders() {
    return this.fileState.folders;
  }

  get allItems() {
    return this.fileState.allItems;
  }

  // Selection state proxy methods
  get selection() {
    return this.selectionState.selection;
  }

  get selected() {
    return this.selectionState.selected;
  }

  // View state proxy methods
  get viewAs() {
    return this.viewState.viewAs;
  }

  // Filter state proxy methods
  get filter() {
    return this.filterState.currentFilter;
  }

  get roomsFilter() {
    return this.filterState.currentRoomsFilter;
  }

  get membersFilter() {
    return this.filterState.currentMembersFilter;
  }

  // File operations proxy methods
  initFiles = () => {
    return this.fileOperations.initFiles();
  };

  createFile = (fileData) => {
    return this.fileOperations.createFile(fileData);
  };

  deleteFiles = (fileIds) => {
    return this.fileOperations.deleteFiles(fileIds);
  };

  updateFile = (fileId, updates) => {
    return this.fileOperations.updateFile(fileId, updates);
  };

  moveFiles = (fileIds, destFolderId) => {
    return this.fileOperations.moveFiles(fileIds, destFolderId);
  };

  copyFiles = (fileIds, destFolderId) => {
    return this.fileOperations.copyFiles(fileIds, destFolderId);
  };

  // Room management proxy methods
  fetchRooms = () => {
    return this.roomManager.fetchRooms();
  };

  createRoom = (roomData) => {
    return this.roomManager.createRoom(roomData);
  };

  updateRoom = (roomId, updates) => {
    return this.roomManager.updateRoom(roomId, updates);
  };

  deleteRoom = (roomId) => {
    return this.roomManager.deleteRoom(roomId);
  };

  // Selection proxy methods
  setSelection = (items) => {
    this.selectionState.setSelection(items);
  };

  clearSelection = () => {
    this.selectionState.clearSelection();
  };

  // View proxy methods
  setViewAs = (view) => {
    this.viewState.setViewAs(view);
  };

  // Filter proxy methods
  setFilter = (filter) => {
    this.filterState.setFilter(filter);
  };

  setRoomsFilter = (filter) => {
    this.filterState.setRoomsFilter(filter);
  };

  setMembersFilter = (filter) => {
    this.filterState.setMembersFilter(filter);
  };

  // Thumbnail proxy methods
  enqueueThumbnail = (fileId) => {
    return this.thumbnailManager.enqueueThumbnailGeneration(fileId);
  };

  getThumbnail = (fileId) => {
    return this.thumbnailManager.getThumbnail(fileId);
  };

  // Access proxy methods
  canRead = (item) => {
    return this.accessManager.canRead(item);
  };

  canWrite = (item) => {
    return this.accessManager.canWrite(item);
  };

  canDelete = (item) => {
    return this.accessManager.canDelete(item);
  };

  // Notification proxy methods
  fetchNotifications = (fileId) =>
    this.notificationManager.fetchNotifications(fileId);
  fetchMoreNotifications = (fileId) =>
    this.notificationManager.fetchMoreNotifications(fileId);
  subscribeToNotifications = (fileId, types) =>
    this.notificationManager.subscribeToNotifications(fileId, types);
  unsubscribeFromNotifications = (fileId) =>
    this.notificationManager.unsubscribeFromNotifications(fileId);
  markNotificationsAsRead = (fileId, notificationIds) =>
    this.notificationManager.markAsRead(fileId, notificationIds);
  markAllNotificationsAsRead = (fileId) =>
    this.notificationManager.markAllAsRead(fileId);
  deleteNotifications = (fileId, notificationIds) =>
    this.notificationManager.deleteNotifications(fileId, notificationIds);

  // Batch proxy methods
  startBatchOperation = (type, items, targetFolderId) =>
    this.batchManager.startBatchOperation(type, items, targetFolderId);
  cancelBatchOperation = (operationId) =>
    this.batchManager.cancelBatchOperation(operationId);
  getOperation = (operationId) => this.batchManager.getOperation(operationId);
  getOperationProgress = (operationId) =>
    this.batchManager.getOperationProgress(operationId);
  getOperationStatus = (operationId) =>
    this.batchManager.getOperationStatus(operationId);
  clearCompletedOperations = () => this.batchManager.clearCompletedOperations();

  // Quota proxy methods
  fetchQuota = () => this.quotaManager.fetchQuota();
  updateQuota = () => this.quotaManager.updateQuota();
  get usedSpace() {
    return this.quotaManager.usedSpace;
  }
  get totalSpace() {
    return this.quotaManager.totalSpace;
  }
  get availableSpace() {
    return this.quotaManager.availableSpace;
  }
  get usagePercentage() {
    return this.quotaManager.usagePercentage;
  }
  get isQuotaExceeded() {
    return this.quotaManager.isQuotaExceeded;
  }
  get isQuotaAlmostExceeded() {
    return this.quotaManager.isQuotaAlmostExceeded;
  }

  // Settings proxy methods
  fetchSettings = () => this.settingsManager.fetchSettings();
  updateSettings = (updates) => this.settingsManager.updateSettings(updates);
  get thumbnailSize() {
    return this.settingsManager.thumbnailSize;
  }
  setThumbnailSize = (size) => this.settingsManager.setThumbnailSize(size);
  get showHiddenFiles() {
    return this.settingsManager.showHiddenFiles;
  }
  setShowHiddenFiles = (show) => this.settingsManager.setShowHiddenFiles(show);
  get sortBy() {
    return this.settingsManager.sortBy;
  }
  get sortOrder() {
    return this.settingsManager.sortOrder;
  }
  setSorting = (by, order) => this.settingsManager.setSorting(by, order);
  get itemsPerPage() {
    return this.settingsManager.itemsPerPage;
  }
  setItemsPerPage = (count) => this.settingsManager.setItemsPerPage(count);
  resetSettingsToDefaults = () => this.settingsManager.resetToDefaults();

  // Folder proxy methods
  get currentFolder() {
    return this.folderManager.currentFolder;
  }
  get folderPath() {
    return this.folderManager.folderPath;
  }
  get folderTree() {
    return this.folderManager.folderTree;
  }
  get recentFolders() {
    return this.folderManager.recentFolders;
  }
  get parentFolderId() {
    return this.folderManager.parentFolderId;
  }
  get isRootFolder() {
    return this.folderManager.isRootFolder;
  }
  fetchFolder = (folderId) => this.folderManager.fetchFolder(folderId);
  fetchFolderPath = (folderId) => this.folderManager.fetchFolderPath(folderId);
  fetchFolderTree = () => this.folderManager.fetchFolderTree();
  createFolder = (parentId, data) =>
    this.folderManager.createFolder(parentId, data);
  updateFolder = (folderId, updates) =>
    this.folderManager.updateFolder(folderId, updates);
  deleteFolder = (folderId) => this.folderManager.deleteFolder(folderId);
  moveFolder = (folderId, targetId) =>
    this.folderManager.moveFolder(folderId, targetId);
  copyFolder = (folderId, targetId) =>
    this.folderManager.copyFolder(folderId, targetId);

  // Cleanup method
  dispose = () => {
    this.socketHandler.disconnect();
    this.thumbnailManager.clearThumbnailCache();
    this.loadingManager.clearAllLoadingStates();
    this.historyManager.clearHistory();
    this.pluginManager.clearPlugins();
    this.searchManager.clearSearch();
    this.metadataManager.clearAll();
    this.sharingManager.clearAll();
    this.notificationManager.clearAll();
    this.batchManager.clearAll();
    this.quotaManager.clearQuota();
    this.settingsManager.clearSettings();
    this.folderManager.clearFolderState();
    this.authManager.clearAuth();
    this.trashManager.clearTrash();
    this.tagManager.clearAll();
    this.versionManager.clearAll();
    this.securityManager.clearAll();
    this.templateManager.clearAll();
  };
}

export default FilesStore;
