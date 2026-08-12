// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";
import { FileType, FolderType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

// Bug 82885: plugin context-menu keys must never reach a file from an
// encrypted room. Plugins get only a file id and fetch the bytes themselves,
// so any plugin action on an encrypted file either ships ciphertext to a third
// party (PDF Converter -> convertapi.com) or fails on it (Convert to Markdown).
// The group-action menu filters against these same contextOptions, so keeping
// the keys out here closes the single- and multi-selection surfaces at once.

const PLUGIN_KEY = "plugin-convert-to-pdf";

const baseFile = (): TItem =>
  ({
    id: 1,
    parentId: 10,
    title: "Report.docx",
    fileExst: ".docx",
    contentLength: "1 KB",
    fileType: FileType.Document,
    rootFolderType: FolderType.Rooms,
    security: { Download: true, Copy: true, Duplicate: true },
    viewAccessibility: { WebEdit: true, WebView: true },
  }) as unknown as TItem;

const encryptedFile = (): TItem =>
  ({ ...baseFile(), id: 2, title: "Secret.docx", encrypted: true }) as TItem;

const storeWithPlugin = () =>
  createTestFilesStore({
    settingsStore: { enablePlugins: true },
    pluginStore: { getContextMenuKeysByType: () => [PLUGIN_KEY] },
    userStore: { encryptionKeys: [{ id: "key-1" }] },
  });

describe("getFilesContextOptions — plugin items vs encrypted files", () => {
  it("offers plugin actions on a regular file", () => {
    const opts = storeWithPlugin().getFilesContextOptions(baseFile());

    expect(opts).toContain(PLUGIN_KEY);
  });

  it("withholds plugin actions from a file in an encrypted room", () => {
    const opts = storeWithPlugin().getFilesContextOptions(encryptedFile());

    expect(opts).not.toContain(PLUGIN_KEY);
    // the encrypted-specific option is still built, so the branch itself ran
    expect(opts).toContain("download-encrypted");
  });

  it("does not ask the plugin store for keys at all when encrypted", () => {
    const getContextMenuKeysByType = vi.fn(() => [PLUGIN_KEY]);
    const store = createTestFilesStore({
      settingsStore: { enablePlugins: true },
      pluginStore: { getContextMenuKeysByType },
      userStore: { encryptionKeys: [{ id: "key-1" }] },
    });

    store.getFilesContextOptions(encryptedFile());

    expect(getContextMenuKeysByType).not.toHaveBeenCalled();
  });

  it("keeps plugin actions out of an encrypted image or video too", () => {
    const store = createTestFilesStore({
      settingsStore: { enablePlugins: true },
      pluginStore: { getContextMenuKeysByType: () => [PLUGIN_KEY] },
      userStore: { encryptionKeys: [{ id: "key-1" }] },
    });

    const encryptedImage = {
      ...encryptedFile(),
      id: 3,
      title: "Secret.png",
      fileExst: ".png",
      fileType: FileType.Image,
      viewAccessibility: { ImageView: true },
    } as unknown as TItem;

    const encryptedVideo = {
      ...encryptedFile(),
      id: 4,
      title: "Secret.mp4",
      fileExst: ".mp4",
      fileType: FileType.Video,
      viewAccessibility: { MediaView: true },
    } as unknown as TItem;

    expect(store.getFilesContextOptions(encryptedImage)).not.toContain(
      PLUGIN_KEY,
    );
    expect(store.getFilesContextOptions(encryptedVideo)).not.toContain(
      PLUGIN_KEY,
    );
  });
});
