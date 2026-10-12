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
  ({ id: 1, isFolder: false, fileExst: ".docx", providerKey: "gd", ...over }) as never;

describe("ContextOptionsStore — action handler delegation (batch 3)", () => {
  it("onClickDownloadAs -> dialogsStore.setDownloadDialogVisible(true)", () => {
    const setDownloadDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setDownloadDialogVisible },
    });
    store.onClickDownloadAs();
    expect(setDownloadDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onSetUpCustomFilter -> filesActionsStore.changeCustomFilter", () => {
    const changeCustomFilter = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { changeCustomFilter },
    });
    store.onSetUpCustomFilter(item(), t);
    expect(changeCustomFilter).toHaveBeenCalledTimes(1);
  });

  it("onChangeThirdPartyInfo -> filesActionsStore.setThirdpartyInfo", () => {
    const setThirdpartyInfo = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { setThirdpartyInfo },
    });
    store.onChangeThirdPartyInfo("gd" as never);
    expect(setThirdpartyInfo).toHaveBeenCalledWith("gd");
  });

  it("onFillingStatus -> dialogsStore.setFillingStatusPanelVisible(true)", () => {
    const setFillingStatusPanelVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setFillingStatusPanelVisible },
    });
    store.onFillingStatus(item());
    expect(setFillingStatusPanelVisible).toHaveBeenCalledWith(true);
  });

  it("onOpenPDFEditDialog -> filesStore.openDocEditor(id, false, null, true)", () => {
    const openDocEditor = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { openDocEditor },
    });
    store.onOpenPDFEditDialog(7 as never);
    expect(openDocEditor).toHaveBeenCalledWith(7, false, null, true);
  });

  it("onCreateRoomTemplate -> filesActionsStore.onCreateRoomFromTemplate", () => {
    const onCreateRoomFromTemplate = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: { onCreateRoomFromTemplate },
    });
    store.onCreateRoomTemplate(item());
    expect(onCreateRoomFromTemplate).toHaveBeenCalledTimes(1);
  });

  it("onOpenTemplateAccessOptions -> dialogsStore.setTemplateAccessSettingsVisible(true)", () => {
    const setTemplateAccessSettingsVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setTemplateAccessSettingsVisible },
    });
    store.onOpenTemplateAccessOptions();
    expect(setTemplateAccessSettingsVisible).toHaveBeenCalledWith(true);
  });

  it("onRestoreAllAction -> dialogsStore.setRestoreAllPanelVisible(true) when idle", () => {
    const setRestoreAllPanelVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setRestoreAllPanelVisible },
      filesStore: { activeFiles: [], activeFolders: [] },
    });
    store.onRestoreAllAction();
    expect(setRestoreAllPanelVisible).toHaveBeenCalledWith(true);
  });

  it("onShowAiKnowledgeSelectFileDialog -> dialogsStore.setSelectFileAiKnowledgeDialogVisible(true)", () => {
    const setSelectFileAiKnowledgeDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setSelectFileAiKnowledgeDialogVisible },
    });
    store.onShowAiKnowledgeSelectFileDialog();
    expect(setSelectFileAiKnowledgeDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onShowFormRoomSelectFileDialog -> dialogsStore.setSelectFileFormRoomDialogVisible", () => {
    const setSelectFileFormRoomDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setSelectFileFormRoomDialogVisible },
    });
    store.onShowFormRoomSelectFileDialog();
    expect(setSelectFileFormRoomDialogVisible.mock.calls[0][0]).toBe(true);
  });
});

describe("ContextOptionsStore — action handler delegation (batch 4)", () => {
  it("onMoveAction -> dialogsStore.setMoveToPanelVisible(true)", () => {
    const setMoveToPanelVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setMoveToPanelVisible, setIsFolderActions: vi.fn() },
    });
    store.onMoveAction(item());
    expect(setMoveToPanelVisible).toHaveBeenCalledWith(true);
  });

  it("onCopyAction -> dialogsStore.setCopyPanelVisible(true)", () => {
    const setCopyPanelVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setCopyPanelVisible, setIsFolderActions: vi.fn() },
    });
    store.onCopyAction(item());
    expect(setCopyPanelVisible).toHaveBeenCalledWith(true);
  });

  it("showVersionHistory -> versionHistoryStore.setIsVerHistoryPanel(true)", () => {
    const setIsVerHistoryPanel = vi.fn();
    const fetchFileVersions = vi.fn();
    const store = createTestContextOptionsStore({
      versionHistoryStore: { setIsVerHistoryPanel, fetchFileVersions },
    });
    store.showVersionHistory(1);
    expect(fetchFileVersions).toHaveBeenCalledTimes(1);
    expect(setIsVerHistoryPanel).toHaveBeenCalledWith(true);
  });

  it("onCreateRoom shows the quota warning when the rooms limit is reached", () => {
    const setQuotaWarningDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      currentQuotaStore: { isWarningRoomsDialog: true },
      dialogsStore: { setQuotaWarningDialogVisible },
    });
    store.onCreateRoom();
    expect(setQuotaWarningDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onClickInviteUsers opens the invite panel outside a grace period", () => {
    const setInvitePanelOptions = vi.fn();
    const store = createTestContextOptionsStore({
      currentTariffStatusStore: { isGracePeriod: false },
      dialogsStore: { setInvitePanelOptions },
    });
    store.onClickInviteUsers(9, undefined);
    expect(setInvitePanelOptions).toHaveBeenCalledWith(
      expect.objectContaining({ visible: true, roomId: 9 }),
    );
  });
});

describe("ContextOptionsStore — action handler delegation (batch 5)", () => {
  it("onClickUnsubscribe -> setUnsubscribe(true) + setDeleteDialogVisible(true)", () => {
    const setUnsubscribe = vi.fn();
    const setDeleteDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setUnsubscribe, setDeleteDialogVisible },
    });
    store.onClickUnsubscribe();
    expect(setUnsubscribe).toHaveBeenCalledWith(true);
    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onClickArchive('archive') -> dialogsStore.setArchiveDialogVisible(true)", () => {
    const setArchiveDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setArchiveDialogVisible },
    });
    store.onClickArchive("archive" as never);
    expect(setArchiveDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onClickArchive('unarchive') warns when the rooms limit is reached", () => {
    const setQuotaWarningDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      currentQuotaStore: { isWarningRoomsDialog: true },
      dialogsStore: { setQuotaWarningDialogVisible },
    });
    store.onClickArchive("unarchive" as never);
    expect(setQuotaWarningDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onCreateFormFromFile -> dialogsStore.setSelectFileDialogVisible(true)", () => {
    const setSelectFileDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setSelectFileDialogVisible },
    });
    store.onCreateFormFromFile(t);
    expect(setSelectFileDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onOpenEmbeddingSettings -> dialogsStore.setEmbeddingPanelData", () => {
    const setEmbeddingPanelData = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setEmbeddingPanelData, setLinkParams: vi.fn() },
    });
    store.onOpenEmbeddingSettings(item());
    expect(setEmbeddingPanelData).toHaveBeenCalledWith(
      expect.objectContaining({ visible: true }),
    );
  });

  it("onCreateAgent dispatches the agent-create event", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore();
    store.onCreateAgent();
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });

  it("onSaveAsTemplate dispatches the save-as-template event", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore();
    store.onSaveAsTemplate(item());
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });
});
