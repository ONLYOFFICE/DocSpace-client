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

import { RoomsType } from "@docspace/ui-kit/enums";
import { Events } from "@docspace/shared/enums";

import { createTestContextOptionsStore, t } from "./testHarness";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  createFile: vi.fn(async () => ({ id: 42, title: "Form.pdf" })),
}));

const { createFile } = await import("@docspace/shared/api/files");

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
        gallerySelected: { title: "Form" },
      },
    });
    store.onCreateTemplate();
    expect(setIsVisibleInfoPanelTemplateGallery).toHaveBeenCalledWith(false);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });

  it("onCreateTemplate in room-from-template mode opens the FormRoom dialog with no request", async () => {
    const setTemplateGalleryVisible = vi.fn();
    const setFormTemplateForNewRoom = vi.fn();
    const setGallerySelected = vi.fn();
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");

    const store = createTestContextOptionsStore({
      oformsStore: {
        setIsVisibleInfoPanelTemplateGallery: vi.fn(),
        setTemplateGalleryVisible,
        setFormTemplateForNewRoom,
        setGallerySelected,
        createRoomFromTemplate: true,
        currentExtensionGallery: ".pdf",
        gallerySelected: { id: 7, title: "Form" },
      },
    });

    await store.onCreateTemplate();

    // Nothing is requested up front -- the dialog opens immediately.
    expect(createFile).not.toHaveBeenCalled();

    // The pick is recorded for CreateEditRoomStore to create inside the room.
    expect(setFormTemplateForNewRoom).toHaveBeenCalledWith({
      id: 7,
      title: "Form",
      extension: "pdf",
    });
    // ...and consumed, so a stray create cannot pop the file naming dialog.
    expect(setGallerySelected).toHaveBeenCalledWith(null);
    expect(setTemplateGalleryVisible).toHaveBeenCalledWith(false);

    const event = dispatchEvent.mock.calls[0][0] as CustomEvent & {
      title?: string;
      payload?: { startRoomType?: number };
    };
    expect(event.type).toBe(Events.ROOM_CREATE);
    expect(event.payload?.startRoomType).toBe(RoomsType.FormRoom);
    // The room name is prefilled with the template's name.
    expect(event.title).toBe("Form");
    dispatchEvent.mockRestore();
  });

  it("onCreateTemplate no-ops once the gallery selection has been consumed", async () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestContextOptionsStore({
      oformsStore: {
        setIsVisibleInfoPanelTemplateGallery: vi.fn(),
        createRoomFromTemplate: false,
        currentExtensionGallery: ".pdf",
        gallerySelected: null,
      },
    });

    await store.onCreateTemplate();

    // No "New PDF form" dialog on top of the freshly created room.
    expect(dispatchEvent).not.toHaveBeenCalled();
    dispatchEvent.mockRestore();
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
