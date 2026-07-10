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

describe("ContextOptionsStore — action handler delegation (batch 9)", () => {
  it("showConvertDialog -> dialogsStore.setConvertDialogVisible(true)", () => {
    const setConvertDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: {
        setConvertDialogVisible,
        setConvertItem: vi.fn(),
        setConvertDialogData: vi.fn(),
      },
    });
    store.showConvertDialog(item());
    expect(setConvertDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onClickDelete on the current folder delegates to the folder-delete flow", () => {
    const setDeleteDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: {
        setDeleteDialogVisible,
        setIsFolderActions: vi.fn(),
        setIsRoomDelete: vi.fn(),
      },
      filesSettingsStore: { confirmDelete: true },
      selectedFolderStore: { id: 1, getSelectedFolder: () => ({}) },
      filesStore: { setBufferSelection: vi.fn(), isThirdPartySelection: false },
    });
    store.onClickDelete(item({ id: 1, isFolder: true, isRoom: false }), t);
    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onRestoreAllArchiveAction -> dialogsStore.setRestoreAllArchive(true) when idle", () => {
    const setRestoreAllArchive = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { activeFiles: [], activeFolders: [] },
      currentQuotaStore: { isWarningRoomsDialog: false },
      dialogsStore: {
        setRestoreAllArchive,
        setQuotaWarningDialogVisible: vi.fn(),
        setRestoreRoomDialogVisible: vi.fn(),
      },
    });
    store.onRestoreAllArchiveAction();
    expect(setRestoreAllArchive).toHaveBeenCalledWith(true);
  });

  it("onCreate dispatches the create event for a non-PDF format", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore();
    store.onCreate("docx", t);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });

  it("onRemoveSharedFilesOrFolder is a no-op for an empty list", async () => {
    const addActiveItems = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { addActiveItems },
    });
    await store.onRemoveSharedFilesOrFolder([]);
    expect(addActiveItems).not.toHaveBeenCalled();
  });

  it("onClickReconnectStorage -> dialogsStore.setRoomCreation(true)", async () => {
    const setRoomCreation = vi.fn();
    const store = createTestContextOptionsStore({
      filesSettingsStore: {
        thirdPartyStore: {
          openConnectWindow: vi.fn(async () => ({})),
          connectItems: [{ providerName: "gd", oauthHref: "http://x" }],
        },
      },
      dialogsStore: {
        setRoomCreation,
        setConnectItem: vi.fn(),
        setConnectDialogVisible: vi.fn(),
        setIsConnectDialogReconnect: vi.fn(),
        setSaveAfterReconnectOAuth: vi.fn(),
      },
    });
    await store.onClickReconnectStorage(
      item({ providerKey: "gd", providerId: 7 }),
      t,
    );
    expect(setRoomCreation).toHaveBeenCalledWith(true);
  });
});
