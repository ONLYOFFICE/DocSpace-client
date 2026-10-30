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

import { describe, it, expect, beforeEach, vi } from "vitest";

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
