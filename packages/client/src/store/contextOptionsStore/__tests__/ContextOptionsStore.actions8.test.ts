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

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFileLink: vi.fn(async () => ({ sharedTo: { shareLink: "http://x" } })),
  getFolderLink: vi.fn(async () => ({ sharedTo: { shareLink: "http://x" } })),
  manageFormFilling: vi.fn(async () => undefined),
  formRoleMapping: vi.fn(async () => undefined),
}));
vi.mock("@docspace/shared/utils/copy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  copyShareLink: vi.fn(),
}));
vi.mock("SRC_DIR/components/dialogs/CreatedPDFFormDialog", () => ({
  showCreatedPDFFormDialog: vi.fn(),
}));

import {
  getFileLink,
  manageFormFilling,
  formRoleMapping,
} from "@docspace/shared/api/files";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { FolderType } from "@docspace/shared/enums";

import { createTestContextOptionsStore, t } from "./testHarness";

const item = (over: Record<string, unknown> = {}) =>
  ({ id: 1, isFolder: false, fileExst: ".docx", ...over }) as never;

describe("ContextOptionsStore — action handler delegation (batch 11)", () => {
  it("onClickLinkEdit (no convert) -> filesStore.openDocEditor", async () => {
    const openDocEditor = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { openDocEditor },
    });
    await store.onClickLinkEdit(item());
    expect(openDocEditor).toHaveBeenCalledTimes(1);
  });

  it("onClickLinkFillForm (regular file) -> filesStore.openDocEditor", () => {
    const openDocEditor = vi.fn();
    const store = createTestContextOptionsStore({
      filesStore: { openDocEditor },
    });
    store.onClickLinkFillForm(item());
    expect(openDocEditor).toHaveBeenCalledTimes(1);
  });

  it("onClickLinkFillForm (PDF form outside a form room) -> setFillPDFDialogData", () => {
    const setFillPDFDialogData = vi.fn();
    const store = createTestContextOptionsStore({
      dialogsStore: { setFillPDFDialogData },
    });
    store.onClickLinkFillForm(
      item({ isPDFForm: true, startFilling: false, security: { Copy: true } }),
    );
    expect(setFillPDFDialogData).toHaveBeenCalledWith(true, expect.anything());
  });

  it("onClickStartFilling (form room) -> api.manageFormFilling", async () => {
    const store = createTestContextOptionsStore({
      userStore: { user: { id: 1 } },
    });
    await store.onClickStartFilling(
      item({ parentRoomType: FolderType.FormRoom }),
      t,
    );
    expect(manageFormFilling).toHaveBeenCalledTimes(1);
  });

  it("onClickResetAndStartFilling -> api.formRoleMapping", async () => {
    const store = createTestContextOptionsStore({
      filesStore: { addActiveItems: vi.fn() },
      uploadDataStore: { clearActiveOperations: vi.fn() },
      filesActionsStore: { setGroupMenuBlocked: vi.fn() },
    });
    await store.onClickResetAndStartFilling(item());
    expect(formRoleMapping).toHaveBeenCalledWith({ formId: 1, roles: [] });
  });

  it("onCopyLink (shared file) -> copyShareLink with the resolved link", async () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: { shared: true, navigationPath: [] },
      filesSettingsStore: { isLinkBlockedByAdmin: () => false },
    });
    await store.onCopyLink(item({ canShare: true, href: "http://x" }), t);
    expect(getFileLink).toHaveBeenCalledWith(1);
    expect(copyShareLink).toHaveBeenCalledWith("http://x");
  });
});
