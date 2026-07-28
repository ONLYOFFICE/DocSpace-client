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

// getFilesContextOptions returns an array of option-id strings for an item,
// filtered by dozens of permission/state branches. The returned id lists are
// snapshotted per item kind — this is the tripwire that locks the exact
// branch behavior before extracting the ~1070-line method into a helper.

// Broad permission set so that most file options survive the filters; each
// individual `removeOptions` branch is still exercised where a flag is false.
const fileSecurity = {
  Edit: true,
  Delete: true,
  Copy: true,
  CopyLink: true,
  Duplicate: true,
  Download: true,
  Embed: true,
  CustomFilter: true,
  Rename: true,
  Lock: true,
  EditHistory: true,
  ReadHistory: true,
  FillForms: true,
  SubmitToFormGallery: true,
  FillingStatus: true,
  StartFilling: true,
  ResetFilling: true,
  StopFilling: true,
  OpenForm: true,
  EditForm: true,
  UpdateXlsx: true,
  AskAi: true,
  Move: true,
};

const roomSecurity = {
  EditRoom: true,
  EditAccess: true,
  Delete: true,
  Move: true,
  Pin: true,
  Read: true,
  Mute: true,
  ChangeOwner: true,
  Duplicate: true,
  Download: true,
};

const documentFile = (): TItem =>
  ({
    id: 1,
    parentId: 10,
    title: "Report.docx",
    fileExst: ".docx",
    contentLength: "12 KB",
    fileType: FileType.Document,
    rootFolderType: FolderType.USER,
    new: 0,
    fileStatus: 0,
    security: fileSecurity,
    viewAccessibility: {
      WebEdit: true,
      WebView: true,
      CanConvert: true,
      MustConvert: false,
    },
  }) as unknown as TItem;

const customRoom = (): TItem =>
  ({
    id: 3,
    title: "Team Room",
    roomType: RoomsType.CustomRoom,
    rootFolderType: FolderType.Rooms,
    inRoom: true,
    security: roomSecurity,
    viewAccessibility: {},
  }) as unknown as TItem;

const aiAgentRoom = (): TItem =>
  ({
    id: 4,
    title: "AI Agent",
    roomType: RoomsType.AIRoom,
    rootFolderType: FolderType.AIAgents,
    security: {
      EditAccess: true,
      EditRoom: true,
      Delete: true,
      Pin: true,
      Read: true,
      Mute: true,
      ChangeOwner: true,
      Duplicate: true,
      Download: true,
    },
    viewAccessibility: {},
  }) as unknown as TItem;

const plainFolder = (): TItem =>
  ({
    id: 5,
    parentId: 10,
    title: "Documents",
    isFolder: true,
    rootFolderType: FolderType.USER,
    new: 0,
    security: {
      Delete: true,
      Copy: true,
      Duplicate: true,
      Download: true,
      Rename: true,
      Move: true,
      UpdateXlsx: true,
    },
    viewAccessibility: {},
  }) as unknown as TItem;

const roomTemplate = (): TItem =>
  ({
    id: 6,
    title: "Template",
    roomType: RoomsType.CustomRoom,
    rootFolderType: FolderType.RoomTemplates,
    security: roomSecurity,
    viewAccessibility: {},
  }) as unknown as TItem;

describe("FilesStore.getFilesContextOptions — characterization", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    // dialogsStore is attached post-construction in the app; the room branch
    // reads it with a non-null assertion, so provide it here.
    store.dialogsStore = { roomGroups: [] } as never;
  });

  it("builds options for a document file", () => {
    expect(store.getFilesContextOptions(documentFile())).toMatchSnapshot();
  });

  it("builds options for a custom room", () => {
    expect(store.getFilesContextOptions(customRoom())).toMatchSnapshot();
  });

  it("builds options for an AI agent room", () => {
    expect(store.getFilesContextOptions(aiAgentRoom())).toMatchSnapshot();
  });

  it("builds options for a plain folder", () => {
    expect(store.getFilesContextOptions(plainFolder())).toMatchSnapshot();
  });

  it("builds options for a room template", () => {
    expect(store.getFilesContextOptions(roomTemplate())).toMatchSnapshot();
  });

  it("honors optionsToRemove", () => {
    const full = store.getFilesContextOptions(documentFile());
    const trimmed = store.getFilesContextOptions(documentFile(), ["download"]);
    expect(full).toContain("download");
    expect(trimmed).not.toContain("download");
  });

  it("strips sharing/room options in a public room context", () => {
    const store2 = createTestFilesStore({
      publicRoomStore: { isPublicRoom: true },
    });
    store2.dialogsStore = { roomGroups: [] } as never;
    const opts = store2.getFilesContextOptions(documentFile());
    expect(opts).not.toContain("sharing-settings");
    expect(opts).not.toContain("create-room");
    expect(opts).not.toContain("send-by-email");
  });

  it("collapses expired-link files to just select outside a shared-with-me section", () => {
    // The expired-link set starts as ["select","separator0",
    // "remove-shared-folder-or-file"], but outside a shared-with-me section
    // the remove-shared option is stripped and removeSeparator drops
    // separator0 — leaving only "select". Characterized to lock this in.
    const expired = {
      ...documentFile(),
      external: true,
      isLinkExpired: true,
    } as TItem;
    expect(store.getFilesContextOptions(expired)).toStrictEqual(["select"]);
  });
});
