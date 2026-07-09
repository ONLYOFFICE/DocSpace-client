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
// Characterization-test harness for UploadDataStore (Phase 0 of
// uploadDataStore/REFACTORING_PLAN.md).
//
// UploadDataStore's constructor takes 10 injected stores and has NO side
// effects, which keeps this harness simpler than FilesStore's. The heavy
// lifting is at the module level: the HTTP layer (@docspace/shared/api/*) and
// the operation-progress poller are replaced with vi.fn()s that individual
// tests script per scenario, while socket/i18n/toastr/filename-cache mocks are
// inherited from the FilesStore harness (imported below for its
// createTestFilesStore — a REAL FilesStore instance backed by inert fakes, so
// methods that mutate filesStore state (refreshFiles, moveToCopyTo,
// clearActiveOperations) are characterized against real observable arrays).
//
// window globals the store reads directly (window.i18n in cancelUpload,
// window.dataLayer in checkChunkUpload, window.DocSpace.navigate in
// navigateToNewFolderLocation) are (re)installed by installWindowGlobals(),
// which runs at import time; call it again in beforeEach for a clean
// dataLayer/navigate per test.
// ---------------------------------------------------------------------------

import { vi } from "vitest";

// HTTP layer: keep every real export (types/constants and functions other
// code imports at module-eval time), replace only the functions
// UploadDataStore and its local helpers call. Tests script behavior through
// `vi.mocked(filesApi.startUploadSession).mockResolvedValue(...)`.
vi.mock("@docspace/shared/api/files", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getFileInfo: vi.fn(),
    getFolderInfo: vi.fn(),
    convertFile: vi.fn(),
    startUploadSession: vi.fn(),
    uploadChunkSequential: vi.fn(),
    uploadChunkParallel: vi.fn(),
    finalizeUploadSession: vi.fn(),
    copyToFolder: vi.fn(),
    moveToFolder: vi.fn(),
    fileCopyAs: vi.fn(),
    checkIsFileExist: vi.fn(),
    setFileEncryptionKeys: vi.fn(),
    getFileEncryptionAccess: vi.fn(),
    // Called (behind a 1s setTimeout) by uploadDataStore/helpers.ts
    // getConversationProgress — conversion tests drive it with fake timers.
    getFileConversationProgress: vi.fn(),
  };
});

vi.mock("@docspace/shared/api/privacy", () => ({
  getRoomEncryptionKeys: vi.fn(),
}));

// The four mocks below duplicate the FilesStore-harness registrations ON
// PURPOSE. vi.mock calls are hoisted above this module's imports, but the
// FilesStore harness registers its mocks only when ITS import executes —
// which is AFTER `import UploadDataStore` below has already loaded the real
// modules (the real SRC_DIR/i18n boots i18next with an HTTP backend and
// spams unhandled rejections in jsdom). Registering them here makes the
// harness independent of import order; the factories are kept identical so
// whichever registration wins, both suites see the same behavior.

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

vi.mock("@docspace/shared/services/encryption/filename-cache", () => ({
  subscribeFilenameCache: vi.fn(),
  resolveDisplayTitle: ({ title }: { title?: string }) => title,
  rememberEncryptedFilename: vi.fn(),
}));

vi.mock("SRC_DIR/helpers/info-panel", () => ({
  setInfoPanelSelectedRoom: vi.fn(),
  refreshInfoPanel: vi.fn(),
}));

vi.mock("SRC_DIR/i18n", () => ({
  default: {
    t: (key: string) => key,
    exists: () => true,
    changeLanguage: () => Promise.resolve(),
    language: "en",
  },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// copy/move polling: loopFilesOperations awaits this in a while-loop; tests
// feed it a scripted sequence of progress snapshots.
vi.mock("@docspace/shared/utils/getOperationProgress", () => ({
  getOperationProgress: vi.fn(),
}));

// The FilesStore harness import below registers (hoisted) mocks for
// @docspace/ui-kit/utils/socket, @docspace/ui-kit/components/toast,
// @docspace/shared/services/encryption/filename-cache, SRC_DIR/i18n and
// SRC_DIR/helpers/info-panel — all of which UploadDataStore needs too.
// Encryption services (secret-storage, private-room/*, file-keys) stay REAL:
// with no unlocked identity they early-return, and encryption-path specs mock
// them per-file (same convention as FilesStore.encryption.test.ts).
// eslint-disable-next-line import/first
import UploadDataStore from "../../UploadDataStore";
// eslint-disable-next-line import/first
import type { TUploadFile } from "../helpers";
// eslint-disable-next-line import/first
import type { TFile } from "@docspace/shared/api/files/types";
// eslint-disable-next-line import/first
import { createTestFilesStore } from "../../filesStore/__tests__/testHarness";
// eslint-disable-next-line import/first
import {
  fakeAiRoomStore,
  fakeFilesSettingsStore,
  fakeSelectedFolderStore,
  fakeSettingsStore,
  fakeTreeFoldersStore,
  fakeUserStore,
  type FakeStore,
} from "../../__tests__/sharedFakes";

/** window globals UploadDataStore reads directly. Re-run in beforeEach. */
export const installWindowGlobals = () => {
  const w = window as unknown as Record<string, unknown>;
  w.i18n = { t: (key: string) => key };
  w.dataLayer = [];
  w.DocSpace = { navigate: vi.fn() };
};
installWindowGlobals();

export type UploadFakeStores = {
  settingsStore: FakeStore;
  treeFoldersStore: FakeStore;
  selectedFolderStore: FakeStore;
  secondaryProgressDataStore: FakeStore;
  primaryProgressDataStore: FakeStore;
  dialogsStore: FakeStore;
  filesSettingsStore: FakeStore;
  aiRoomStore: FakeStore;
  userStore: FakeStore;
};

const defaultFakes = (): UploadFakeStores => ({
  settingsStore: fakeSettingsStore(),
  treeFoldersStore: {
    ...fakeTreeFoldersStore(),
    // startConversion branches on this trio.
    isSharedWithMeFolder: false,
  },
  selectedFolderStore: {
    ...fakeSelectedFolderStore(),
    roomType: null,
    isAIRoom: false,
  },
  secondaryProgressDataStore: {
    setSecondaryProgressBarData: vi.fn(),
    // loopFilesOperations scans this for user-cancelled operations.
    secondaryOperationsArray: [],
  },
  primaryProgressDataStore: {
    setPrimaryProgressBarData: vi.fn(),
  },
  dialogsStore: {
    conflictResolveDialogData: null,
    convertItem: null,
    setConflictResolveDialogData: vi.fn(),
    setConflictResolveDialogItems: vi.fn(),
    setConflictResolveDialogVisible: vi.fn(),
    setConvertDialogData: vi.fn(),
    setConvertDialogVisible: vi.fn(),
    setConvertItem: vi.fn(),
    setIsFolderActions: vi.fn(),
  },
  filesSettingsStore: {
    ...fakeFilesSettingsStore(),
    chunkUploadSize: 10 * 1024 * 1024,
    maxUploadFilesCount: 5,
    uploadThreadCount: 5,
    canConvert: vi.fn(() => false),
    hideConfirmConvertSave: false,
    storeOriginalFiles: false,
  },
  aiRoomStore: {
    ...fakeAiRoomStore(),
    knowledgeId: null,
  },
  userStore: fakeUserStore(),
});

export type UploadHarnessOverrides = Partial<UploadFakeStores> & {
  /** Defaults to a REAL FilesStore built by the filesStore harness. */
  filesStore?: ReturnType<typeof createTestFilesStore>;
};

/**
 * Construct an UploadDataStore backed by inert fakes plus a real FilesStore.
 * Fake overrides shallow-merge per store, e.g.
 * `createTestUploadDataStore({ filesSettingsStore: { uploadThreadCount: 1 } })`.
 */
export const createTestUploadDataStore = (
  overrides: UploadHarnessOverrides = {},
): {
  store: UploadDataStore;
  fakes: UploadFakeStores;
  filesStore: ReturnType<typeof createTestFilesStore>;
} => {
  const base = defaultFakes();
  const fakes = { ...base };
  for (const key of Object.keys(base) as (keyof UploadFakeStores)[]) {
    if (overrides[key]) fakes[key] = { ...base[key], ...overrides[key] };
  }
  const filesStore = overrides.filesStore ?? createTestFilesStore();

  const store = new UploadDataStore(
    ...([
      fakes.settingsStore,
      fakes.treeFoldersStore,
      fakes.selectedFolderStore,
      filesStore,
      fakes.secondaryProgressDataStore,
      fakes.primaryProgressDataStore,
      fakes.dialogsStore,
      fakes.filesSettingsStore,
      fakes.aiRoomStore,
      fakes.userStore,
    ] as unknown as ConstructorParameters<typeof UploadDataStore>),
  );

  return { store, fakes, filesStore };
};

// ---------------------------------------------------------------------------
// Fixture factories — realistic by default (§3.0.7 of the plan): minimal `{}`
// stubs mask branches like `if (file.path)` / `if (item.encrypted)`.
// ---------------------------------------------------------------------------

let fixtureSeq = 0;

export const makeBrowserFile = (
  name = "document.docx",
  size = 1024,
  extra: Record<string, unknown> = {},
): File => {
  const file = new File([new Uint8Array(size)], name, {
    type: "application/octet-stream",
  });
  return Object.assign(file, extra);
};

export const makeFileInfo = (overrides: Partial<TFile> = {}): TFile =>
  ({
    id: 1000 + fixtureSeq,
    title: `document-${fixtureSeq}.docx`,
    folderId: 1,
    fileExst: ".docx",
    fileStatus: 0,
    fileType: 7,
    version: 1,
    versionGroup: 1,
    contentLength: "1024",
    pureContentLength: 1024,
    viewUrl: `https://example/view/${1000 + fixtureSeq}`,
    webUrl: `https://example/web/${1000 + fixtureSeq}`,
    security: { Read: true, Edit: true, Delete: true },
    encrypted: false,
    ...overrides,
  }) as unknown as TFile;

export const makeUploadFile = (
  overrides: Partial<TUploadFile> = {},
): TUploadFile => {
  fixtureSeq += 1;
  const name = `document-${fixtureSeq}.docx`;
  return {
    file: makeBrowserFile(name, 1024),
    uniqueId: `temp_${fixtureSeq}`,
    fileId: null,
    toFolderId: 1,
    action: "upload",
    error: null,
    fileInfo: null,
    cancel: false,
    needConvert: false,
    encrypted: false,
    percent: 0,
    inAction: false,
    inConversion: false,
    ...overrides,
  };
};
