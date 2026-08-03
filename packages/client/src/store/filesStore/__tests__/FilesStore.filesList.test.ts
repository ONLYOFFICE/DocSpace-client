// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, beforeEach } from "vitest";
import { FileType, FolderType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

// getFilesListItems maps raw file/folder/room records to enriched list items.
// It embeds the result of getFilesContextOptions (a separate, deeply-coupled
// method — Phase 2's target) verbatim under `contextOptions`. To characterize
// the *mapping* logic in isolation, we stub getFilesContextOptions with a
// sentinel and let getItemUrl run for real (a Phase 4 target, characterized
// here as a byproduct — its output depends only on the jsdom origin).
const CTX_SENTINEL = ["ctx-stub"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

const documentFile = (): TItem =>
  ({
    id: 1,
    parentId: 10,
    title: "Report.docx",
    fileExst: ".docx",
    fileType: FileType.Document,
    rootFolderId: 5,
    security: { EditAccess: true, EditRoom: true, ChangeOwner: true },
    viewAccessibility: {},
  }) as unknown as TItem;

const oformFile = (): TItem =>
  ({
    id: 2,
    parentId: 10,
    title: "Contract.oform",
    fileExst: ".oform",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as unknown as TItem;

const plainFolder = (): TItem =>
  ({
    id: 3,
    parentId: 10,
    title: "Documents",
    isFolder: true,
    viewAccessibility: {},
  }) as unknown as TItem;

const customRoom = (): TItem =>
  ({
    id: 4,
    title: "Team Room",
    roomType: RoomsType.CustomRoom,
    logo: { medium: "room-logo.png" },
    viewAccessibility: {},
  }) as unknown as TItem;

const aiAgentRoom = (): TItem =>
  ({
    id: 5,
    title: "AI Agent",
    roomType: RoomsType.AIRoom,
    rootFolderType: FolderType.AIAgents,
    security: { EditAccess: true, EditRoom: true, ChangeOwner: true },
    viewAccessibility: {},
  }) as unknown as TItem;

describe("FilesStore.getFilesListItems — characterization", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    store.files = [];
    store.folders = [];
    // Isolate the mapping from the context-menu builder (Phase 2 concern).
    store.getFilesContextOptions = () => CTX_SENTINEL;
  });

  it("maps a document file: flags, passthrough title, embedded context options", () => {
    const [item] = store.getFilesListItems([documentFile()]);

    expect(item.id).toBe(1);
    expect(item.isFolder).toBe(false);
    expect(item.isRoom).toBe(false);
    expect(item.isAIAgent).toBe(false);
    expect(item.isForm).toBe(false);
    expect(item.title).toBe("Report.docx");
    expect(item.contextOptions).toBe(CTX_SENTINEL);
    expect(item.icon).toBe("icon.svg");
  });

  it("flags .oform files as forms", () => {
    const [item] = store.getFilesListItems([oformFile()]);
    expect(item.isForm).toBe(true);
  });

  it("detects a folder via item.isFolder and via store.folders membership", () => {
    const [byFlag] = store.getFilesListItems([plainFolder()]);
    expect(byFlag.isFolder).toBe(true);

    // The membership path only wins when the item carries NO `isFolder` key:
    // the return spreads `...rest` AFTER `isFolder`, and `isFolder` is not
    // destructured out, so an explicit `item.isFolder` would clobber the
    // computed value. Characterized here to lock that in through the refactor.
    const noFlag = {
      id: 3,
      parentId: 10,
      title: "Documents",
      viewAccessibility: {},
    } as unknown as TItem;
    store.folders = [{ id: noFlag.id, parentId: noFlag.parentId } as never];
    const [byMembership] = store.getFilesListItems([noFlag]);
    expect(byMembership.isFolder).toBe(true);
  });

  it("uses logo.medium as the icon for a room and marks isRoom", () => {
    const [item] = store.getFilesListItems([customRoom()]);
    expect(item.isRoom).toBe(true);
    expect(item.icon).toBe("room-logo.png");
    expect(item.defaultRoomIcon).toBe("icon.svg");
  });

  it("marks an AI agent room and applies the aiConfig security transform", () => {
    // With aiReadyNeedReset undefined, EditAccess/EditRoom/ChangeOwner stay truthy.
    const [item] = store.getFilesListItems([aiAgentRoom()]);
    expect(item.isAIAgent).toBe(true);
    expect(item.isRoom).toBe(true);
    expect(item.security).toMatchObject({
      EditAccess: true,
      EditRoom: true,
      ChangeOwner: true,
    });
  });

  it("resets AI-agent edit security when aiReadyNeedReset is set", () => {
    store = createTestFilesStore({
      settingsStore: { aiConfig: { aiReadyNeedReset: true } },
    });
    store.folders = [];
    store.getFilesContextOptions = () => CTX_SENTINEL;

    const [item] = store.getFilesListItems([aiAgentRoom()]);
    const security = item.security as Record<string, unknown>;
    expect(security.EditAccess).toBeFalsy();
    expect(security.EditRoom).toBeFalsy();
    expect(security.ChangeOwner).toBeFalsy();
  });

  it("produces a stable shape for a mixed set (snapshot)", () => {
    const items = store.getFilesListItems([
      documentFile(),
      plainFolder(),
      customRoom(),
      aiAgentRoom(),
    ]);

    // Normalize volatile url fields (depend on jsdom origin) to keep the
    // snapshot focused on mapping semantics while still asserting presence.
    const normalized = items.map((i) => ({
      ...i,
      href: typeof i.href === "string" ? "<url>" : i.href,
      folderUrl: typeof i.folderUrl === "string" ? "<url>" : i.folderUrl,
      previewUrl: typeof i.previewUrl === "string" ? "<url>" : i.previewUrl,
      contextOptions: "<ctx>",
    }));

    expect(normalized).toMatchSnapshot();
  });
});
