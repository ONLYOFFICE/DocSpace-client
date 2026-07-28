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
// Characterization-test harness for ContextOptionsStore. The store takes 20
// injected stores; only a subset is read while *building* the menu model
// (onClick handlers are created but never invoked during construction, so the
// action stores need not be functional). Fakes are minimal — add fields as a
// test demands them (driven by real failures, never guessed).
// ---------------------------------------------------------------------------

import { vi } from "vitest";

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
vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (k: string) => k, exists: () => true, language: "en" },
}));

// eslint-disable-next-line import/first
import ContextOptionsStore from "../../ContextOptionsStore";

const store = <T>(v: T) => v as unknown as Record<string, unknown>;

/** Minimal fakes for the 20 constructor deps, overridable per test. */
export type FakeStores = Record<string, Record<string, unknown>>;

const defaultFakes = () => ({
  settingsStore: { isFrame: false, isDesktopClient: false },
  dialogsStore: { setChangeOwnerDialogVisible: vi.fn(), roomGroups: [] },
  filesActionsStore: {},
  filesStore: {
    // Bypassed when item.contextOptions is provided; kept for safety.
    getFilesContextOptions: () => [],
    selection: [],
    bufferSelection: null,
    roomsForDelete: [],
    roomsForRestore: [],
  },
  mediaViewerDataStore: {},
  treeFoldersStore: {
    isRecycleBinFolder: false,
    isArchiveFolder: false,
    isRoomsFolder: false,
    isPersonalRoom: false,
    isRecentTab: false,
  },
  uploadDataStore: { shouldEncryptCurrentUpload: () => false },
  versionHistoryStore: {},
  filesSettingsStore: { getIcon: () => "icon.svg" },
  selectedFolderStore: { id: 1, security: {}, navigationPath: [] },
  publicRoomStore: { isPublicRoom: false },
  oformsStore: {},
  pluginStore: { contextMenuItemsList: [] },
  infoPanelStore: {},
  currentTariffStatusStore: {},
  currentQuotaStore: {},
  userStore: { user: { id: "user-1", isAdmin: false, isOwner: false } },
  indexingStore: {},
  clientLoadingStore: {},
  guidanceStore: {},
});

const ORDER = [
  "settingsStore",
  "dialogsStore",
  "filesActionsStore",
  "filesStore",
  "mediaViewerDataStore",
  "treeFoldersStore",
  "uploadDataStore",
  "versionHistoryStore",
  "filesSettingsStore",
  "selectedFolderStore",
  "publicRoomStore",
  "oformsStore",
  "pluginStore",
  "infoPanelStore",
  "currentTariffStatusStore",
  "currentQuotaStore",
  "userStore",
  "indexingStore",
  "clientLoadingStore",
  "guidanceStore",
] as const;

export const createTestContextOptionsStore = (
  overrides: FakeStores = {},
): ContextOptionsStore => {
  const base = defaultFakes() as Record<string, Record<string, unknown>>;
  const merged: Record<string, Record<string, unknown>> = {};
  for (const key of ORDER) {
    merged[key] = { ...base[key], ...(overrides[key] ?? {}) };
  }
  const args = ORDER.map((k) => store(merged[k]));
  return new ContextOptionsStore(
    ...(args as unknown as ConstructorParameters<typeof ContextOptionsStore>),
  );
};

/** Recursively project a ContextMenuModel[] to { key, label } for snapshots. */
export const menuShape = (
  model: unknown[],
): Array<{ key: unknown; label?: unknown; items?: unknown }> =>
  (model ?? []).map((raw) => {
    const o = raw as { key?: unknown; label?: unknown; items?: unknown[] };
    const node: { key: unknown; label?: unknown; items?: unknown } = {
      key: o.key,
    };
    if (o.label !== undefined) node.label = o.label;
    if (Array.isArray(o.items)) node.items = menuShape(o.items);
    return node;
  });

export const t = ((key: string) => key) as unknown as never;
