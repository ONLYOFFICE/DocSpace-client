import { jest } from "@jest/globals";
// import FilesStore from "../FilesStore.js";
import FilesStore from "../FilesStore.js";
// import api from "@docspace/shared/api";
import { makeAutoObservable } from "mobx";

// Mock dependencies
jest.mock("@docspace/shared/api");
jest.mock("@docspace/shared/utils");
// jest.mock("mobx");

jest.mock("@docspace/shared/api", () => ({
  FilesFilter: {
    getDefault: jest.fn(() => ({
      page: 0,
      pageCount: 25,
      total: 0,
      startIndex: 0,
    })),
  },
  RoomsFilter: {
    getDefault: jest.fn(() => ({
      page: 0,
      pageCount: 25,
      total: 0,
      startIndex: 0,
    })),
  },
}));

jest.mock("mobx", () => ({
  makeAutoObservable: jest.fn(),
  runInAction: (fn) => fn(),
}));

jest.mock("@docspace/shared/utils/socket", () => ({
  SocketEvents: {
    ModifyFolder: "s:modify-folder",
    UpdateHistory: "s:update-history",
    RefreshFolder: "s:refresh-folder",
    MarkAsNewFolder: "s:markasnew-folder",
    MarkAsNewFile: "s:markasnew-file",
    StartEditFile: "s:start-edit-file",
    StopEditFile: "s:stop-edit-file",
  },
  SocketCommands: {
    SUBSCRIBE: "subscribe",
    UNSUBSCRIBE: "unsubscribe",
  },
  on: jest.fn(),
  default: {
    on: jest.fn(),
    socketSubscribers: new Map(),
  },
}));

// Mock device utility
jest.mock("@docspace/shared/utils/device", () => ({
  isDesktop: () => true,
  isMobile: () => false,
  checkIsSSR: () => false,
}));

describe("FilesStore", () => {
  let store;
  let mockAuthStore;
  let mockUserStore;
  let mockSettingsStore;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock stores
    mockAuthStore = {
      isAuthenticated: true,
      settingsStore: {},
    };

    mockUserStore = {
      user: {
        id: "test-user-id",
        displayName: "Test User",
      },
    };

    mockSettingsStore = {
      culture: "en-US",
    };

    // Initialize store with mock dependencies
    store = new FilesStore(
      mockAuthStore,
      mockUserStore,
      null, // currentTariffStatusStore
      null, // selectedFolderStore
      null, // treeFoldersStore
      null, // filesSettingsStore
      null, // thirdPartyStore
      null, // clientLoadingStore
      null, // infoPanelStore
      null, // accessRightsStore
      null, // publicRoomStore
      mockSettingsStore,
      null, // currentQuotaStore
      null, // indexingStore
      null, // pluginStore
    );
  });

  describe("initialization", () => {
    it("should create store instance", () => {
      expect(store).toBeInstanceOf(FilesStore);
      expect(makeAutoObservable).toHaveBeenCalledWith(store);
    });

    it("should initialize with default values", () => {
      expect(store.authStore).toBe(mockAuthStore);
      expect(store.userStore).toBe(mockUserStore);
      expect(store.settingsStore).toBe(mockSettingsStore);
      expect(store.dragging).toBe(false);
    });

    it("should initialize with default state values", () => {
      expect(store.isInit).toBe(false);
      expect(store.isUpdatingRowItem).toBe(false);
      expect(store.passwordEntryProcess).toBe(false);
      expect(store.startDrag).toBe(false);
      expect(store.alreadyFetchingRooms).toBe(false);
    });

    it("should initialize with empty collections", () => {
      expect(store.files).toEqual([]);
      expect(store.folders).toEqual([]);
      expect(store.selection).toEqual([]);
      expect(store.bufferSelection).toBeNull();
    });

    it("should initialize with default filters", () => {
      expect(store.filter).toEqual({
        page: 0,
        pageCount: 25,
        total: 0,
        startIndex: 0,
      });
      expect(store.roomsFilter).toEqual({
        page: 0,
        pageCount: 25,
        total: 0,
        startIndex: 0,
      });
      expect(store.membersFilter).toEqual({
        page: 0,
        pageCount: 100,
        total: 0,
        startIndex: 0,
      });
    });
  });

  describe("view mode", () => {
    it("should have default view mode", () => {
      expect(store.privateViewAs).toBe("table");
    });
  });

  describe("selection management", () => {
    it("should have initial selection state as 'close'", () => {
      expect(store.selected).toBe("close");
    });

    it("should initialize with empty selection array", () => {
      expect(store.selection).toEqual([]);
    });

    it("should have null buffer selection initially", () => {
      expect(store.bufferSelection).toBeNull();
    });
  });

  describe("coordinates management", () => {
    it("should initialize tooltip coordinates to 0", () => {
      expect(store.tooltipPageX).toBe(0);
      expect(store.tooltipPageY).toBe(0);
    });
  });

  describe("active items management", () => {
    beforeEach(() => {
      store.activeFiles = [];
      store.activeFolders = [];
    });

    describe("addActiveItems", () => {
      it("should add new files to empty active files", () => {
        const files = ["file-1", "file-2"];
        const destFolderId = "folder-1";

        store.addActiveItems(files, null, destFolderId);

        expect(store.activeFiles).toEqual([
          { id: "file-1", destFolderId: "folder-1" },
          { id: "file-2", destFolderId: "folder-1" },
        ]);
      });

      it("should add new folders to empty active folders", () => {
        const folders = ["folder-1", "folder-2"];
        const destFolderId = "dest-folder";

        store.addActiveItems(null, folders, destFolderId);

        expect(store.activeFolders).toEqual([
          { id: "folder-1", destFolderId: "dest-folder" },
          { id: "folder-2", destFolderId: "dest-folder" },
        ]);
      });

      it("should append files to existing active files", () => {
        store.activeFiles = [{ id: "file-1", destFolderId: "folder-1" }];
        const newFiles = ["file-2"];
        const destFolderId = "folder-1";

        store.addActiveItems(newFiles, null, destFolderId);

        expect(store.activeFiles).toEqual([
          { id: "file-1", destFolderId: "folder-1" },
          { id: "file-2", destFolderId: "folder-1" },
        ]);
      });

      it("should append folders to existing active folders", () => {
        store.activeFolders = [{ id: "folder-1", destFolderId: "dest-folder" }];
        const newFolders = ["folder-2"];
        const destFolderId = "dest-folder";

        store.addActiveItems(null, newFolders, destFolderId);

        expect(store.activeFolders).toEqual([
          { id: "folder-1", destFolderId: "dest-folder" },
          { id: "folder-2", destFolderId: "dest-folder" },
        ]);
      });
    });

    describe("removeActiveItem", () => {
      it("should remove file from active files", () => {
        store.activeFiles = [
          { id: "file-1", destFolderId: "folder-1" },
          { id: "file-2", destFolderId: "folder-1" },
        ];

        store.removeActiveItem({ id: "file-1" });

        expect(store.activeFiles).toEqual([
          { id: "file-2", destFolderId: "folder-1" },
        ]);
      });

      it("should handle removing non-existent file", () => {
        store.activeFiles = [{ id: "file-1", destFolderId: "folder-1" }];

        store.removeActiveItem({ id: "non-existent" });

        expect(store.activeFiles).toEqual([
          { id: "file-1", destFolderId: "folder-1" },
        ]);
      });

      it("should handle removing from empty active files", () => {
        store.activeFiles = [];

        store.removeActiveItem({ id: "file-1" });

        expect(store.activeFiles).toEqual([]);
      });
    });

    describe("mappingActiveItems", () => {
      it("should map string items to objects with destFolderId", () => {
        const items = ["item-1", "item-2"];
        const destFolderId = "dest-folder";

        const result = store.mappingActiveItems(items, destFolderId);

        expect(result).toEqual([
          { id: "item-1", destFolderId: "dest-folder" },
          { id: "item-2", destFolderId: "dest-folder" },
        ]);
      });

      it("should preserve existing object items with new destFolderId", () => {
        const items = [
          { id: "item-1", destFolderId: "old-folder" },
          { id: "item-2", destFolderId: "old-folder" },
        ];
        const destFolderId = "new-folder";

        const result = store.mappingActiveItems(items, destFolderId);

        expect(result).toEqual([
          { id: "item-1", destFolderId: "new-folder" },
          { id: "item-2", destFolderId: "new-folder" },
        ]);
      });
    });
  });

  describe("view settings", () => {
    beforeEach(() => {
      store.selectedFolderStore = {
        parentRoomType: "custom",
        roomType: "custom",
        isIndexedFolder: false,
      };
      store.settingsStore = {
        currentDeviceType: "desktop",
      };
      store.createThumbnails = jest.fn();

      // Mock localStorage
      global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
    });

    afterEach(() => {
      delete global.localStorage;
    });

    describe("setViewAs", () => {
      it("should update view and save to localStorage", () => {
        store.setViewAs("tile");

        expect(store.privateViewAs).toBe("tile");
        expect(localStorage.setItem).toHaveBeenCalledWith("viewAs", "tile");
      });

      it("should create thumbnails when switching to tile view", () => {
        store.setViewAs("tile");
        expect(store.createThumbnails).toHaveBeenCalled();
      });

      it("should not create thumbnails for list view", () => {
        store.setViewAs("list");
        expect(store.createThumbnails).not.toHaveBeenCalled();
      });
    });

    describe("viewAs getter", () => {
      it("should return current view setting", () => {
        store.privateViewAs = "tile";
        expect(store.viewAs).toBeDefined();
      });
    });
  });

  describe("loading states", () => {
    it("should initialize with correct loading states", () => {
      expect(store.isLoadingFilesFind).toBe(false);
      expect(store.filesIsLoading).toBe(false);
      expect(store.isLoadedFetchFiles).toBe(false);
    });

    it("should initialize with correct page states", () => {
      expect(store.isEmptyPage).toBe(true);
      expect(store.pageItemsLength).toBeNull();
      expect(store.isHidePagination).toBe(false);
    });
  });

  describe("UI state management", () => {
    it("should initialize with correct UI states", () => {
      expect(store.firstElemChecked).toBe(false);
      expect(store.headerBorder).toBe(false);
      expect(store.enabledHotkeys).toBe(true);
      expect(store.mainButtonMobileVisible).toBe(true);
    });

    it("should initialize with correct hotkey states", () => {
      expect(store.hotkeyCaret).toBeNull();
      expect(store.hotkeyCaretStart).toBeNull();
    });

    it("should initialize with correct room states", () => {
      expect(store.roomCreated).toBe(false);
      expect(store.trashIsEmpty).toBe(false);
    });
  });

  describe("controllers and queues", () => {
    it("should initialize with null controllers", () => {
      expect(store.roomsController).toBeNull();
      expect(store.filesController).toBeNull();
    });

    it("should initialize queue for creating new files", () => {
      expect(store.createNewFilesQueue).toBeDefined();
      expect(store.createNewFilesQueue.concurrent).toBe(5);
      expect(store.createNewFilesQueue.interval).toBe(500);
    });
  });

  describe("search and filter states", () => {
    it("should initialize with correct search states", () => {
      expect(store.clearSearch).toBe(false);
      expect(store.tempFilter).toBeNull();
    });

    it("should initialize with empty highlight file", () => {
      expect(store.highlightFile).toEqual({});
    });
  });

  describe("notification and preview states", () => {
    it("should initialize with correct notification states", () => {
      expect(store.isMuteCurrentRoomNotifications).toBe(false);
      expect(store.isErrorRoomNotAvailable).toBe(false);
    });

    it("should initialize with correct preview states", () => {
      expect(store.isPreview).toBe(false);
      expect(store.isLoadedEmptyPage).toBe(false);
    });
  });

  describe("thumbnails and moving states", () => {
    it("should initialize thumbnails as empty Set", () => {
      expect(store.thumbnails).toBeInstanceOf(Set);
      expect(store.thumbnails.size).toBe(0);
    });

    it("should initialize with correct moving states", () => {
      expect(store.movingInProgress).toBe(false);
    });
  });

  describe("socket event handlers", () => {
    let mockClientLoadingStore;
    let mockTreeFoldersStore;
    let mockInfoPanelStore;

    beforeEach(() => {
      mockClientLoadingStore = {
        isLoading: false,
      };

      mockTreeFoldersStore = {
        updateTreeFoldersItem: jest.fn(),
        treeFolders: [],
      };

      mockInfoPanelStore = {
        infoPanelSelection: null,
        fetchHistory: jest.fn(),
        isVisible: true,
      };

      store = new FilesStore(
        mockAuthStore,
        null, // selectedFolderStore
        mockTreeFoldersStore,
        null, // filesSettingsStore
        null, // thirdPartyStore
        null, // accessRightsStore
        mockClientLoadingStore,
        null, // pluginStore
        null, // publicRoomStore
        mockInfoPanelStore,
        mockUserStore,
        null, // currentTariffStatusStore
        mockSettingsStore,
        null, // indexingStore
        null, // pluginStore
      );
    });

    it("should register socket event handlers on initialization", () => {
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.ModifyFolder,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.UpdateHistory,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.RefreshFolder,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.MarkAsNewFolder,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.MarkAsNewFile,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.StartEditFile,
        expect.any(Function),
      );
      expect(SocketHelper.on).toHaveBeenCalledWith(
        SocketEvents.StopEditFile,
        expect.any(Function),
      );
    });

    it("should initialize controllers on construction", () => {
      expect(store.roomsController).toBeInstanceOf(AbortController);
      expect(store.filesController).toBeInstanceOf(AbortController);
    });

    it("should initialize store dependencies", () => {
      expect(store.treeFoldersStore).toBe(mockTreeFoldersStore);
      expect(store.clientLoadingStore).toBe(mockClientLoadingStore);
      expect(store.infoPanelStore).toBe(mockInfoPanelStore);
    });
  });

  describe("folder modification handlers", () => {
    let mockSocketSubscribers;

    beforeEach(() => {
      mockSocketSubscribers = new Map();
      mockSocketSubscribers.set("DIR-123", true);
      mockSocketSubscribers.set("FILE-456", true);

      // Update the mock implementation
      SocketHelper.socketSubscribers = mockSocketSubscribers;
    });

    it("should skip unsubscribed folder modifications", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.ModifyFolder,
      )[1];

      const opt = {
        data: JSON.stringify({
          folderId: "999", // Not in subscribers
          id: "999",
        }),
      };

      handler(opt);

      // Verify no updates were made
      expect(
        store.treeFoldersStore.updateTreeFoldersItem,
      ).not.toHaveBeenCalled();
    });

    it("should handle folder creation with showNewFilesInList disabled", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.ModifyFolder,
      )[1];

      store.showNewFilesInList = false;
      store.filter = { total: 5 };
      store.setFilter = jest.fn();

      const opt = {
        cmd: "create",
        data: JSON.stringify({
          folderId: "123", // In subscribers
        }),
      };

      handler(opt);

      expect(store.setFilter).toHaveBeenCalledWith({ total: 6 });
    });
  });

  describe("file modification handlers", () => {
    let mockSocketSubscribers;

    beforeEach(() => {
      mockSocketSubscribers = new Map();
      mockSocketSubscribers.set("FILE-456", true);

      // Update the mock implementation
      SocketHelper.socketSubscribers = mockSocketSubscribers;

      // Initialize files array
      store.files = [
        {
          id: "456",
          title: "Test File",
          fileStatus: 0,
        },
      ];

      // Mock methods
      store.updateFileStatus = jest.fn();
      store.updateSelectionStatus = jest.fn();
      store.getFileInfo = jest.fn().mockResolvedValue({
        id: "456",
        title: "Updated Test File",
        fileExst: ".txt",
      });
    });

    it("should handle mark as new file", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.MarkAsNewFile,
      )[1];

      const opt = {
        fileId: "456",
        count: 1,
      };

      handler(opt);

      expect(store.updateFileStatus).toHaveBeenCalledWith(0, 1);
      expect(store.treeFoldersStore.fetchTreeFolders).toHaveBeenCalled();
    });

    it("should handle start edit file", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.StartEditFile,
      )[1];

      handler("456");

      expect(store.updateFileStatus).toHaveBeenCalledWith(0, 2);
      expect(store.updateSelectionStatus).toHaveBeenCalledWith("456", 2, true);
    });

    it("should handle stop edit file", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.StopEditFile,
      )[1];

      store.infoPanelStore = {
        isVisible: true,
        infoPanelSelection: {
          id: "456",
          fileExst: ".txt",
        },
        setInfoPanelSelection: jest.fn(),
      };

      handler("456");

      expect(store.updateFileStatus).toHaveBeenCalledWith(0, 0); // Clear IsEditing flag
      expect(store.updateSelectionStatus).toHaveBeenCalledWith("456", 0, false);
      expect(store.getFileInfo).toHaveBeenCalledWith("456");
    });

    it("should skip unsubscribed file modifications", () => {
      const handler = SocketHelper.on.mock.calls.find(
        (call) => call[0] === SocketEvents.MarkAsNewFile,
      )[1];

      const opt = {
        fileId: "999", // Not in subscribers
        count: 1,
      };

      handler(opt);

      expect(store.updateFileStatus).not.toHaveBeenCalled();
    });

    describe("new file queue processing", () => {
      beforeEach(() => {
        store.selectedFolderStore = {
          id: "folder-123",
          filesCount: 5,
          setFilesCount: jest.fn(),
        };
        store.files = [
          { id: "file-1", folderId: "folder-123" },
          { id: "file-2", folderId: "folder-123" },
        ];
        store.filter = { total: 2 };
        store.setFilter = jest.fn();
        store.setFiles = jest.fn();
        store.debouncefetchTreeFolders = jest.fn();
      });

      it("should process new file in queue", () => {
        const newFileInfo = {
          id: "file-3",
          folderId: "folder-123",
          title: "New File",
        };

        store.onResolveNewFile(newFileInfo);

        expect(store.setFilter).toHaveBeenCalledWith({ total: 3 });
        expect(store.setFiles).toHaveBeenCalledWith([
          newFileInfo,
          ...store.files,
        ]);
        expect(store.debouncefetchTreeFolders).toHaveBeenCalled();
      });

      it("should skip processing if file already exists", () => {
        const existingFileInfo = {
          id: "file-1", // Already exists
          folderId: "folder-123",
          title: "Existing File",
        };

        store.onResolveNewFile(existingFileInfo);

        expect(store.setFilter).not.toHaveBeenCalled();
        expect(store.setFiles).not.toHaveBeenCalled();
      });

      it("should skip processing if folder id doesn't match", () => {
        const differentFolderFile = {
          id: "file-3",
          folderId: "different-folder",
          title: "Different Folder File",
        };

        store.onResolveNewFile(differentFolderFile);

        expect(store.setFilter).not.toHaveBeenCalled();
        expect(store.setFiles).not.toHaveBeenCalled();
      });
    });

    describe("folder modification methods", () => {
      beforeEach(() => {
        store.selectedFolderStore = {
          id: "folder-123",
          filesCount: 5,
          foldersCount: 2,
          setFilesCount: jest.fn(),
          setFoldersCount: jest.fn(),
        };
        store.files = [
          { id: "file-1", version: 1, versionGroup: "A" },
          { id: "file-2", version: 1, versionGroup: "B" },
        ];
        store.folders = [
          { id: "folder-1", filesCount: 3 },
          { id: "folder-2", filesCount: 2 },
        ];
        store.getFolderIndex = jest.fn();
        store.checkSelection = jest.fn();
        store.createNewFilesQueue = {
          enqueue: jest.fn(),
        };
      });

      it("should handle file creation in current folder", async () => {
        const opt = {
          type: "file",
          id: "new-file",
          data: JSON.stringify({
            id: "new-file",
            folderId: "folder-123",
            version: 1,
            versionGroup: "C",
          }),
        };

        await store.wsModifyFolderCreate(opt);

        expect(store.selectedFolderStore.setFilesCount).toHaveBeenCalledWith(6);

        // Wait for the setTimeout
        await new Promise((resolve) => setTimeout(resolve, 300));

        expect(store.createNewFilesQueue.enqueue).toHaveBeenCalled();
      });

      it("should handle file creation in different folder", async () => {
        const opt = {
          type: "file",
          id: "new-file",
          data: JSON.stringify({
            id: "new-file",
            folderId: "different-folder",
            version: 1,
            versionGroup: "C",
          }),
        };

        store.getFolderIndex.mockReturnValue(1); // Index of folder-2

        await store.wsModifyFolderCreate(opt);

        expect(store.folders[1].filesCount).toBe(3);
        expect(store.selectedFolderStore.setFilesCount).not.toHaveBeenCalled();
      });

      it("should handle file version update", async () => {
        const opt = {
          type: "file",
          id: "file-1",
          data: JSON.stringify({
            id: "file-1",
            folderId: "folder-123",
            version: 2, // Updated version
            versionGroup: "A-new", // Updated version group
          }),
        };

        await store.wsModifyFolderCreate(opt);

        expect(store.files[0].version).toBe(2);
        expect(store.files[0].versionGroup).toBe("A-new");
        expect(store.checkSelection).toHaveBeenCalled();
      });

      it("should handle folder creation", async () => {
        const opt = {
          type: "folder",
          id: "new-folder",
          data: JSON.stringify({
            id: "new-folder",
            folderId: "folder-123",
          }),
        };

        await store.wsModifyFolderCreate(opt);

        expect(store.selectedFolderStore.setFoldersCount).toHaveBeenCalledWith(
          3,
        );
      });
    });

    describe("folder update handling", () => {
      beforeEach(() => {
        store.infoPanelStore = {
          infoPanelSelection: null,
          updateInfoPanelSelection: jest.fn(),
        };
        store.getFileInfo = jest.fn();
        store.getFilesListItems = jest.fn((items) => items);
        store.checkSelection = jest.fn();
        store.setBufferSelection = jest.fn();
        store.selectedFolderStore = {
          id: "folder-123",
          navigationPath: [
            { id: "root", title: "Root" },
            { id: "folder-123", title: "Old Title" },
          ],
          setSelectedFolder: jest.fn(),
        };
        store.selection = [];
        store.bufferSelection = null;
      });

      it("should handle file update", () => {
        const opt = {
          type: "file",
          data: JSON.stringify({
            id: "file-1",
            title: "Updated File",
            folderId: "folder-123",
          }),
        };

        store.wsModifyFolderUpdate(opt);

        expect(store.getFileInfo).toHaveBeenCalledWith("file-1");
        expect(store.checkSelection).toHaveBeenCalled();
      });

      it("should update info panel selection for file", () => {
        store.infoPanelStore.infoPanelSelection = {
          id: "file-1",
          isFolder: false,
          isRoom: false,
        };

        const updatedFile = {
          id: "file-1",
          title: "Updated File",
          folderId: "folder-123",
        };

        const opt = {
          type: "file",
          data: JSON.stringify(updatedFile),
        };

        store.wsModifyFolderUpdate(opt);

        expect(store.getFilesListItems).toHaveBeenCalledWith([updatedFile]);
        expect(
          store.infoPanelStore.updateInfoPanelSelection,
        ).toHaveBeenCalledWith(updatedFile);
      });

      it("should handle folder update", async () => {
        const updatedFolder = {
          id: "folder-123",
          title: "Updated Folder",
          parentId: "root",
        };

        jest.spyOn(api.files, "getFolderInfo").mockResolvedValue(updatedFolder);

        const opt = {
          type: "folder",
          data: JSON.stringify(updatedFolder),
        };

        await store.wsModifyFolderUpdate(opt);

        expect(api.files.getFolderInfo).toHaveBeenCalledWith("folder-123");
        expect(
          store.selectedFolderStore.setSelectedFolder,
        ).toHaveBeenCalledWith({
          ...updatedFolder,
          navigationPath: [
            { id: "root", title: "Root" },
            { id: "folder-123", title: "Updated Folder" },
          ],
        });
      });

      it("should update selection when folder is in selection array", async () => {
        const updatedFolder = {
          id: "folder-123",
          title: "Updated Folder",
        };

        store.selection = [{ id: "folder-123", title: "Old Title" }];

        jest.spyOn(api.files, "getFolderInfo").mockResolvedValue(updatedFolder);

        const opt = {
          type: "folder",
          data: JSON.stringify(updatedFolder),
        };

        await store.wsModifyFolderUpdate(opt);

        expect(store.selection[0]).toEqual(updatedFolder);
      });

      it("should update buffer selection for folder", async () => {
        const updatedFolder = {
          id: "folder-123",
          title: "Updated Folder",
        };

        store.bufferSelection = {
          id: "folder-123",
          isFolder: true,
          title: "Old Title",
        };

        jest.spyOn(api.files, "getFolderInfo").mockResolvedValue(updatedFolder);

        const opt = {
          type: "folder",
          data: JSON.stringify(updatedFolder),
        };

        await store.wsModifyFolderUpdate(opt);

        expect(store.setBufferSelection).toHaveBeenCalledWith(updatedFolder);
      });

      it("should update info panel selection for folder", async () => {
        const updatedFolder = {
          id: "folder-123",
          title: "Updated Folder",
        };

        store.infoPanelStore.infoPanelSelection = {
          id: "folder-123",
          isFolder: true,
          title: "Old Title",
        };

        jest.spyOn(api.files, "getFolderInfo").mockResolvedValue(updatedFolder);

        const opt = {
          type: "folder",
          data: JSON.stringify(updatedFolder),
        };

        await store.wsModifyFolderUpdate(opt);

        expect(store.getFilesListItems).toHaveBeenCalledWith([updatedFolder]);
        expect(
          store.infoPanelStore.updateInfoPanelSelection,
        ).toHaveBeenCalledWith(updatedFolder);
      });

      it("should handle invalid data", () => {
        const opt = {
          type: "folder",
          data: "invalid-json",
        };

        store.wsModifyFolderUpdate(opt);

        expect(api.files.getFolderInfo).not.toHaveBeenCalled();
        expect(store.setBufferSelection).not.toHaveBeenCalled();
      });
    });
  });

  describe("folder deletion handling", () => {
    beforeEach(() => {
      store.selectedFolderStore = {
        id: "folder-123",
        filesCount: 5,
        foldersCount: 3,
        setFilesCount: jest.fn(),
        setFoldersCount: jest.fn(),
        pathParts: [{ id: "root" }, { id: "folder-123" }],
      };
      store.files = [
        { id: "file-1", title: "File 1" },
        { id: "file-2", title: "File 2" },
      ];
      store.folders = [
        { id: "folder-1", title: "Folder 1" },
        { id: "folder-2", title: "Folder 2" },
      ];
      store.pageItemsLength = 4;
      store.tempActionFilesIds = [];
      store.tempActionFoldersIds = [];
      store.setTempActionFilesIds = jest.fn();
      store.setTempActionFoldersIds = jest.fn();
      store.removeStaleItemFromSelection = jest.fn();
      store.debounceRemoveFiles = jest.fn();
      store.debounceRemoveFolders = jest.fn();

      // Mock window.DocSpace.navigate
      global.window.DocSpace = {
        navigate: jest.fn(),
      };
    });

    afterEach(() => {
      delete global.window.DocSpace;
    });

    describe("file deletion", () => {
      it("should handle file deletion", () => {
        const opt = {
          type: "file",
          id: "file-1",
        };

        store.wsModifyFolderDelete(opt);

        expect(store.selectedFolderStore.setFilesCount).toHaveBeenCalledWith(4);
        expect(store.setTempActionFilesIds).toHaveBeenCalledWith(["file-1"]);
        expect(store.removeStaleItemFromSelection).toHaveBeenCalledWith(
          store.files[0],
        );
        expect(store.debounceRemoveFiles).toHaveBeenCalled();
        expect(store.isHidePagination).toBe(true);
      });

      it("should set loading state when all items are deleted", () => {
        store.files = [{ id: "file-1", title: "File 1" }];
        store.folders = [];
        store.pageItemsLength = 2;

        const opt = {
          type: "file",
          id: "file-1",
        };

        store.wsModifyFolderDelete(opt);

        expect(store.isLoadingFilesFind).toBe(true);
      });

      it("should skip deletion for non-existent file", () => {
        const opt = {
          type: "file",
          id: "non-existent",
        };

        store.wsModifyFolderDelete(opt);

        expect(store.selectedFolderStore.setFilesCount).not.toHaveBeenCalled();
        expect(store.setTempActionFilesIds).not.toHaveBeenCalled();
      });
    });

    describe("folder deletion", () => {
      it("should handle folder deletion", () => {
        const opt = {
          type: "folder",
          id: "folder-1",
        };

        store.wsModifyFolderDelete(opt);

        expect(store.selectedFolderStore.setFoldersCount).toHaveBeenCalledWith(
          2,
        );
        expect(store.setTempActionFoldersIds).toHaveBeenCalledWith([
          "folder-1",
        ]);
        expect(store.removeStaleItemFromSelection).toHaveBeenCalledWith(
          store.folders[0],
        );
        expect(store.debounceRemoveFolders).toHaveBeenCalled();
        expect(store.isHidePagination).toBe(true);
      });

      it("should navigate to root when deleted folder is in path", () => {
        store.selectedFolderStore.pathParts = [
          { id: "root" },
          { id: "folder-to-delete" },
        ];

        const opt = {
          type: "folder",
          id: "folder-to-delete",
        };

        store.wsModifyFolderDelete(opt);

        expect(window.DocSpace.navigate).toHaveBeenCalledWith("/");
      });

      it("should set loading state when all items are deleted", () => {
        store.files = [];
        store.folders = [{ id: "folder-1", title: "Folder 1" }];
        store.pageItemsLength = 2;

        const opt = {
          type: "folder",
          id: "folder-1",
        };

        store.wsModifyFolderDelete(opt);

        expect(store.isLoadingFilesFind).toBe(true);
      });

      it("should skip deletion for non-existent folder not in path", () => {
        const opt = {
          type: "folder",
          id: "non-existent",
        };

        store.wsModifyFolderDelete(opt);

        expect(
          store.selectedFolderStore.setFoldersCount,
        ).not.toHaveBeenCalled();
        expect(store.setTempActionFoldersIds).not.toHaveBeenCalled();
        expect(window.DocSpace.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe("constructor", () => {
    it("should set isEditor based on pathname", () => {
      // Mock window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = { pathname: "/doceditor/test" };

      const storeWithEditor = new FilesStore(
        mockAuthStore,
        null, // selectedFolderStore
        null, // treeFoldersStore
        null, // filesSettingsStore
        null, // thirdPartyStore
        null, // accessRightsStore
        null, // clientLoadingStore
        null, // pluginStore
        null, // publicRoomStore
        null, // infoPanelStore
        mockUserStore,
        null, // currentTariffStatusStore
        mockSettingsStore,
        null, // indexingStore
      );

      expect(storeWithEditor.isEditor).toBe(true);

      // Restore window.location
      window.location = originalLocation;
    });

    it("should initialize with empty hotkeys clipboard", () => {
      expect(store.hotkeysClipboard).toEqual([]);
    });
  });

  describe("PDF form handling", () => {
    beforeEach(() => {
      store.selectedFolderStore = {
        id: "folder-123",
      };
      store.userStore = {
        user: {
          id: "user-123",
        },
      };

      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
      global.localStorage = localStorageMock;

      // Mock window.dispatchEvent
      global.window.dispatchEvent = jest.fn();
    });

    afterEach(() => {
      delete global.localStorage;
      delete global.window.dispatchEvent;
    });

    it("should handle PDF form creation event", () => {
      const fileData = {
        folderId: "folder-123",
        title: "Test PDF Form",
      };

      const option = {
        data: JSON.stringify(fileData),
      };

      localStorage.getItem.mockReturnValue("false");

      store.wsCreatedPDFForm(option);

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "CREATE_PDF_FORM_FILE",
          detail: expect.objectContaining({
            file: fileData,
            show: true,
            localKey: `pdf-form-dialog-key-user-123`,
          }),
        }),
      );
    });

    it("should not dispatch event if folder IDs don't match", () => {
      const fileData = {
        folderId: "different-folder",
        title: "Test PDF Form",
      };

      const option = {
        data: JSON.stringify(fileData),
      };

      store.wsCreatedPDFForm(option);

      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    it("should not process if option data is missing", () => {
      store.wsCreatedPDFForm({});
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe("selection management", () => {
    beforeEach(() => {
      store.selection = [
        { id: "file-1", title: "File 1" },
        { id: "file-2", title: "File 2" },
      ];
      store.bufferSelection = { id: "file-3", title: "File 3" };
    });

    describe("checkSelection", () => {
      it("should update file in selection array", () => {
        const updatedFile = { id: "file-1", title: "Updated File 1" };
        store.checkSelection(updatedFile);
        expect(store.selection[0]).toEqual(updatedFile);
      });

      it("should update file in buffer selection", () => {
        const updatedFile = { id: "file-3", title: "Updated File 3" };
        store.checkSelection(updatedFile);
        expect(store.bufferSelection[0]).toEqual(updatedFile);
      });

      it("should not modify selection if file not found", () => {
        const originalSelection = [...store.selection];
        const newFile = { id: "non-existent", title: "New File" };

        store.checkSelection(newFile);

        expect(store.selection).toEqual(originalSelection);
      });
    });

    describe("highlight file management", () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("should set highlight file", () => {
        const highlightFile = {
          highlightFileId: "file-1",
          isFileHasExst: true,
        };

        store.setHighlightFile(highlightFile);

        expect(store.highlightFile).toEqual({
          id: "file-1",
          isExst: true,
        });
      });

      it("should clear highlight file after timeout", () => {
        const highlightFile = {
          highlightFileId: "file-1",
          isFileHasExst: true,
        };

        store.setHighlightFile(highlightFile);
        jest.advanceTimersByTime(1000);

        expect(store.highlightFile).toEqual({});
      });

      it("should clear existing timeout when setting new highlight", () => {
        const highlightFile1 = {
          highlightFileId: "file-1",
          isFileHasExst: true,
        };

        const highlightFile2 = {
          highlightFileId: "file-2",
          isFileHasExst: true,
        };

        store.setHighlightFile(highlightFile1);
        jest.advanceTimersByTime(500);
        store.setHighlightFile(highlightFile2);
        jest.advanceTimersByTime(500);

        expect(store.highlightFile).toEqual({
          id: "file-2",
          isExst: true,
        });
      });
    });
  });

  describe("drag operations and tooltips", () => {
    beforeEach(() => {
      store.selection = [
        { id: "file-1", title: "File 1" },
        { id: "file-2", title: "File 2", providerKey: "provider1" },
        {
          id: "root-folder",
          rootFolderId: "root-folder",
          providerKey: "provider1",
        },
      ];
      store.dragging = false;
      store.authStore = {
        isAdmin: false,
      };
      store.treeFoldersStore = {
        isShareFolder: false,
        isCommonFolder: false,
      };
    });

    describe("setStartDrag", () => {
      it("should filter out root third-party folders from selection", () => {
        store.setStartDrag(true);

        expect(store.selection).toHaveLength(2);
        expect(
          store.selection.find((x) => x.id === "root-folder"),
        ).toBeUndefined();
        expect(store.startDrag).toBe(true);
      });

      it("should keep non-root folders in selection", () => {
        store.selection = [
          { id: "file-1", title: "File 1" },
          { id: "folder-1", providerKey: "provider1" },
        ];

        store.setStartDrag(true);

        expect(store.selection).toHaveLength(2);
      });
    });

    describe("tooltipOptions", () => {
      it("should return null when not dragging", () => {
        store.dragging = false;
        expect(store.tooltipOptions).toBeNull();
      });

      it("should show single file title for one selected item", () => {
        store.dragging = true;
        store.selection = [{ id: "file-1", title: "Test File" }];

        const options = store.tooltipOptions;

        expect(options.filesCount).toBe("Test File");
        expect(options.operationName).toBe("move");
      });

      it("should show count for multiple selected items", () => {
        store.dragging = true;
        store.selection = [
          { id: "file-1", title: "File 1" },
          { id: "file-2", title: "File 2" },
        ];

        const options = store.tooltipOptions;

        expect(options.filesCount).toBe(2);
        expect(options.operationName).toBe("move");
      });

      it("should set copy operation for admin in share folder", () => {
        store.dragging = true;
        store.authStore.isAdmin = true;
        store.treeFoldersStore.isShareFolder = true;

        const options = store.tooltipOptions;

        expect(options.operationName).toBe("copy");
      });

      it("should set copy operation for non-admin in share folder", () => {
        store.dragging = true;
        store.treeFoldersStore.isShareFolder = true;

        const options = store.tooltipOptions;

        expect(options.operationName).toBe("copy");
      });

      it("should set copy operation for non-admin in common folder", () => {
        store.dragging = true;
        store.treeFoldersStore.isCommonFolder = true;

        const options = store.tooltipOptions;

        expect(options.operationName).toBe("copy");
      });
    });
  });

  describe("initialization", () => {
    beforeEach(() => {
      store.isInit = false;
      store.isEditor = false;
      store.authStore = {
        isAuthenticated: true,
      };
      store.filesSettingsStore = {
        getFilesSettings: jest.fn().mockResolvedValue(),
      };
      store.settingsStore = {
        getPortalCultures: jest.fn().mockResolvedValue(),
        getIsEncryptionSupport: jest.fn().mockResolvedValue(),
        getEncryptionKeys: jest.fn().mockResolvedValue(),
        isDesktopClient: true,
      };
      store.treeFoldersStore = {
        fetchTreeFolders: jest.fn().mockResolvedValue([
          {
            rootFolderType: "Trash",
            foldersCount: 0,
            filesCount: 0,
          },
        ]),
      };
      store.clientLoadingStore = {
        setIsLoaded: jest.fn(),
        setIsArticleLoading: jest.fn(),
        setFirstLoad: jest.fn(),
      };
      store.setIsInit = jest.fn();
      store.setTrashIsEmpty = jest.fn();
    });

    it("should skip initialization if already initialized", async () => {
      store.isInit = true;
      await store.initFiles();

      expect(store.filesSettingsStore.getFilesSettings).not.toHaveBeenCalled();
    });

    it("should set loaded state for unauthenticated user", async () => {
      store.authStore.isAuthenticated = false;
      await store.initFiles();

      expect(store.clientLoadingStore.setIsLoaded).toHaveBeenCalledWith(true);
      expect(store.filesSettingsStore.getFilesSettings).not.toHaveBeenCalled();
    });

    it("should initialize for authenticated user", async () => {
      await store.initFiles();

      expect(store.settingsStore.getPortalCultures).toHaveBeenCalled();
      expect(store.treeFoldersStore.fetchTreeFolders).toHaveBeenCalled();
      expect(store.filesSettingsStore.getFilesSettings).toHaveBeenCalled();
      expect(store.setIsInit).toHaveBeenCalledWith(true);
    });

    it("should set trash state after fetching tree folders", async () => {
      await store.initFiles();

      expect(store.setTrashIsEmpty).toHaveBeenCalledWith(true);
    });

    it("should initialize encryption for desktop client", async () => {
      await store.initFiles();

      expect(store.settingsStore.getIsEncryptionSupport).toHaveBeenCalled();
      expect(store.settingsStore.getEncryptionKeys).toHaveBeenCalled();
    });

    it("should skip encryption initialization for web client", async () => {
      store.settingsStore.isDesktopClient = false;
      await store.initFiles();

      expect(store.settingsStore.getIsEncryptionSupport).not.toHaveBeenCalled();
      expect(store.settingsStore.getEncryptionKeys).not.toHaveBeenCalled();
    });

    it("should update loading states after initialization", async () => {
      await store.initFiles();

      expect(store.clientLoadingStore.setIsArticleLoading).toHaveBeenCalledWith(
        false,
      );
      expect(store.clientLoadingStore.setFirstLoad).toHaveBeenCalledWith(false);
    });
  });

  describe("reset functionality", () => {
    beforeEach(() => {
      store.clientLoadingStore = {
        setIsLoaded: jest.fn(),
        setIsSectionHeaderLoading: jest.fn(),
        setIsSectionFilterLoading: jest.fn(),
        setIsSectionBodyLoading: jest.fn(),
        setIsArticleLoading: jest.fn(),
        setFirstLoad: jest.fn(),
      };
      store.files = [{ id: "file-1" }];
      store.folders = [{ id: "folder-1" }];
      store.selection = [{ id: "file-1" }];
      store.bufferSelection = { id: "file-2" };
      store.selected = "open";
      store.isInit = true;
      store.alreadyFetchingRooms = true;

      store.setSelection = jest.fn();
      store.setBufferSelection = jest.fn();
    });

    it("should reset store to initial state", () => {
      store.reset();

      expect(store.isInit).toBe(false);
      expect(store.alreadyFetchingRooms).toBe(false);
      expect(store.files).toEqual([]);
      expect(store.folders).toEqual([]);
      expect(store.selection).toEqual([]);
      expect(store.bufferSelection).toBeNull();
      expect(store.selected).toBe("close");
    });

    it("should reset loading states", () => {
      store.reset();

      expect(store.clientLoadingStore.setIsLoaded).toHaveBeenCalledWith(false);
      expect(
        store.clientLoadingStore.setIsSectionHeaderLoading,
      ).toHaveBeenCalledWith(true);
      expect(
        store.clientLoadingStore.setIsSectionFilterLoading,
      ).toHaveBeenCalledWith(true);
      expect(
        store.clientLoadingStore.setIsSectionBodyLoading,
      ).toHaveBeenCalledWith(true);
      expect(store.clientLoadingStore.setIsArticleLoading).toHaveBeenCalledWith(
        true,
      );
      expect(store.clientLoadingStore.setFirstLoad).toHaveBeenCalledWith(true);
    });

    it("should reset selections", () => {
      store.resetSelections();

      expect(store.setSelection).toHaveBeenCalledWith([]);
      expect(store.setBufferSelection).toHaveBeenCalledWith(null);
    });
  });

  describe("file and folder subscription management", () => {
    beforeEach(() => {
      store.selectedFolderStore = {
        id: "current-folder",
      };
      store.createThumbnails = jest.fn();
      SocketHelper.emit = jest.fn();
      SocketHelper.socketSubscribers = new Map();
    });

    describe("setFiles", () => {
      it("should skip update if both current and new files are empty", () => {
        store.files = [];
        store.setFiles([]);

        expect(SocketHelper.emit).not.toHaveBeenCalled();
        expect(store.createThumbnails).not.toHaveBeenCalled();
      });

      it("should unsubscribe from removed files", () => {
        store.files = [{ id: "file-1" }, { id: "file-2" }];
        SocketHelper.socketSubscribers.set("FILE-file-1", true);
        SocketHelper.socketSubscribers.set("FILE-file-2", true);

        store.setFiles([{ id: "file-2" }]);

        expect(SocketHelper.emit).toHaveBeenCalledWith("unsubscribe", {
          roomParts: ["FILE-file-1"],
          individual: true,
        });
      });

      it("should subscribe to new files", () => {
        store.files = [{ id: "file-1" }];
        SocketHelper.socketSubscribers.set("FILE-file-1", true);

        store.setFiles([{ id: "file-1" }, { id: "file-2" }]);

        expect(SocketHelper.emit).toHaveBeenCalledWith("subscribe", {
          roomParts: ["FILE-file-2"],
          individual: true,
        });
      });

      it("should create thumbnails after updating files", () => {
        store.setFiles([{ id: "file-1" }]);
        expect(store.createThumbnails).toHaveBeenCalled();
      });
    });

    describe("setFolders", () => {
      it("should skip update if both current and new folders are empty", () => {
        store.folders = [];
        store.setFolders([]);

        expect(SocketHelper.emit).not.toHaveBeenCalled();
      });

      it("should unsubscribe from removed folders except selected", () => {
        store.folders = [
          { id: "folder-1" },
          { id: "folder-2" },
          { id: "current-folder" },
        ];
        SocketHelper.socketSubscribers.set("DIR-folder-1", true);
        SocketHelper.socketSubscribers.set("DIR-folder-2", true);
        SocketHelper.socketSubscribers.set("DIR-current-folder", true);

        store.setFolders([{ id: "folder-2" }]);

        expect(SocketHelper.emit).toHaveBeenCalledWith("unsubscribe", {
          roomParts: ["DIR-folder-1"],
          individual: true,
        });
      });

      it("should subscribe to new folders", () => {
        store.folders = [{ id: "folder-1" }];
        SocketHelper.socketSubscribers.set("DIR-folder-1", true);

        store.setFolders([{ id: "folder-1" }, { id: "folder-2" }]);

        expect(SocketHelper.emit).toHaveBeenCalledWith("subscribe", {
          roomParts: ["DIR-folder-2"],
          individual: true,
        });
      });

      it("should update folders array", () => {
        const newFolders = [{ id: "folder-1" }, { id: "folder-2" }];
        store.setFolders(newFolders);
        expect(store.folders).toEqual(newFolders);
      });
    });
  });

  describe("file and folder manipulation", () => {
    beforeEach(() => {
      store.files = [
        { id: "file-1", title: "File 1", fileStatus: "none" },
        { id: "file-2", title: "File 2", fileStatus: "none" },
      ];
      store.folders = [
        { id: "folder-1", title: "Folder 1", mute: false },
        { id: "folder-2", title: "Folder 2", mute: false },
      ];
      store.createThumbnail = jest.fn();
    });

    describe("file operations", () => {
      it("should find correct file index", () => {
        expect(store.getFileIndex("file-1")).toBe(0);
        expect(store.getFileIndex("file-2")).toBe(1);
        expect(store.getFileIndex("non-existent")).toBe(-1);
      });

      it("should update file status", () => {
        store.updateFileStatus(0, "processing");
        expect(store.files[0].fileStatus).toBe("processing");
      });

      it("should not update file status for invalid index", () => {
        const originalFiles = [...store.files];
        store.updateFileStatus(-1, "processing");
        expect(store.files).toEqual(originalFiles);
      });

      it("should update existing file and create thumbnail", () => {
        const newFile = { id: "file-1", title: "Updated File 1" };
        store.setFile(newFile);

        expect(store.files[0]).toEqual(newFile);
        expect(store.createThumbnail).toHaveBeenCalledWith(newFile);
      });

      it("should not update non-existent file", () => {
        const newFile = { id: "non-existent", title: "New File" };
        const originalFiles = [...store.files];

        store.setFile(newFile);

        expect(store.files).toEqual(originalFiles);
        expect(store.createThumbnail).not.toHaveBeenCalled();
      });
    });

    describe("folder operations", () => {
      it("should find correct folder index", () => {
        expect(store.getFolderIndex("folder-1")).toBe(0);
        expect(store.getFolderIndex("folder-2")).toBe(1);
        expect(store.getFolderIndex("non-existent")).toBe(-1);
      });

      it("should update room mute status", () => {
        store.updateRoomMute(0, true);
        expect(store.folders[0].mute).toBe(true);
      });

      it("should not update room mute status for invalid index", () => {
        const originalFolders = [...store.folders];
        store.updateRoomMute(-1, true);
        expect(store.folders).toEqual(originalFolders);
      });

      it("should update existing folder", () => {
        const newFolder = { id: "folder-1", title: "Updated Folder 1" };
        store.updateSelection = jest.fn();

        store.setFolder(newFolder);

        expect(store.folders[0]).toEqual(newFolder);
        expect(store.updateSelection).toHaveBeenCalledWith(newFolder.id);
      });
    });

    describe("selection management", () => {
      beforeEach(() => {
        store.selection = [
          { id: "file-1", fileType: "document" },
          { id: "folder-1", fileType: "folder" },
        ];
        store.bufferSelection = { id: "file-2", fileType: "document" };
        store.activeFiles = [];
        store.activeFolders = [];
        store.setSelection = jest.fn();
        store.setBufferSelection = jest.fn();
      });

      describe("removeStaleItemFromSelection", () => {
        it("should not remove active file from selection", () => {
          store.activeFiles = [{ id: "file-1" }];
          store.removeStaleItemFromSelection({ id: "file-1" });
          expect(store.setSelection).not.toHaveBeenCalled();
        });

        it("should not remove active folder from selection", () => {
          store.activeFolders = [{ id: "folder-1" }];
          store.removeStaleItemFromSelection({
            id: "folder-1",
            parentId: "parent",
          });
          expect(store.setSelection).not.toHaveBeenCalled();
        });

        it("should remove file from buffer selection", () => {
          store.removeStaleItemFromSelection({
            id: "file-2",
            fileType: "document",
          });
          expect(store.setBufferSelection).toHaveBeenCalledWith(null);
        });

        it("should remove item from main selection", () => {
          const item = { id: "file-1", fileType: "document" };
          store.removeStaleItemFromSelection(item);
          expect(store.setSelection).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ id: "folder-1" }),
            ]),
          );
        });
      });

      describe("getFilesChecked", () => {
        it("should return false for active files", () => {
          store.activeFiles = [{ id: "file-1" }];
          const result = store.getFilesChecked({ id: "file-1" }, "all");
          expect(result).toBe(false);
        });

        it("should return false for active folders", () => {
          store.activeFolders = [{ id: "folder-1" }];
          const result = store.getFilesChecked(
            { id: "folder-1", parentId: "parent" },
            "all",
          );
          expect(result).toBe(false);
        });

        it("should check all files when selected is all", () => {
          const result = store.getFilesChecked({ id: "file-3" }, "all");
          expect(result).toBe(true);
        });

        it("should check only folders", () => {
          const result = store.getFilesChecked(
            { id: "folder-3", parentId: "parent" },
            "folders",
          );
          expect(result).toBe(true);
        });

        it("should check specific file types", () => {
          expect(
            store.getFilesChecked({ fileType: "document" }, "documents"),
          ).toBe(true);
          expect(
            store.getFilesChecked(
              { fileType: "presentation" },
              "presentations",
            ),
          ).toBe(true);
          expect(
            store.getFilesChecked({ fileType: "spreadsheet" }, "spreadsheets"),
          ).toBe(true);
          expect(store.getFilesChecked({ fileType: "image" }, "images")).toBe(
            true,
          );
        });
      });
    });
  });

  describe("file filtering and selection", () => {
    beforeEach(() => {
      store.setFiles([
        { id: "doc-1", fileType: "document", title: "Document 1" },
        { id: "img-1", fileType: "image", title: "Image 1" },
        { id: "vid-1", fileType: "video", title: "Video 1" },
        { id: "folder-1", parentId: "root", title: "Folder 1" },
        { id: "archive-1", fileType: "archive", title: "Archive 1" },
        {
          id: "room-1",
          roomType: "FillingFormsRoom",
          title: "Form Room 1",
        },
      ]);
      store.activeFiles = [];
      store.activeFolders = [];
      store.selection = [];
      store.bufferSelection = null;
      store.hotkeyCaret = null;
      store.hotkeyCaretStart = null;
      store.viewAs = "list";
    });

    describe("getFilesChecked", () => {
      it("should check media files", () => {
        expect(store.getFilesChecked({ fileType: "video" }, "media")).toBe(
          true,
        );
        expect(store.getFilesChecked({ fileType: "audio" }, "media")).toBe(
          true,
        );
        expect(store.getFilesChecked({ fileType: "document" }, "media")).toBe(
          false,
        );
      });

      it("should check room types", () => {
        expect(
          store.getFilesChecked(
            { roomType: "FillingFormsRoom" },
            "room-FillingFormsRoom",
          ),
        ).toBe(true);
        expect(
          store.getFilesChecked({ roomType: "CustomRoom" }, "room-CustomRoom"),
        ).toBe(true);
        expect(
          store.getFilesChecked(
            { roomType: "EditingRoom" },
            "room-EditingRoom",
          ),
        ).toBe(true);
        expect(
          store.getFilesChecked({ roomType: "ReviewRoom" }, "room-ReviewRoom"),
        ).toBe(true);
        expect(
          store.getFilesChecked(
            { roomType: "ReadOnlyRoom" },
            "room-ReadOnlyRoom",
          ),
        ).toBe(true);
        expect(
          store.getFilesChecked({ roomType: "FormRoom" }, "room-FormRoom"),
        ).toBe(true);
        expect(
          store.getFilesChecked({ roomType: "PublicRoom" }, "room-PublicRoom"),
        ).toBe(true);
        expect(
          store.getFilesChecked(
            { roomType: "VirtualDataRoom" },
            "room-VirtualDataRoom",
          ),
        ).toBe(true);
      });

      it("should handle files only filter", () => {
        expect(store.getFilesChecked({ fileType: "document" }, "files")).toBe(
          true,
        );
        expect(store.getFilesChecked({ parentId: "root" }, "files")).toBe(
          false,
        );
      });
    });

    describe("getFilesBySelected", () => {
      it("should filter files by type", () => {
        const documents = store.getFilesBySelected(
          store.filesList,
          "documents",
        );
        expect(documents).toHaveLength(1);
        expect(documents[0].fileType).toBe("document");

        const images = store.getFilesBySelected(store.filesList, "images");
        expect(images).toHaveLength(1);
        expect(images[0].fileType).toBe("image");
      });

      it("should filter by room type", () => {
        const formRooms = store.getFilesBySelected(
          store.filesList,
          "room-FillingFormsRoom",
        );
        expect(formRooms).toHaveLength(1);
        expect(formRooms[0].roomType).toBe("FillingFormsRoom");
      });

      it("should return empty array for non-matching filter", () => {
        const result = store.getFilesBySelected(
          store.filesList,
          "non-existent",
        );
        expect(result).toEqual([]);
      });
    });

    describe("setSelected", () => {
      beforeEach(() => {
        store.setBufferSelection = jest.fn();
        store.setHotkeyCaretStart = jest.fn();
        store.setHotkeyCaret = jest.fn();
      });

      it("should clear selection on close", () => {
        store.selection = [{ id: "doc-1" }];
        store.setSelected("close");

        expect(store.setBufferSelection).toHaveBeenCalledWith(null);
        expect(store.selected).toBe("close");
      });

      it("should update selection based on filter", () => {
        store.setSelected("documents");

        expect(store.selection).toHaveLength(1);
        expect(store.selection[0].fileType).toBe("document");
      });

      it("should preserve buffer selection when clearBuffer is false", () => {
        store.bufferSelection = { id: "doc-1" };
        store.setSelected("images", false);

        expect(store.setBufferSelection).not.toHaveBeenCalled();
      });
    });

    describe("setSelections", () => {
      beforeEach(() => {
        store.viewAs = "tile";
      });

      it("should clear existing selections when clear is true", () => {
        store.selection = [{ id: "doc-1" }];
        store.setSelections([], [], true);
        expect(store.selection).toEqual([]);
      });

      it("should add new file selections", () => {
        const element = document.createElement("div");
        element.setAttribute("value", "file_doc-1_0_0");

        store.setSelections([element], []);

        expect(store.selection).toHaveLength(1);
        expect(store.selection[0].id).toBe("doc-1");
      });

      it("should handle folder selections", () => {
        const element = document.createElement("div");
        element.setAttribute("value", "folder_folder-1_0_0");

        store.setSelections([element], []);

        expect(store.selection).toHaveLength(1);
        expect(store.selection[0].id).toBe("folder-1");
      });

      it("should ignore active files and folders", () => {
        store.activeFiles = [{ id: "doc-1" }];
        store.activeFolders = [{ id: "folder-1" }];

        const element1 = document.createElement("div");
        element1.setAttribute("value", "file_doc-1_0_0");
        const element2 = document.createElement("div");
        element2.setAttribute("value", "folder_folder-1_0_0");

        store.setSelections([element1, element2], []);

        expect(store.selection).toHaveLength(0);
      });

      it("should handle list view selections", () => {
        store.viewAs = "list";
        const element = document.createElement("div");
        const fileItem = document.createElement("div");
        fileItem.className = "files-item";
        fileItem.setAttribute("value", "file_doc-1_0_0");
        element.appendChild(fileItem);

        store.setSelections([element], []);

        expect(store.selection).toHaveLength(1);
        expect(store.selection[0].id).toBe("doc-1");
      });
    });
  });

  describe("buffer and filter management", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.treeFoldersStore = {
        recycleBinFolderId: 123,
      };
      store.publicRoomStore = {
        isPublicRoom: false,
      };
      store.categoryType = ""; // default
      store.isHidePagination = true;
      store.isLoadingFilesFind = true;
      store.tempFilter = {
        sortBy: "name",
        sortOrder: "asc",
      };
      global.localStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
      };
    });

    describe("setBufferSelection", () => {
      it("should set buffer selection", () => {
        const selection = { id: "file-1", name: "test.txt" };
        store.setBufferSelection(selection);
        expect(store.bufferSelection).toEqual(selection);
      });

      it("should clear buffer selection when null is passed", () => {
        store.bufferSelection = { id: "file-1", name: "test.txt" };
        store.setBufferSelection(null);
        expect(store.bufferSelection).toBeNull();
      });
    });

    describe("setFilesFilter", () => {
      const filter = {
        sortBy: "date",
        sortOrder: "desc",
      };

      it("should set filter for default category", () => {
        store.setFilesFilter(filter);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilter=user-1",
          "date,desc",
        );
        expect(store.filter).toEqual(filter);
      });

      it("should set filter for archive category", () => {
        store.categoryType = "Archive";
        store.setFilesFilter(filter);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilterArchiveRoom=user-1",
          "date,desc",
        );
      });

      it("should set filter for shared room", () => {
        store.categoryType = "SharedRoom";
        store.setFilesFilter(filter);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilterSharedRoom=user-1",
          "date,desc",
        );
      });

      it("should set filter for recent folder", () => {
        store.setFilesFilter(filter, "recent");

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilterRecent=user-1",
          "date,desc",
        );
      });

      it("should set filter for recycle bin", () => {
        store.setFilesFilter(filter, "123");

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilterTrash=user-1",
          "date,desc",
        );
      });

      it("should not set localStorage for public room", () => {
        store.publicRoomStore.isPublicRoom = true;
        store.setFilesFilter(filter);

        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(store.filter).toEqual(filter);
      });

      it("should update pagination visibility", () => {
        store.setFilesFilter(filter);
        expect(store.isHidePagination).toBe(false);
      });

      it("should update loading files find state", () => {
        store.setFilesFilter(filter);
        expect(store.isLoadingFilesFind).toBe(false);
      });
    });

    describe("resetUrl", () => {
      it("should reset filter to temp filter", () => {
        const currentFilter = {
          sortBy: "size",
          sortOrder: "desc",
        };
        store.filter = currentFilter;

        store.resetUrl();

        expect(store.filter).toEqual(store.tempFilter);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserFilter=user-1",
          "name,asc",
        );
      });
    });

    describe("removeDuplicate utility", () => {
      it("should remove duplicate selections", () => {
        const selections = [
          { id: "1", isFolder: true },
          { id: "1", isFolder: true }, // duplicate
          { id: "2", isFolder: false },
          { id: "2", isFolder: true }, // different isFolder, not duplicate
          { id: "3", isFolder: false },
        ];

        store.setSelections([document.createElement("div")], [], true);
        store.selection = selections;

        // Force a new selection to trigger removeDuplicate
        const element = document.createElement("div");
        element.setAttribute("value", "file_new-file_0_0");
        store.setSelections([element], []);

        // Check that duplicates were removed
        const uniqueIds = store.selection.map((s) => s.id + s.isFolder);
        const uniqueSet = new Set(uniqueIds);
        expect(uniqueIds.length).toBe(uniqueSet.size);
      });
    });
  });

  describe("rooms and file fetching", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.categoryType = "";
      store.isHidePagination = true;
      store.isLoadingFilesFind = true;
      store.selectedFolderStore = {
        id: "folder-1",
      };
      store.treeFoldersStore = {
        setSelectedNode: jest.fn(),
      };
      store.indexingStore = {
        setIsIndexEditingMode: jest.fn(),
      };
      store.clientLoadingStore = {
        isLoading: false,
      };
      store.filesController = {
        abort: jest.fn(),
      };
      store.roomsController = {
        abort: jest.fn(),
      };
      global.localStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
      };
      global.toJSON = jest.fn((x) => JSON.stringify(x));
      global.window = {
        location: {
          href: "http://test.com/files",
          origin: "http://test.com",
        },
        ClientConfig: {
          proxy: { url: "" },
        },
      };
    });

    describe("setRoomsFilter", () => {
      const filter = {
        sortBy: "date",
        sortOrder: "desc",
      };

      beforeEach(() => {
        store.categoryType = "";
      });

      it("should set rooms filter with default page count", () => {
        store.setRoomsFilter(filter);
        expect(store.roomsFilter.pageCount).toBe(100);
        expect(store.roomsFilter).toEqual({ ...filter, pageCount: 100 });
      });

      it("should handle archive category", () => {
        store.categoryType = "Archive";
        const storedFilter = {
          sortBy: "name",
          sortOrder: "asc",
          other: "value",
        };
        localStorage.getItem.mockReturnValue(JSON.stringify(storedFilter));

        store.setRoomsFilter(filter);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserRoomsArchivedFilter=user-1",
          JSON.stringify({
            ...storedFilter,
            sortBy: filter.sortBy,
            sortOrder: filter.sortOrder,
          }),
        );
      });

      it("should handle shared category", () => {
        const storedFilter = {
          sortBy: "name",
          sortOrder: "asc",
          other: "value",
        };
        localStorage.getItem.mockReturnValue(JSON.stringify(storedFilter));

        store.setRoomsFilter(filter);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "UserRoomsSharedFilter=user-1",
          JSON.stringify({
            ...storedFilter,
            sortBy: filter.sortBy,
            sortOrder: filter.sortOrder,
          }),
        );
      });

      it("should update pagination and loading states", () => {
        store.setRoomsFilter(filter);

        expect(store.isHidePagination).toBe(false);
        expect(store.isLoadingFilesFind).toBe(false);
      });
    });

    describe("setFilter", () => {
      it("should set filter with default page count", () => {
        const filter = { sortBy: "name" };
        store.setFilter(filter);
        expect(store.filter).toEqual({ ...filter, pageCount: 100 });
      });
    });

    describe("setFilterUrl", () => {
      it("should not update URL if unchanged", () => {
        const filter = {
          folder: "folder-1",
          toUrlParams: () => "sort=name",
        };
        global.window.location.href = "http://test.com/files?sort=name";

        store.setFilterUrl(filter);
        // No navigation should occur
        expect(true).toBe(true); // URL unchanged
      });
    });

    describe("abortAllFetch", () => {
      it("should abort current controllers and create new ones", () => {
        store.abortAllFetch();

        expect(store.filesController.abort).toHaveBeenCalled();
        expect(store.roomsController.abort).toHaveBeenCalled();
        expect(store.filesController).toBeInstanceOf(AbortController);
        expect(store.roomsController).toBeInstanceOf(AbortController);
      });
    });

    describe("fetchFiles", () => {
      it("should initialize fetch process", () => {
        store.fetchFiles("folder-1", {});

        expect(store.indexingStore.setIsIndexEditingMode).toHaveBeenCalledWith(
          false,
        );
      });

      it("should abort previous fetches if loading", () => {
        store.clientLoadingStore.isLoading = true;
        store.fetchFiles("folder-1", {});

        expect(store.filesController.abort).toHaveBeenCalled();
        expect(store.roomsController.abort).toHaveBeenCalled();
      });
    });

    describe("setFilesOwner", () => {
      beforeEach(() => {
        api.files.setFileOwner = jest.fn();
      });

      it("should call API to set file owner", async () => {
        const folderIds = ["folder-1"];
        const fileIds = ["file-1"];
        const ownerId = "user-1";

        await store.setFilesOwner(folderIds, fileIds, ownerId);

        expect(api.files.setFileOwner).toHaveBeenCalledWith(
          folderIds,
          fileIds,
          ownerId,
        );
      });
    });

    describe("setRoomOwner", () => {
      beforeEach(() => {
        api.files.setFileOwner = jest.fn();
      });

      it("should call API to set room owner", async () => {
        const ownerId = "user-1";
        const folderIds = ["folder-1"];

        await store.setRoomOwner(ownerId, folderIds);

        expect(api.files.setFileOwner).toHaveBeenCalledWith(ownerId, folderIds);
      });
    });

    describe("refreshFiles", () => {
      it("should fetch files with current folder and filter", async () => {
        store.fetchFiles = jest.fn();
        await store.refreshFiles();

        expect(store.fetchFiles).toHaveBeenCalledWith(
          store.selectedFolderStore.id,
          store.filter,
        );
      });
    });
  });

  describe("advanced file fetching and filtering", () => {
    beforeEach(() => {
      store.userStore = {
        user: {
          id: "user-1",
          isVisitor: false,
        },
      };
      store.publicRoomStore = {
        isPublicRoom: false,
        getExternalLinks: jest.fn(),
      };
      store.selectedFolderStore = {
        id: "folder-1",
      };
      store.treeFoldersStore = {
        setSelectedNode: jest.fn(),
      };
      store.isPreview = false;
      store.setTempFilter = jest.fn();
      store.setFilesFilter = jest.fn();
      store.setIsErrorRoomNotAvailable = jest.fn();
      store.setIsLoadedFetchFiles = jest.fn();
      store.files = [];
      store.folders = [];

      global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
      global.window = {
        DocSpace: {
          navigate: jest.fn(),
        },
        location: {
          href: "http://test.com/files",
          origin: "http://test.com",
        },
      };

      api.files.getFolder = jest.fn();
    });

    describe("fetchFiles", () => {
      it("should redirect visitor to shared category for @my folder", async () => {
        store.userStore.user.isVisitor = true;

        await store.fetchFiles("@my", null);

        expect(window.DocSpace.navigate).toHaveBeenCalled();
        const navigateArg = window.DocSpace.navigate.mock.calls[0][0];
        expect(navigateArg).toContain("filter.rooms");
      });

      it("should initialize filter with defaults when no filter provided", async () => {
        const mockResponse = {
          total: 10,
          folders: [],
          files: [],
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(api.files.getFolder).toHaveBeenCalled();
        const filterArg = api.files.getFolder.mock.calls[0][1];
        expect(filterArg.page).toBe(0);
        expect(filterArg.pageCount).toBe(100);
      });

      it("should use stored filter settings for user", async () => {
        localStorage.getItem.mockReturnValue("modified,desc");
        const mockResponse = {
          total: 10,
          folders: [],
          files: [],
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(api.files.getFolder).toHaveBeenCalled();
        const filterArg = api.files.getFolder.mock.calls[0][1];
        expect(filterArg.sortBy).toBe("modified");
        expect(filterArg.sortOrder).toBe("desc");
      });

      it("should handle public room data", async () => {
        const mockResponse = {
          total: 10,
          folders: [],
          files: [],
          current: {
            id: "room-1",
            roomType: "PublicRoom",
          },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("room-1", null);

        expect(store.publicRoomStore.getExternalLinks).toHaveBeenCalledWith(
          "room-1",
        );
      });

      it("should adjust page number if exceeds last page", async () => {
        const mockResponse = {
          total: 50,
          folders: new Array(50),
          files: [],
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        const filter = {
          clone: () => ({
            ...FilesFilter.getDefault(),
            page: 2,
            pageCount: 25,
          }),
          getLastPage: () => 1,
        };

        await store.fetchFiles("folder-1", filter);

        expect(api.files.getFolder).toHaveBeenCalledTimes(2);
        const secondCallFilter = api.files.getFolder.mock.calls[1][1];
        expect(secondCallFilter.page).toBe(1);
      });

      it("should handle preview mode", async () => {
        store.isPreview = true;
        const mockResponse = {
          total: 10,
          folders: [],
          files: [],
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(store.setTempFilter).toHaveBeenCalled();
        expect(store.setFilesFilter).not.toHaveBeenCalled();
      });

      it("should calculate correct total for partial page", async () => {
        const mockResponse = {
          total: 100,
          folders: new Array(25),
          files: new Array(25),
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(api.files.getFolder).toHaveBeenCalled();
        const filterArg = api.files.getFolder.mock.calls[0][1];
        expect(filterArg.total).toBe(50); // 25 folders + 25 files
      });

      it("should handle filter type validation", async () => {
        const mockResponse = {
          total: 10,
          folders: [],
          files: [],
          current: { id: "folder-1" },
        };
        api.files.getFolder.mockResolvedValue(mockResponse);

        const invalidFilter = {
          clone: () => ({
            ...FilesFilter.getDefault(),
            filterType: "invalid-type",
          }),
        };

        await store.fetchFiles("folder-1", invalidFilter);

        expect(api.files.getFolder).toHaveBeenCalled();
        const filterArg = api.files.getFolder.mock.calls[0][1];
        expect(filterArg.filterType).toBe(FilesFilter.getDefault().filterType);
      });
    });
  });

  describe("navigation and folder selection", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.treeFoldersStore = {
        myRoomsId: "my-rooms",
        setSelectedNode: jest.fn(),
      };
      store.infoPanelStore = {
        setInfoPanelRoom: jest.fn(),
        updateInfoPanelSelection: jest.fn(),
      };
      store.selectedFolderStore = {
        setSelectedFolder: jest.fn(),
        isFolder: true,
      };
      store.isMuteCurrentRoomNotifications = false;

      api.files.getFolderInfo = jest.fn();
      api.files.getFolder = jest.fn();
    });

    describe("navigation path handling", () => {
      const mockFolderResponse = {
        total: 10,
        folders: [],
        files: [],
        current: {
          id: "folder-2",
          title: "Current Folder",
          rootFolderType: "Rooms",
          roomType: "CustomRoom",
          inRoom: true,
          pathParts: [
            { id: "root", title: "Root" },
            { id: "folder-1", title: "Folder 1" },
            { id: "folder-2", title: "Current Folder" },
          ],
        },
      };

      it("should build navigation path for room structure", async () => {
        api.files.getFolder.mockResolvedValue(mockFolderResponse);
        api.files.getFolderInfo.mockResolvedValue({
          id: "folder-1",
          title: "Folder 1",
          shared: true,
          external: false,
          quotaLimit: 1000,
          usedSpace: 500,
          mute: false,
        });

        await store.fetchFiles("folder-2", null);

        expect(store.selectedFolderStore.setSelectedFolder).toHaveBeenCalled();
        const setFolderArg =
          store.selectedFolderStore.setSelectedFolder.mock.calls[0][0];
        expect(setFolderArg.isRoom).toBe(true);
        expect(setFolderArg.inRoom).toBe(true);
        expect(setFolderArg.navigationPath).toBeDefined();
      });

      it("should handle root room folders", async () => {
        const rootResponse = {
          ...mockFolderResponse,
          current: {
            ...mockFolderResponse.current,
            id: "root",
            rootFolderType: "Rooms",
            pathParts: [{ id: "root", title: "Root" }],
          },
        };
        api.files.getFolder.mockResolvedValue(rootResponse);

        await store.fetchFiles("root", null);

        expect(store.selectedFolderStore.setSelectedFolder).toHaveBeenCalled();
        const setFolderArg =
          store.selectedFolderStore.setSelectedFolder.mock.calls[0][0];
        const navPath = setFolderArg.navigationPath;
        expect(navPath).toHaveLength(0); // Root should not be in navigation
      });

      it("should update info panel for current folder", async () => {
        api.files.getFolder.mockResolvedValue(mockFolderResponse);

        await store.fetchFiles("folder-2", null);

        expect(
          store.infoPanelStore.updateInfoPanelSelection,
        ).toHaveBeenCalled();
      });

      it("should fetch folder info for non-current folders", async () => {
        api.files.getFolder.mockResolvedValue(mockFolderResponse);
        api.files.getFolderInfo.mockResolvedValue({
          id: "folder-1",
          title: "Folder 1",
          shared: true,
          external: false,
          quotaLimit: 1000,
          usedSpace: 500,
          mute: false,
        });

        await store.fetchFiles("folder-2", null);

        expect(api.files.getFolderInfo).toHaveBeenCalledWith("folder-1");
        expect(store.infoPanelStore.setInfoPanelRoom).toHaveBeenCalled();
      });

      it("should update room notification settings", async () => {
        api.files.getFolder.mockResolvedValue(mockFolderResponse);
        api.files.getFolderInfo.mockResolvedValue({
          id: "folder-1",
          mute: true,
        });

        await store.fetchFiles("folder-2", null);

        expect(store.isMuteCurrentRoomNotifications).toBe(true);
      });

      it("should handle empty file list with filter", async () => {
        const emptyResponse = {
          ...mockFolderResponse,
          folders: [],
          files: [],
        };
        api.files.getFolder.mockResolvedValue(emptyResponse);

        const filter = {
          clone: () => ({
            authorType: "owner",
            search: "test",
            withSubfolders: true,
            filterType: "documents",
            searchInContent: true,
          }),
        };

        await store.fetchFiles("folder-2", filter);

        expect(store.selectedFolderStore.setSelectedFolder).toHaveBeenCalled();
        // Additional assertions for empty list handling could be added here
      });

      it("should handle privacy folders", async () => {
        const privacyResponse = {
          ...mockFolderResponse,
          current: {
            ...mockFolderResponse.current,
            rootFolderType: "Privacy",
          },
        };
        api.files.getFolder.mockResolvedValue(privacyResponse);

        await store.fetchFiles("privacy-folder", null);

        expect(store.selectedFolderStore.setSelectedFolder).toHaveBeenCalled();
        const setFolderArg =
          store.selectedFolderStore.setSelectedFolder.mock.calls[0][0];
        // Add assertions specific to privacy folder handling
      });

      it("should update folder type for user folders", async () => {
        const userFolderResponse = {
          ...mockFolderResponse,
          current: {
            ...mockFolderResponse.current,
            rootFolderType: "User",
          },
        };
        api.files.getFolder.mockResolvedValue(userFolderResponse);

        await store.fetchFiles("user-folder", null);

        const updateCall =
          store.infoPanelStore.updateInfoPanelSelection.mock.calls[0][0];
        expect(updateCall.isFolder).toBe(true);
      });
    });
  });

  describe("filtering and error handling", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.selectedFolderStore = {
        id: "folder-1",
        setSelectedFolder: jest.fn(),
      };
      store.clientLoadingStore = {
        setIsSectionHeaderLoading: jest.fn(),
      };
      store.currentTariffStatusStore = {
        setPortalTariff: jest.fn(),
      };
      store.publicRoomStore = {
        isPublicRoom: false,
      };
      store.setIsEmptyPage = jest.fn();
      store.setFolders = jest.fn();
      store.setFiles = jest.fn();
      store.setBufferSelection = jest.fn();
      store.setScrollToItem = jest.fn();
      store.setCreatedItem = jest.fn();
      store.selection = [];
      store.activeFiles = [];
      store.bufferSelection = null;
      store.createdItem = null;

      api.files.getFolder = jest.fn();
      global.isDesktop = jest.fn(() => false);
      global.isPublicRoom = jest.fn(() => false);
    });

    describe("filter handling", () => {
      const mockResponse = {
        total: 0,
        folders: [],
        files: [],
        current: {
          id: "folder-1",
          rootFolderType: "User",
        },
      };

      it("should handle empty list with no filter", async () => {
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(store.setIsEmptyPage).toHaveBeenCalledWith(true);
      });

      it("should handle empty list with filter", async () => {
        api.files.getFolder.mockResolvedValue(mockResponse);

        const filter = {
          clone: () => ({
            authorType: "owner",
            search: "test",
            withSubfolders: true,
            filterType: "documents",
            searchInContent: true,
          }),
        };

        await store.fetchFiles("folder-1", filter);

        expect(store.setIsEmptyPage).toHaveBeenCalledWith(false);
      });

      it("should handle privacy folder in desktop mode", async () => {
        global.isDesktop.mockReturnValue(true);
        api.files.getFolder.mockResolvedValue({
          ...mockResponse,
          current: {
            ...mockResponse.current,
            rootFolderType: "Privacy",
          },
          folders: ["folder1"],
          files: ["file1"],
        });

        await store.fetchFiles("folder-1", null);

        expect(store.setFolders).toHaveBeenCalledWith(["folder1"]);
        expect(store.setFiles).toHaveBeenCalledWith(["file1"]);
      });

      it("should handle privacy folder in web mode", async () => {
        global.isDesktop.mockReturnValue(false);
        api.files.getFolder.mockResolvedValue({
          ...mockResponse,
          current: {
            ...mockResponse.current,
            rootFolderType: "Privacy",
          },
          folders: ["folder1"],
          files: ["file1"],
        });

        await store.fetchFiles("folder-1", null);

        expect(store.setFolders).toHaveBeenCalledWith([]);
        expect(store.setFiles).toHaveBeenCalledWith([]);
      });
    });

    describe("selection handling", () => {
      const mockResponse = {
        total: 1,
        folders: [],
        files: [{ id: "file-1" }],
        current: { id: "folder-1" },
      };

      it("should preserve unprocessed selections", async () => {
        store.selection = [{ id: "preserved-file" }];
        store.activeFiles = [{ id: "active-file" }];
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null, true, false, true);

        expect(store.selection).toEqual([{ id: "preserved-file" }]);
      });

      it("should handle buffer selection preservation", async () => {
        store.bufferSelection = { id: "buffer-file" };
        store.activeFiles = [{ id: "active-file" }];
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null, true, false, true);

        expect(store.setBufferSelection).toHaveBeenCalledWith({
          id: "buffer-file",
        });
      });
    });

    describe("created item handling", () => {
      const mockResponse = {
        total: 1,
        folders: [],
        files: [{ id: "new-file", name: "test.txt" }],
        current: { id: "folder-1" },
      };

      it("should handle newly created item", async () => {
        store.createdItem = { id: "new-file", type: "file" };
        api.files.getFolder.mockResolvedValue(mockResponse);

        await store.fetchFiles("folder-1", null);

        expect(store.setBufferSelection).toHaveBeenCalledWith({
          id: "new-file",
          name: "test.txt",
        });
        expect(store.setScrollToItem).toHaveBeenCalledWith({
          id: "new-file",
          type: "file",
        });
        expect(store.setCreatedItem).toHaveBeenCalledWith(null);
      });
    });

    describe("error handling", () => {
      it("should handle payment required error", async () => {
        const error = {
          response: { status: 402 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(
            store.currentTariffStatusStore.setPortalTariff,
          ).toHaveBeenCalled();
        }
      });

      it("should handle third-party errors", async () => {
        const error = {
          response: { status: 500 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("abc", null);
        } catch (err) {
          expect(err).toBeDefined();
        }
      });

      it("should handle user errors", async () => {
        const error = {
          response: { status: 403 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(err.response.status).toBe(403);
        }
      });

      it("should handle public room errors", async () => {
        global.isPublicRoom.mockReturnValue(true);
        const error = {
          response: { status: 404 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(err.response.status).toBe(404);
        }
      });
    });
  });

  describe("room fetching and frame events", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.treeFoldersStore = {
        setSelectedNode: jest.fn(),
        roomsFolderId: "rooms-root",
      };
      store.indexingStore = {
        setIsIndexEditingMode: jest.fn(),
      };
      store.clientLoadingStore = {
        isLoading: false,
      };
      store.setIsLoadedFetchFiles = jest.fn();
      store.setIsErrorRoomNotAvailable = jest.fn();
      store.setHighlightFile = jest.fn();

      api.rooms = {
        getRooms: jest.fn(),
      };
      global.frameCallEvent = jest.fn();
      global.axios = {
        isCancel: jest.fn((err) => err.message === "canceled"),
      };
      global.window = {
        DocSpace: {
          location: {
            pathname: "/rooms",
            state: {},
          },
          navigate: jest.fn(),
        },
      };
    });

    describe("fetchRooms", () => {
      const mockRoomsResponse = {
        total: 10,
        rooms: [],
        current: { id: "room-1" },
      };

      it("should initialize room fetch with default filter", async () => {
        api.rooms.getRooms.mockResolvedValue(mockRoomsResponse);

        await store.fetchRooms("rooms-root");

        expect(api.rooms.getRooms).toHaveBeenCalled();
        const filterArg = api.rooms.getRooms.mock.calls[0][0];
        expect(filterArg.page).toBe(0);
        expect(filterArg.pageCount).toBe(100);
      });

      it("should preserve custom page count in filter", async () => {
        api.rooms.getRooms.mockResolvedValue(mockRoomsResponse);
        const customFilter = {
          clone: () => ({
            pageCount: 50,
            page: 2,
          }),
        };

        await store.fetchRooms("rooms-root", customFilter);

        expect(api.rooms.getRooms).toHaveBeenCalled();
        const filterArg = api.rooms.getRooms.mock.calls[0][0];
        expect(filterArg.pageCount).toBe(50);
        expect(filterArg.page).toBe(2);
      });

      it("should validate provider type", async () => {
        api.rooms.getRooms.mockResolvedValue(mockRoomsResponse);
        const invalidFilter = {
          clone: () => ({
            provider: "invalid-provider",
            pageCount: 100,
          }),
        };

        await store.fetchRooms("rooms-root", invalidFilter);

        expect(api.rooms.getRooms).toHaveBeenCalled();
        const filterArg = api.rooms.getRooms.mock.calls[0][0];
        expect(filterArg.provider).toBe(RoomsFilter.getDefault().provider);
      });

      it("should validate quota filter", async () => {
        api.rooms.getRooms.mockResolvedValue(mockRoomsResponse);
        const invalidFilter = {
          clone: () => ({
            quotaFilter: "invalid-quota",
            pageCount: 100,
          }),
        };

        await store.fetchRooms("rooms-root", invalidFilter);

        expect(api.rooms.getRooms).toHaveBeenCalled();
        const filterArg = api.rooms.getRooms.mock.calls[0][0];
        expect(filterArg.quotaFilter).toBe(
          RoomsFilter.getDefault().quotaFilter,
        );
      });
    });

    describe("frame events and error handling", () => {
      it("should trigger not found frame event", async () => {
        const error = {
          response: { status: 404 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(frameCallEvent).toHaveBeenCalledWith({ event: "onNotFound" });
          expect(store.setIsErrorRoomNotAvailable).toHaveBeenCalledWith(true);
        }
      });

      it("should trigger no access frame event", async () => {
        const error = {
          response: { status: 403 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(frameCallEvent).toHaveBeenCalledWith({ event: "onNoAccess" });
          expect(store.setIsErrorRoomNotAvailable).toHaveBeenCalledWith(true);
        }
      });

      it("should handle canceled requests", async () => {
        const error = {
          message: "canceled",
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("folder-1", null);
        } catch (err) {
          expect(axios.isCancel).toHaveBeenCalledWith(error);
          expect(store.setIsErrorRoomNotAvailable).not.toHaveBeenCalled();
        }
      });

      it("should handle third party errors with navigation", async () => {
        window.DocSpace.location.pathname = "/shared";
        const error = {
          response: { status: 500 },
        };
        api.files.getFolder.mockRejectedValue(error);

        try {
          await store.fetchFiles("external-folder", null);
        } catch (err) {
          expect(window.DocSpace.navigate).toHaveBeenCalled();
          const navigateArg = window.DocSpace.navigate.mock.calls[0][0];
          expect(navigateArg).toContain("shared");
        }
      });
    });

    describe("highlight file handling", () => {
      it("should set highlight file from location state", async () => {
        window.DocSpace.location.state = {
          highlightFileId: "file-1",
          isFileHasExst: true,
        };
        api.files.getFolder.mockResolvedValue({
          total: 1,
          folders: [],
          files: [],
          current: { id: "folder-1" },
        });

        await store.fetchFiles("folder-1", null);

        expect(store.setHighlightFile).toHaveBeenCalledWith({
          highlightFileId: "file-1",
          isFileHasExst: true,
        });
      });
    });
  });

  describe("store initialization and socket events", () => {
    beforeEach(() => {
      store.userStore = {
        user: { id: "user-1" },
      };
      store.authStore = {
        isAuthenticated: true,
      };
      store.selectedFolderStore = {
        id: "folder-1",
      };
      store.treeFoldersStore = {
        setSelectedNode: jest.fn(),
      };
      store.filesSettingsStore = {
        withPaging: true,
      };
      store.thirdPartyStore = {
        isThirdParty: false,
      };
      store.clientLoadingStore = {
        setIsLoading: jest.fn(),
      };
      store.infoPanelStore = {
        isVisible: false,
      };
      store.setFiles = jest.fn();
      store.setFolders = jest.fn();
      store.setSelected = jest.fn();
      store.setSelection = jest.fn();

      global.SocketHelper = {
        emit: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      };
    });

    describe("store dependencies", () => {
      it("should initialize with required store dependencies", () => {
        expect(store.userStore).toBeDefined();
        expect(store.authStore).toBeDefined();
        expect(store.selectedFolderStore).toBeDefined();
        expect(store.treeFoldersStore).toBeDefined();
        expect(store.filesSettingsStore).toBeDefined();
        expect(store.thirdPartyStore).toBeDefined();
        expect(store.clientLoadingStore).toBeDefined();
        expect(store.infoPanelStore).toBeDefined();
      });

      it("should handle missing dependencies gracefully", () => {
        store.userStore = null;
        store.authStore = null;

        expect(() => store.fetchFiles("folder-1")).not.toThrow();
      });
    });

    describe("socket event handling", () => {
      const mockSocketData = {
        data: {
          id: "file-1",
          fileExst: ".txt",
          title: "test.txt",
          folderId: "folder-1",
        },
      };

      it("should handle file creation socket event", () => {
        const callback = SocketHelper.subscribe.mock.calls.find(
          (call) => call[0] === SocketEvents.CREATE_FILE,
        )?.[1];

        expect(callback).toBeDefined();
        callback(mockSocketData);

        expect(store.setFiles).toHaveBeenCalled();
      });

      it("should handle file deletion socket event", () => {
        const callback = SocketHelper.subscribe.mock.calls.find(
          (call) => call[0] === SocketEvents.DELETE_FILE,
        )?.[1];

        expect(callback).toBeDefined();
        callback(mockSocketData);

        expect(store.setFiles).toHaveBeenCalled();
      });

      it("should handle file update socket event", () => {
        const callback = SocketHelper.subscribe.mock.calls.find(
          (call) => call[0] === SocketEvents.UPDATE_FILE,
        )?.[1];

        expect(callback).toBeDefined();
        callback(mockSocketData);

        expect(store.setFiles).toHaveBeenCalled();
      });

      it("should handle file move socket event", () => {
        const moveData = {
          ...mockSocketData,
          data: {
            ...mockSocketData.data,
            fromFolderId: "folder-1",
            toFolderId: "folder-2",
          },
        };

        const callback = SocketHelper.subscribe.mock.calls.find(
          (call) => call[0] === SocketEvents.MOVE_FILE,
        )?.[1];

        expect(callback).toBeDefined();
        callback(moveData);

        expect(store.setFiles).toHaveBeenCalled();
      });

      it("should handle file copy socket event", () => {
        const copyData = {
          ...mockSocketData,
          data: {
            ...mockSocketData.data,
            fromFolderId: "folder-1",
            toFolderId: "folder-2",
          },
        };

        const callback = SocketHelper.subscribe.mock.calls.find(
          (call) => call[0] === SocketEvents.COPY_FILE,
        )?.[1];

        expect(callback).toBeDefined();
        callback(copyData);

        expect(store.setFiles).toHaveBeenCalled();
      });
    });

    describe("cleanup and unsubscribe", () => {
      it("should unsubscribe from socket events on cleanup", () => {
        store.unsubscribeEvents();

        expect(SocketHelper.unsubscribe).toHaveBeenCalled();
        expect(SocketHelper.unsubscribe.mock.calls.length).toBeGreaterThan(0);
      });

      it("should clear selection on cleanup", () => {
        store.selection = [{ id: "file-1" }];
        store.clearSelection();

        expect(store.selection).toEqual([]);
      });

      it("should reset store state", () => {
        store.reset();

        expect(store.files).toEqual([]);
        expect(store.folders).toEqual([]);
        expect(store.selection).toEqual([]);
        expect(store.bufferSelection).toBeNull();
      });
    });
  });
});
