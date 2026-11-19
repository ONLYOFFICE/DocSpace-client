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

import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { createTestContextOptionsStore, menuShape, t } from "./testHarness";

beforeEach(() => {
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", state: {} },
    navigate: vi.fn(),
  };
});

describe("ContextOptionsStore.getFolderModel — characterization", () => {
  it("returns null without the Create permission", () => {
    const store = createTestContextOptionsStore(); // security = {}
    expect(store.getFolderModel(t)).toBeNull();
  });

  it("builds the create model when Create is allowed", () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: { security: { Create: true } },
    });
    const model = store.getFolderModel(t);
    expect(Array.isArray(model)).toBe(true);
    expect(menuShape(model as unknown[])).toMatchSnapshot();
  });

  it("Create menu opened", () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: { security: { Create: true } },
      treeFoldersStore: { isPrivacyFolder: true },
      uploadDataStore: { shouldEncryptCurrentUpload: () => true },
    });
    const model = store.getFolderModel(t) as { key: string }[];

    expect(model.map((option) => option.key)).toEqual([
      "new-document",
      "new-spreadsheet",
      "new-presentation",
      "new-pdf-form",
      "new-folder",
      "separator",
      "upload-files",
    ]);
  });
});

describe("ContextOptionsStore.getFolderModel — Knowledge room", () => {
  const knowledgeRoom = { security: { Create: true }, roomType: RoomsType.KnowledgeRoom };

  it("offers the workspace and device uploads, in the empty view's order", () => {
    const store = createTestContextOptionsStore({ selectedFolderStore: knowledgeRoom });
    expect(menuShape(store.getFolderModel(t) as unknown[])).toEqual([
      { key: "upload-from-storage", label: "EmptyView:UploadFromPortalTitle" },
      { key: "upload-from-device", label: "EmptyView:UploadDeviceOptionTitle" },
    ]);
  });

  it("offers nothing while vectorization is off", () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: knowledgeRoom,
      settingsStore: { aiConfig: { vectorizationEnabled: false } },
    });
    expect(store.getFolderModel(t)).toBeNull();
  });
});

describe("ContextOptionsStore.getFolderModel — Instructions room", () => {
  const instructionsRoom = { security: { Create: true }, roomType: RoomsType.InstructionsRoom };

  it("offers a skill from the template, the workspace and device uploads, and a skill written by AI", () => {
    const store = createTestContextOptionsStore({ selectedFolderStore: instructionsRoom });
    expect(menuShape(store.getFolderModel(t) as unknown[])).toEqual([
      { key: "new-markdown", label: "Common:MarkdownFile" },
      { key: "separator", label: undefined },
      { key: "upload-from-storage", label: "EmptyView:UploadFromPortalTitle" },
      { key: "upload-from-device", label: "EmptyView:UploadDeviceOptionTitle" },
      { key: "create-skill-with-ai", label: "Common:CreateSkillWithAI" },
    ]);
  });

  it("keeps them all while vectorization is off", () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: instructionsRoom,
      settingsStore: { aiConfig: { vectorizationEnabled: false } },
    });
    expect(menuShape(store.getFolderModel(t) as unknown[])).toHaveLength(5);
  });

  // The template needs the AI service, not a model; writing with AI needs both.
  it.each([
    [
      "the template and the uploads while AI is not set up on the portal",
      { aiReady: false },
      ["new-markdown", "separator", "upload-from-storage", "upload-from-device"],
    ],
    [
      "only the uploads while AI services are off",
      { aiServicesEnabled: false },
      ["upload-from-storage", "upload-from-device"],
    ],
  ])("keeps %s", (_, settingsStore, keys) => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: instructionsRoom,
      settingsStore,
    });
    expect(
      menuShape(store.getFolderModel(t) as unknown[]).map(
        (item) => (item as { key: string }).key,
      ),
    ).toEqual(keys);
  });

  it("offers the skill while it is not known yet whether AI is set up", () => {
    const store = createTestContextOptionsStore({
      selectedFolderStore: instructionsRoom,
      settingsStore: { aiReady: null },
    });
    expect(menuShape(store.getFolderModel(t) as unknown[])).toHaveLength(5);
  });
});

describe("ContextOptionsStore.getGroupContextOptions — characterization", () => {
  it("builds the group (multi-selection) model", () => {
    const store = createTestContextOptionsStore({
      filesStore: {
        selection: [
          {
            id: 1,
            fileExst: ".docx",
            security: {},
            contextOptions: ["move-to", "copy-to", "download", "delete"],
          },
          {
            id: 2,
            fileExst: ".docx",
            security: {},
            contextOptions: ["move-to", "copy-to", "download", "delete"],
          },
        ],
      },
    });
    const model = store.getGroupContextOptions(t);
    expect(Array.isArray(model)).toBe(true);
    expect(menuShape(model)).toMatchSnapshot();
  });

  // Bug 84823: the server keeps granting CreateRoomFrom when the Rooms app is
  // switched off; the entry is disabled, which the menu then leaves out.
  it("disables create-room while the Rooms app is off", () => {
    const createRoomDisabled = (isRoomsSectionOff: boolean) => {
      const store = createTestContextOptionsStore({
        filesStore: {
          isRoomsSectionOff,
          selection: [
            {
              id: 1,
              fileExst: ".docx",
              security: { CreateRoomFrom: true },
              contextOptions: [],
            },
          ],
        },
      });
      const option = (
        store.getGroupContextOptions(t) as Array<{
          key?: string;
          disabled?: boolean;
        }>
      ).find((o) => o.key === "create-room");
      return option?.disabled;
    };

    expect(createRoomDisabled(false)).toBe(false);
    expect(createRoomDisabled(true)).toBe(true);
  });
});

describe("ContextOptionsStore.getGroupContextOptions — Private section", () => {
  const ROOM_GROUP_KEYS = ["create-group", "add-to-group", "remove-from-group"];

  const keysFor = (pathname: string) => {
    window.history.pushState({}, "", pathname);
    const store = createTestContextOptionsStore({
      treeFoldersStore: { isRoomsFolder: true },
      filesSettingsStore: { organizeRoomsGrouping: true },
      dialogsStore: { roomGroups: [{ id: "g1", name: "Team" }] },
      filesStore: {
        roomsFilter: { groupId: "g1" },
        selection: [
          { id: 1, private: true, security: {}, contextOptions: [] },
          { id: 2, private: true, security: {}, contextOptions: [] },
        ],
      },
    });
    return menuShape(store.getGroupContextOptions(t)).map((m) => m.key);
  };

  afterEach(() => window.history.pushState({}, "", "/"));

  it("Context menu of a private room in the section", () => {
    const inRooms = keysFor("/rooms/shared/filter");
    const inPrivate = keysFor("/private/filter");

    // Spec: private-rooms/sidebar-section, "Room groups in the section"
    expect(inRooms).toEqual(expect.arrayContaining(ROOM_GROUP_KEYS));
    expect(inPrivate).toEqual(inRooms);
  });
});

describe("ContextOptionsStore.getHeaderOptions — characterization", () => {
  const item = () => ({ id: 1, security: { Download: true } });

  it("builds header options for the default (non-public) view", () => {
    const store = createTestContextOptionsStore();
    const model = store.getHeaderOptions(t, item() as never);
    expect(Array.isArray(model)).toBe(true);
    expect(menuShape(model)).toMatchSnapshot();
  });

  it("builds the public-room header (copy link + download)", () => {
    const store = createTestContextOptionsStore({
      publicRoomStore: { isPublicRoom: true },
    });
    const keys = menuShape(store.getHeaderOptions(t, item() as never)).map(
      (m) => m.key,
    );
    expect(keys).toContain("public-room_share");
  });
});
