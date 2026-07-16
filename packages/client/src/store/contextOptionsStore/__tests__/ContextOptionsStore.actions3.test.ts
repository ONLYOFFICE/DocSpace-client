/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, vi } from "vitest";

import { createTestContextOptionsStore, t } from "./testHarness";

const item = (over: Record<string, unknown> = {}) =>
  ({ id: 1, isFolder: false, fileExst: ".docx", ...over }) as never;

describe("ContextOptionsStore — action handler delegation (batch 6)", () => {
  it("onClickDownload (folder) -> filesActionsStore.downloadAction", () => {
    const downloadAction = vi.fn(async () => {});
    const store = createTestContextOptionsStore({
      filesActionsStore: { downloadAction },
    });
    store.onClickDownload(item({ isFolder: true }), t);
    expect(downloadAction).toHaveBeenCalledTimes(1);
  });

  it("onClickDownload (file) -> settingsStore.openUrl", () => {
    const openUrl = vi.fn();
    const store = createTestContextOptionsStore({
      settingsStore: { openUrl },
    });
    store.onClickDownload(item({ viewUrl: "http://x/1" }), t);
    expect(openUrl).toHaveBeenCalledTimes(1);
  });

  it("onClickFavorite -> filesActionsStore.setFavoriteAction", () => {
    const setFavoriteAction = vi.fn(async () => {});
    const store = createTestContextOptionsStore({
      filesActionsStore: { setFavoriteAction },
    });
    store.onClickFavorite("mark" as never, [item()] as never, t);
    expect(setFavoriteAction).toHaveBeenCalledTimes(1);
  });

  it("onClickDownloadEncrypted (folder) -> filesActionsStore.downloadFiles", () => {
    const downloadFiles = vi.fn(async () => {});
    const store = createTestContextOptionsStore({
      filesActionsStore: { downloadFiles },
    });
    store.onClickDownloadEncrypted(item({ isFolder: true }), t);
    expect(downloadFiles).toHaveBeenCalledTimes(1);
  });

  it("onDownloadAllAction -> filesActionsStore.downloadAction", () => {
    const downloadAction = vi.fn(async () => {});
    const store = createTestContextOptionsStore({
      filesActionsStore: { downloadAction },
      selectedFolderStore: { getSelectedFolder: () => ({ id: 1 }) },
    });
    store.onDownloadAllAction();
    expect(downloadAction).toHaveBeenCalledTimes(1);
  });

  it("onEmptyPersonalAction -> dialogsStore.setEmptyTrashDialogVisible(true)", () => {
    const setEmptyTrashDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setEmptyTrashDialogVisible },
      filesActionsStore: { emptyPersonalRoomInProgress: false },
    });
    store.onEmptyPersonalAction();
    expect(setEmptyTrashDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onShowTemplateGallery -> oformsStore.setTemplateGalleryVisible(true)", () => {
    const setTemplateGalleryVisible = vi.fn();
    const store = createTestContextOptionsStore({
      oformsStore: { setTemplateGalleryVisible, setOformFromFolderId: vi.fn() },
    });
    store.onShowTemplateGallery();
    expect(setTemplateGalleryVisible).toHaveBeenCalledWith(true);
  });

  it("onPreviewClick -> filesStore.openDocEditor (preview)", () => {
    const openDocEditor = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { openDocEditor },
    });
    store.onPreviewClick(item());
    expect(openDocEditor).toHaveBeenCalledTimes(1);
    expect(openDocEditor.mock.calls[0][1]).toBe(true); // preview flag
  });

  it("onClickRename dispatches the rename event", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore();
    store.onClickRename(item());
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });
});
