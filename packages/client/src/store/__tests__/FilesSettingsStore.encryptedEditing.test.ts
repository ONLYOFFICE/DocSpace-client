/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));

vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { files: {} },
}));

import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TFilesSettings } from "@docspace/shared/api/files/types";

import FilesSettingsStore from "../FilesSettingsStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type { ThirdPartyStore } from "../ThirdPartyStore";
import type TreeFoldersStore from "../TreeFoldersStore";

const createStore = () =>
  new FilesSettingsStore(
    {} as unknown as ThirdPartyStore,
    {} as unknown as TreeFoldersStore,
    {} as unknown as PublicRoomStore,
    {} as unknown as PluginStore,
    {} as unknown as AuthStore,
    {} as unknown as SettingsStore,
  );

describe("FilesSettingsStore encrypted editing", () => {
  it("Capability absent: nothing loaded yet", () => {
    expect(createStore().isEncryptedEditingAvailable).toBe(false);
  });

  it("Capability present", () => {
    const store = createStore();
    store.setFilesSettings({
      docServiceEncryptionSupported: true,
    } as TFilesSettings);
    expect(store.isEncryptedEditingAvailable).toBe(true);
  });

  it("Capability false", () => {
    const store = createStore();
    store.setFilesSettings({
      docServiceEncryptionSupported: false,
    } as TFilesSettings);
    expect(store.isEncryptedEditingAvailable).toBe(false);
  });
});
