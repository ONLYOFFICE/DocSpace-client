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

vi.mock("SRC_DIR/helpers/info-panel", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  showInfoPanel: vi.fn(),
}));

import { showInfoPanel } from "SRC_DIR/helpers/info-panel";

import { createTestContextOptionsStore, t } from "./testHarness";

const item = (over: Record<string, unknown> = {}) =>
  ({ id: 1, isFolder: false, fileExst: ".docx", ...over }) as never;

describe("ContextOptionsStore — action handler delegation (batch 10)", () => {
  it("onCreateAndCopySharedLink (non-expired) -> filesStore.getPrimaryLink", async () => {
    const getPrimaryLink = vi.fn(async () => ({
      sharedTo: { shareLink: "http://x" },
    }));
    const store = createTestContextOptionsStore({
      filesActionsStore: { isExpiredLinkAsync: vi.fn(async () => false) },
      filesStore: { getPrimaryLink },
      filesSettingsStore: { isLinkBlockedByAdmin: () => false },
      publicRoomStore: { setExternalLink: vi.fn() },
    });
    await store.onCreateAndCopySharedLink(item({ external: false }), t);
    expect(getPrimaryLink).toHaveBeenCalledWith(1);
  });

  it("onOpenFolder (non-expired, unprotected) -> filesActionsStore.openLocationAction", async () => {
    const openLocationAction = vi.fn();
    const store = createTestContextOptionsStore({
      filesActionsStore: {
        isExpiredLinkAsync: vi.fn(async () => false),
        openLocationAction,
      },
    });
    await store.onOpenFolder(item({ external: false, isFolder: true }), t);
    expect(openLocationAction).toHaveBeenCalledTimes(1);
  });

  it("onClickSubmitToFormGallery -> dialogsStore.setSubmitToGalleryDialogVisible(true)", () => {
    const setSubmitToGalleryDialogVisible = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: {
        setSubmitToGalleryDialogVisible,
        setFormItem: vi.fn(),
      },
    });
    store.onClickSubmitToFormGallery(item({ title: "Form.pdf" }));
    expect(setSubmitToGalleryDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onShowOformTemplateInfo -> showInfoPanel + oformsStore.setGallerySelected", () => {
    const setGallerySelected = vi.fn();
    const store = createTestContextOptionsStore({
      oformsStore: { setGallerySelected },
    });
    store.onShowOformTemplateInfo(item() as never);
    expect(showInfoPanel).toHaveBeenCalledTimes(1);
    expect(setGallerySelected).toHaveBeenCalledTimes(1);
  });
});
