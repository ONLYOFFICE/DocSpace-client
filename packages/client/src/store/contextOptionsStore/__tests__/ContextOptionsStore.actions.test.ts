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

// The onXxx handlers are thin delegators to the injected stores. A vi.fn passed
// via an override keeps its identity through the store (MobX does not wrap the
// function values of a nested observable object), so asserting the held spy is
// reliable — unlike spying the store's own action fields.
const item = (over: Record<string, unknown> = {}) =>
  ({ id: 1, isFolder: false, fileExst: ".docx", ...over }) as never;

describe("ContextOptionsStore — action handler delegation", () => {
  it("onSelect -> filesActionsStore.onSelectItem", () => {
    const onSelectItem = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { onSelectItem },
    });
    store.onSelect(item());
    expect(onSelectItem).toHaveBeenCalledWith(
      { id: 1, isFolder: false },
      true,
      false,
    );
  });

  it("onOpenLocation -> filesActionsStore.checkAndOpenLocationAction", () => {
    const checkAndOpenLocationAction = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { checkAndOpenLocationAction },
    });
    store.onOpenLocation(item());
    expect(checkAndOpenLocationAction).toHaveBeenCalledTimes(1);
  });

  it("onDuplicate -> filesActionsStore.duplicateAction", () => {
    const duplicateAction = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { duplicateAction },
    });
    store.onDuplicate(item(), t);
    expect(duplicateAction).toHaveBeenCalledTimes(1);
  });

  it("onClickPin -> filesActionsStore.setPinAction", () => {
    const setPinAction = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { setPinAction },
    });
    store.onClickPin("pin" as never, item(), t);
    expect(setPinAction).toHaveBeenCalledTimes(1);
    expect(setPinAction.mock.calls[0][0]).toBe("pin");
  });

  it("onClickMarkRead -> filesActionsStore.markAsRead", () => {
    const markAsRead = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { markAsRead },
    });
    store.onClickMarkRead(item());
    expect(markAsRead).toHaveBeenCalledTimes(1);
  });

  it("onExportRoomIndex -> filesActionsStore.exportRoomIndex", () => {
    const exportRoomIndex = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { exportRoomIndex },
    });
    store.onExportRoomIndex(t, 42);
    expect(exportRoomIndex).toHaveBeenCalledWith(t, 42);
  });

  it("gotoDocEditor -> filesStore.openDocEditor", () => {
    const openDocEditor = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { openDocEditor },
    });
    store.gotoDocEditor(item());
    expect(openDocEditor).toHaveBeenCalledTimes(1);
    expect(openDocEditor.mock.calls[0][0]).toBe(1);
  });

  it("onChangeRoomOwner -> dialogsStore.setChangeRoomOwnerIsVisible(true)", () => {
    const setChangeRoomOwnerIsVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setChangeRoomOwnerIsVisible },
    });
    store.onChangeRoomOwner();
    expect(setChangeRoomOwnerIsVisible).toHaveBeenCalledWith(true);
  });

  it("onLeaveRoom -> dialogsStore.setLeaveRoomDialogVisible(true)", () => {
    const setLeaveRoomDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setLeaveRoomDialogVisible },
    });
    store.onLeaveRoom();
    expect(setLeaveRoomDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onRestoreAction -> dialogsStore.setRestorePanelVisible(true)", () => {
    const setRestorePanelVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setRestorePanelVisible },
    });
    store.onRestoreAction();
    expect(setRestorePanelVisible).toHaveBeenCalledWith(true);
  });

  it("onEmptyTrashAction -> dialogsStore.setEmptyTrashDialogVisible(true) when idle", () => {
    const setEmptyTrashDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setEmptyTrashDialogVisible },
      filesStore: { activeFiles: [], activeFolders: [] },
      filesActionsStore: { emptyTrashInProgress: false },
    });
    store.onEmptyTrashAction();
    expect(setEmptyTrashDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onEmptyTrashAction is a no-op while an operation is in progress", () => {
    const setEmptyTrashDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setEmptyTrashDialogVisible },
      filesStore: { activeFiles: [], activeFolders: [] },
      filesActionsStore: { emptyTrashInProgress: true },
    });
    store.onEmptyTrashAction();
    expect(setEmptyTrashDialogVisible).not.toHaveBeenCalled();
  });
});
