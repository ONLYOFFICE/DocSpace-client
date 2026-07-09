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
// Characterization-test harness for FilesStore (Phase 0 of REFACTORING_PLAN).
//
// FilesStore's constructor takes 14 injected stores and has side effects
// (socket listeners, filename-cache subscription). This module mocks those
// module-level side effects and builds minimal fakes for the injected stores
// so the store can be constructed in isolation under vitest/jsdom.
//
// The mocks below are intentionally inert: no listener registered in the
// constructor ever fires during a unit test, so the fakes only need the
// fields/methods that the *method under test* actually reads. Add fields to a
// fake as tests demand them (drive by real failures, never guess the graph).
// ---------------------------------------------------------------------------

import { vi } from "vitest";

// vi.mock calls are hoisted above the imports below by the vitest transform,
// so FilesStore sees the mocked modules at import time.

// Socket: keep every real named export (enums like SocketEvents,
// SocketCommands, SocketCommandsRoomParts — SettingsStore and others read
// them at construction), but replace the default `SocketHelper` singleton with
// an inert emitter so no listener registered in the constructor ever fires and
// no real connection is opened. `socketSubscribers` is an empty Set so
// `SocketHelper?.socketSubscribers.has(...)` returns false.
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

// Filename cache: `subscribeFilenameCache` fires in the constructor — make it
// a no-op. `resolveDisplayTitle` is identity so title-dependent code is stable.
vi.mock("@docspace/shared/services/encryption/filename-cache", () => ({
  subscribeFilenameCache: vi.fn(),
  // Real signature is `resolveDisplayTitle({ id, title, encrypted })` → string.
  // Echo the plaintext title so title-dependent mapping stays deterministic.
  resolveDisplayTitle: ({ title }: { title?: string }) => title,
  // Not used by FilesStore itself, but UploadDataStore (whose harness reuses
  // this mock registration via createTestFilesStore) calls it after encrypted
  // chunk uploads.
  rememberEncryptedFilename: vi.fn(),
}));

// Encryption/private-room services are import-safe (no top-level side effects)
// and only invoked from methods with an unlocked identity, so the harness does
// not mock them: `SecretStorage.getCached` returns null in tests (no identity),
// which makes the encryption helpers early-return. Tests that exercise the
// crypto path (FilesStore.encryption.test.ts) mock these modules themselves so
// a single mock instance is shared between the spec and the store.

// Info-panel helpers: fetch/socket paths poke the info panel; stub so tests
// don't reach the real panel store.
vi.mock("SRC_DIR/helpers/info-panel", () => ({
  setInfoPanelSelectedRoom: vi.fn(),
  refreshInfoPanel: vi.fn(),
}));

// Client i18n bootstrap: `src/i18n.js` builds a real i18next instance with an
// HTTP backend at import time (pulled in transitively via helpers/filesUtils).
// Replace it with an inert instance whose `t` echoes the key, so no network
// load is attempted and title-dependent logic stays deterministic.
vi.mock("SRC_DIR/i18n", () => ({
  default: {
    t: (key: string) => key,
    exists: () => true,
    changeLanguage: () => Promise.resolve(),
    language: "en",
  },
}));

// Toast: assert-friendly no-op so success/error calls do not blow up jsdom.
vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// eslint-disable-next-line import/first
import FilesStore from "../../FilesStore";
// eslint-disable-next-line import/first
import {
  fakeAiRoomStore,
  fakeFilesSettingsStore,
  fakeSelectedFolderStore,
  fakeSettingsStore,
  fakeTreeFoldersStore,
  fakeUserStore,
} from "../../__tests__/sharedFakes";

/**
 * Overridable fakes for the 14 constructor dependencies. Each defaults to a
 * minimal inert stub; pass an override to supply the fields a given method
 * reads. Values are cast to the real store types at the constructor boundary.
 */
export type FakeStores = {
  authStore: Record<string, unknown>;
  selectedFolderStore: Record<string, unknown>;
  treeFoldersStore: Record<string, unknown>;
  filesSettingsStore: Record<string, unknown>;
  thirdPartyStore: Record<string, unknown>;
  accessRightsStore: Record<string, unknown>;
  clientLoadingStore: Record<string, unknown>;
  pluginStore: Record<string, unknown>;
  publicRoomStore: Record<string, unknown>;
  userStore: Record<string, unknown>;
  currentTariffStatusStore: Record<string, unknown>;
  settingsStore: Record<string, unknown>;
  indexingStore: Record<string, unknown>;
  aiRoomStore: Record<string, unknown>;
};

const defaultFakes = (): FakeStores => ({
  authStore: { currentQuotaStore: {} },
  selectedFolderStore: fakeSelectedFolderStore(),
  treeFoldersStore: fakeTreeFoldersStore(),
  filesSettingsStore: fakeFilesSettingsStore(),
  thirdPartyStore: {
    providers: [],
    getThirdPartyIcon: () => "third-party-icon.svg",
  },
  accessRightsStore: { canMoveItems: () => true },
  clientLoadingStore: {
    isLoading: false,
    setIsLoaded: vi.fn(),
    setIsSectionHeaderLoading: vi.fn(),
    setIsSectionFilterLoading: vi.fn(),
    setIsSectionBodyLoading: vi.fn(),
    setIsArticleLoading: vi.fn(),
    setFirstLoad: vi.fn(),
  },
  pluginStore: {
    fileItemsList: [],
    contextMenuItemsList: [],
    getContextMenuKeysByType: () => [],
  },
  publicRoomStore: {
    isPublicRoom: false,
    getExternalLinks: vi.fn(async () => {}),
  },
  userStore: fakeUserStore(),
  currentTariffStatusStore: {},
  settingsStore: fakeSettingsStore(),
  indexingStore: {
    isIndexEditingMode: false,
    setIsIndexEditingMode: vi.fn(),
  },
  aiRoomStore: fakeAiRoomStore(),
});

/**
 * Construct a FilesStore backed by inert fakes. Merge-overrides are shallow
 * per store, e.g. `createTestFilesStore({ settingsStore: { enablePlugins: true } })`.
 */
export const createTestFilesStore = (
  overrides: Partial<FakeStores> = {},
): FilesStore => {
  const base = defaultFakes();
  const merged = { ...base };
  for (const key of Object.keys(overrides) as (keyof FakeStores)[]) {
    merged[key] = { ...base[key], ...overrides[key] };
  }

  const args = [
    merged.authStore,
    merged.selectedFolderStore,
    merged.treeFoldersStore,
    merged.filesSettingsStore,
    merged.thirdPartyStore,
    merged.accessRightsStore,
    merged.clientLoadingStore,
    merged.pluginStore,
    merged.publicRoomStore,
    merged.userStore,
    merged.currentTariffStatusStore,
    merged.settingsStore,
    merged.indexingStore,
    merged.aiRoomStore,
  ];

  return new FilesStore(
    ...(args as unknown as ConstructorParameters<typeof FilesStore>),
  );
};
