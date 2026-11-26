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

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/shared/utils", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  isDesktop: () => true,
}));

import { FolderType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";

/** A store open on `folder`, its rooms filter listing `type`. */
const storeIn = (folder: Record<string, unknown>, type?: string[]) => {
  const store = createTestFilesStore({
    selectedFolderStore: { rootFolderType: FolderType.AiHub, isRootFolder: true, ...folder },
  });
  if (type) store.roomsFilter.type = type;
  store.createThumbnails = vi.fn() as never;
  return store;
};

describe("FilesStore.viewAs - the AI section's own lists", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the agents as tiles, and the skill sets and knowledge bases as rows, by default", () => {
    expect(storeIn({}, [String(RoomsType.AiProjectRoom)]).viewAs).toBe("tile");
    expect(storeIn({}, [String(RoomsType.InstructionsRoom)]).viewAs).toBe("table");
    expect(storeIn({}, [String(RoomsType.KnowledgeRoom)]).viewAs).toBe("table");
    // Inside a skill set and a knowledge base.
    expect(storeIn({ isRootFolder: false, roomType: RoomsType.InstructionsRoom }).viewAs).toBe("table");
    expect(storeIn({ isRootFolder: false, parentRoomType: FolderType.KnowledgeRoom }).viewAs).toBe("table");
  });

  it("keeps a view picked for one list to that list, apart from the rest of Files", () => {
    const agents = storeIn({}, [String(RoomsType.AiProjectRoom)]);
    agents.setViewAs("table");
    expect(agents.viewAs).toBe("table");
    expect(window.localStorage.getItem("viewAs")).toBeNull();
    // Read afresh: the agents keep the pick.
    expect(storeIn({}, [String(RoomsType.AiProjectRoom)]).viewAs).toBe("table");

    const skills = storeIn({}, [String(RoomsType.InstructionsRoom)]);
    skills.setViewAs("tile");
    expect(storeIn({}, [String(RoomsType.KnowledgeRoom)]).viewAs).toBe("tile");
    expect(storeIn({}, [String(RoomsType.AiProjectRoom)]).viewAs).toBe("table");

    // A pick elsewhere in Files leaves the AI lists alone.
    storeIn({ rootFolderType: FolderType.USER }).setViewAs("row");
    expect(window.localStorage.getItem("viewAs")).toBe("row");
    expect(storeIn({}, [String(RoomsType.KnowledgeRoom)]).viewAs).toBe("tile");
  });
});
