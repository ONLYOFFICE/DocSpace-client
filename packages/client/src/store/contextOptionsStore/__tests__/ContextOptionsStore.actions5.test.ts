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

vi.mock("@docspace/shared/components/guidance/configs", () => ({
  getGuidanceConfig: vi.fn(() => ({ id: "cfg" })),
}));

import { createTestContextOptionsStore, t } from "./testHarness";

describe("ContextOptionsStore — action handler delegation (batch 8)", () => {
  it("onRemoveRoomsFromGroup no-ops without a current group", async () => {
    const updateRoomGroup = vi.fn(async () => {});
    const store = createTestContextOptionsStore({
      filesStore: { roomsFilter: { groupId: undefined } },
      dialogsStore: { updateRoomGroup },
    });
    await store.onRemoveRoomsFromGroup([1], t);
    expect(updateRoomGroup).not.toHaveBeenCalled();
  });

  it("onCreateTemplate hides the gallery info panel and dispatches create", () => {
    const setIsVisibleInfoPanelTemplateGallery = vi.fn();
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore({
      oformsStore: {
        setIsVisibleInfoPanelTemplateGallery,
        currentExtensionGallery: ".docx",
        gallerySelected: { attributes: { name_form: "Form" } },
      },
    });
    store.onCreateTemplate();
    expect(setIsVisibleInfoPanelTemplateGallery).toHaveBeenCalledWith(false);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });

  it("onEnableFormFillingGuid -> guidanceStore.setConfig + tips dialog", () => {
    const setConfig = vi.fn();
    const setWelcomeFormFillingTipsVisible = vi.fn();
    const store = createTestContextOptionsStore({
      guidanceStore: { setConfig },
      dialogsStore: { setWelcomeFormFillingTipsVisible },
    });
    store.onEnableFormFillingGuid(t);
    expect(setConfig).toHaveBeenCalledTimes(1);
    expect(setWelcomeFormFillingTipsVisible).toHaveBeenCalledWith(true);
  });

  it("onClickMakeForm -> uploadDataStore.copyAsAction (make-form conversion)", () => {
    const copyAsAction = vi.fn(() => Promise.resolve());
    const store = createTestContextOptionsStore({
      filesSettingsStore: { extsWebRestrictedEditing: [".docxf"] },
      uploadDataStore: { copyAsAction },
    });
    store.onClickMakeForm(
      { id: 1, title: "Doc.docx", fileExst: ".docx", folderId: 10 } as never,
      t,
    );
    // newTitle = "Doc" + ".docxf"
    expect(copyAsAction).toHaveBeenCalledWith(1, "Doc.docxf", 10);
  });
});
