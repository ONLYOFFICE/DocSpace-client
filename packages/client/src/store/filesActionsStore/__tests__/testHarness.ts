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

// ---------------------------------------------------------------------------
// Characterization-test harness for FilesActionsStore.
//
// FilesActionsStore's constructor takes 19 injected stores, builds a nested
// FilesHeaderOptionStore, and calls makeAutoObservable. This module mocks the
// module-level side-effecting imports (socket, i18n, toast, info-panel,
// filename-cache, toast-helpers) and provides minimal inert fakes for the
// injected stores so the store can be constructed in isolation under
// vitest/jsdom.
//
// The fakes only need the fields/methods that the *method under test* reads;
// add fields as tests demand them (drive by real failures, never guess).
// ---------------------------------------------------------------------------

import { vi } from "vitest";

// Inert socket singleton (no listeners fire, no connection opens); keep the
// real named exports (SocketCommands enum) that the store reads.
vi.mock("@docspace/ui-kit/utils/socket", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    default: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      socketSubscribers: new Set<string>(),
    },
  };
});

// Filename cache: forgetEncryptedFilename is a no-op in tests.
vi.mock("@docspace/shared/services/encryption/filename-cache", () => ({
  forgetEncryptedFilename: vi.fn(),
  resolveDisplayTitle: ({ title }: { title?: string }) => title,
  subscribeFilenameCache: vi.fn(),
}));

// Info-panel helpers: stub so tests don't reach the real panel store.
vi.mock("SRC_DIR/helpers/info-panel", () => ({
  hideInfoPanel: vi.fn(),
  setInfoPanelSelectedRoom: vi.fn(),
  refreshInfoPanel: vi.fn(),
}));

// Toast helpers (export-room-index success toast) — inert.
vi.mock("SRC_DIR/helpers/toast-helpers", () => ({
  showSuccessExportRoomIndexToast: vi.fn(),
}));

// Client i18n bootstrap → inert instance whose t echoes the key.
vi.mock("SRC_DIR/i18n", () => ({
  default: {
    t: (key: string) => key,
    exists: () => true,
    changeLanguage: () => Promise.resolve(),
    language: "en",
  },
}));

// Toast: assert-friendly no-ops.
vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// eslint-disable-next-line import/first
import FilesActionsStore from "../../FilesActionsStore";

export type FakeStores = {
  settingsStore: Record<string, unknown>;
  uploadDataStore: Record<string, unknown>;
  treeFoldersStore: Record<string, unknown>;
  filesStore: Record<string, unknown>;
  selectedFolderStore: Record<string, unknown>;
  filesSettingsStore: Record<string, unknown>;
  dialogsStore: Record<string, unknown>;
  mediaViewerDataStore: Record<string, unknown>;
  accessRightsStore: Record<string, unknown>;
  clientLoadingStore: Record<string, unknown>;
  publicRoomStore: Record<string, unknown>;
  pluginStore: Record<string, unknown>;
  userStore: Record<string, unknown>;
  currentTariffStatusStore: Record<string, unknown>;
  peopleStore: Record<string, unknown>;
  currentQuotaStore: Record<string, unknown>;
  indexingStore: Record<string, unknown>;
  versionHistoryStore: Record<string, unknown>;
  aiRoomStore: Record<string, unknown>;
};

const defaultFakes = (): FakeStores => ({
  settingsStore: {
    isDesktopClient: false,
    isFrame: false,
    enablePlugins: false,
    openUrl: vi.fn(),
  },
  uploadDataStore: {
    secondaryProgressDataStore: {
      setSecondaryProgressBarData: vi.fn(),
      clearSecondaryProgressData: vi.fn(),
    },
    primaryProgressDataStore: {
      setPrimaryProgressBarData: vi.fn(),
      clearPrimaryProgressData: vi.fn(),
    },
    clearActiveOperations: vi.fn(),
    loopFilesOperations: vi.fn(async () => {}),
    itemOperationToFolder: vi.fn(async () => {}),
  },
  treeFoldersStore: {
    treeFolders: [],
    isRoomsFolder: false,
    isArchiveFolder: false,
    isArchiveFolderRoot: false,
    isTemplatesFolder: false,
    isAIAgentsFolder: false,
    isFormsFolder: false,
    isRecycleBinFolder: false,
    isPrivacyFolder: false,
    isRecentFolder: false,
    isFavoritesFolder: false,
    isPersonalRoom: false,
    myRoomsId: undefined,
    recycleBinFolderId: undefined,
    setSelectedNode: vi.fn(),
    fetchTreeFolders: vi.fn(async () => {}),
    updateTreeFoldersItem: vi.fn(),
    getRootFolder: () => ({}),
  },
  filesStore: {
    selection: [],
    bufferSelection: null,
    filesList: [],
    files: [],
    folders: [],
    filter: { clone: () => ({}) },
    roomsFilter: { clone: () => ({}) },
    setSelection: vi.fn(),
    setBufferSelection: vi.fn(),
    setSelected: vi.fn(),
    addActiveItems: vi.fn(),
    getFilesChecked: vi.fn(),
    fetchFiles: vi.fn(async () => {}),
    fetchRooms: vi.fn(async () => {}),
    fetchAgents: vi.fn(async () => {}),
    scrollToTop: vi.fn(),
    setScrollToItem: vi.fn(),
    activeFiles: [],
    activeFolders: [],
    setActiveFiles: vi.fn(),
    setActiveFolders: vi.fn(),
  },
  selectedFolderStore: {
    id: 1,
    parentId: 0,
    navigationPath: [],
    security: {},
    isRoom: false,
    getSelectedFolder: () => ({ id: 1 }),
    setSelectedFolder: vi.fn(),
  },
  filesSettingsStore: {
    getIcon: () => "icon.svg",
    extsWebEdited: [],
    confirmDelete: true,
  },
  dialogsStore: {
    isFolderActions: false,
    setIsFolderActions: vi.fn(),
    roomGroups: [],
    setDeleteDialogVisible: vi.fn(),
    setMoveToPanelVisible: vi.fn(),
    setCopyPanelVisible: vi.fn(),
    setDownloadDialogVisible: vi.fn(),
  },
  mediaViewerDataStore: {
    setMediaViewerData: vi.fn(),
    setCurrentItem: vi.fn(),
  },
  accessRightsStore: {
    canMoveItems: () => true,
  },
  clientLoadingStore: {
    setIsSectionHeaderLoading: vi.fn(),
    setIsSectionFilterLoading: vi.fn(),
    setIsSectionBodyLoading: vi.fn(),
    showProgress: false,
  },
  publicRoomStore: {
    isPublicRoom: false,
  },
  pluginStore: {
    contextMenuItemsList: [],
  },
  userStore: {
    user: { id: "user-1", isAdmin: false },
  },
  currentTariffStatusStore: {},
  peopleStore: {
    selectionStore: {},
  },
  currentQuotaStore: {
    isDefaultRoomsQuotaSet: false,
    maxCountRoomsByQuota: 0,
  },
  indexingStore: {
    isIndexEditingMode: false,
    setIsIndexEditingMode: vi.fn(),
  },
  versionHistoryStore: {},
  aiRoomStore: {
    setKnowledgeId: vi.fn(),
  },
});

/**
 * Construct a FilesActionsStore backed by inert fakes. Merge-overrides are
 * shallow per store, e.g.
 * `createTestFilesActionsStore({ filesStore: { selection: [item] } })`.
 */
export const createTestFilesActionsStore = (
  overrides: Partial<FakeStores> = {},
): FilesActionsStore => {
  const base = defaultFakes();
  const merged = { ...base };
  for (const key of Object.keys(overrides) as (keyof FakeStores)[]) {
    merged[key] = { ...base[key], ...overrides[key] };
  }

  const args = [
    merged.settingsStore,
    merged.uploadDataStore,
    merged.treeFoldersStore,
    merged.filesStore,
    merged.selectedFolderStore,
    merged.filesSettingsStore,
    merged.dialogsStore,
    merged.mediaViewerDataStore,
    merged.accessRightsStore,
    merged.clientLoadingStore,
    merged.publicRoomStore,
    merged.pluginStore,
    merged.userStore,
    merged.currentTariffStatusStore,
    merged.peopleStore,
    merged.currentQuotaStore,
    merged.indexingStore,
    merged.versionHistoryStore,
    merged.aiRoomStore,
  ];

  return new FilesActionsStore(
    ...(args as unknown as ConstructorParameters<typeof FilesActionsStore>),
  );
};

// A translation stub: echoes the key.
export const t = ((key: string) => key) as unknown as never;
