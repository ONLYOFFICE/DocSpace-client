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

import { describe, it, expect } from "vitest";
import { FileType, FolderType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

// Tier 1: the negative / context-specific branches of getFilesContextOptions
// (the ~1070-line method's dozens of removeOptions paths). The happy-path
// suite covers "all permissions true"; here we drive permission=false and the
// trash / archive / private / encrypted / third-party contexts. Snapshots
// capture the exact surviving option set; explicit asserts document the intent.

const noPermFile = (): TItem =>
  ({
    id: 1,
    parentId: 10,
    title: "Locked.docx",
    fileExst: ".docx",
    contentLength: "1 KB",
    fileType: FileType.Document,
    rootFolderType: FolderType.USER,
    security: {}, // every permission falsy
    viewAccessibility: {},
  }) as unknown as TItem;

const fullPermFile = (): TItem =>
  ({
    id: 2,
    parentId: 10,
    title: "Report.docx",
    fileExst: ".docx",
    contentLength: "1 KB",
    fileType: FileType.Document,
    rootFolderType: FolderType.USER,
    security: {
      Edit: true,
      Delete: true,
      Copy: true,
      Duplicate: true,
      Download: true,
      Rename: true,
      Move: true,
      CopyLink: true,
    },
    viewAccessibility: { WebEdit: true, WebView: true },
  }) as unknown as TItem;

const encryptedFile = (): TItem =>
  ({
    ...fullPermFile(),
    id: 3,
    title: "Secret.docx",
    encrypted: true,
  }) as unknown as TItem;

describe("getFilesContextOptions — permission=false strips actions", () => {
  it("drops every gated action when security is empty", () => {
    // `move-to` is gated by accessRightsStore.canMoveItems (not item.security),
    // so a true no-permission file must also deny moving.
    const store = createTestFilesStore({
      accessRightsStore: { canMoveItems: () => false },
    });
    const opts = store.getFilesContextOptions(noPermFile());

    for (const gated of [
      "delete",
      "move-to",
      "copy-to",
      "duplicate",
      "rename",
      "download",
      "edit",
    ]) {
      expect(opts).not.toContain(gated);
    }
    expect(opts).toMatchSnapshot();
  });

  it("keeps the same actions present when the matching permission is set", () => {
    const store = createTestFilesStore();
    const opts = store.getFilesContextOptions(fullPermFile());
    expect(opts).toContain("delete");
    expect(opts).toContain("download");
    expect(opts).toContain("rename");
  });
});

describe("getFilesContextOptions — folder context", () => {
  it("trash: no favorites/mark-read, offers restore+delete", () => {
    const store = createTestFilesStore({
      treeFoldersStore: { isRecycleBinFolder: true },
    });
    const file = { ...fullPermFile(), rootFolderType: FolderType.TRASH } as TItem;
    const opts = store.getFilesContextOptions(file);

    expect(opts).not.toContain("mark-as-favorite");
    expect(opts).not.toContain("remove-from-favorites");
    expect(opts).toMatchSnapshot();
  });

  it("archive root: strips mark-read and mark-as-favorite", () => {
    const store = createTestFilesStore();
    const file = {
      ...fullPermFile(),
      rootFolderType: FolderType.Archive,
    } as TItem;
    const opts = store.getFilesContextOptions(file);

    expect(opts).not.toContain("mark-read");
    expect(opts).not.toContain("mark-as-favorite");
  });

  it("favorites folder: strips mark-as-favorite and delete", () => {
    const store = createTestFilesStore({
      treeFoldersStore: { isFavoritesFolder: true },
    });
    const opts = store.getFilesContextOptions(fullPermFile());
    expect(opts).not.toContain("mark-as-favorite");
    expect(opts).not.toContain("delete");
  });
});

describe("getFilesContextOptions — encrypted file", () => {
  it("strips sharing/link/version options and adds download-encrypted", () => {
    const store = createTestFilesStore();
    const opts = store.getFilesContextOptions(encryptedFile());

    expect(opts).toContain("download-encrypted");
    for (const stripped of [
      "sharing-settings",
      "copy-shared-link",
      "manage-links",
      "send-by-email",
      "version",
      "show-version-history",
    ]) {
      expect(opts).not.toContain(stripped);
    }
    expect(opts).toMatchSnapshot();
  });
});

// Bug 82880: a format that needs server-side conversion cannot be opened from
// a private room at all, so the menu must not offer it — the file click already
// explains why. Keys are present here on purpose: without them the no-keys
// branch strips the same options and the assertions would pass for free.
describe("getFilesContextOptions — encrypted file that needs conversion", () => {
  const withKeys = () =>
    createTestFilesStore({ userStore: { encryptionKeys: [{ id: "key-1" }] } });

  const openable = ["edit", "preview", "view", "open-pdf", "edit-pdf"];

  const convertible = (): TItem =>
    ({
      ...encryptedFile(),
      id: 7,
      title: "Book.ods",
      fileExst: ".ods",
      viewAccessibility: {
        MustConvert: true,
        WebEdit: true,
        WebView: true,
        ImageView: false,
        MediaView: false,
      },
    }) as unknown as TItem;

  it("offers no way to open it, but keeps the encrypted download", () => {
    const opts = withKeys().getFilesContextOptions(convertible());

    for (const option of openable) {
      expect(opts).not.toContain(option);
    }
    expect(opts).toContain("download-encrypted");
  });

  it("still offers to open an encrypted file that needs no conversion", () => {
    const opts = withKeys().getFilesContextOptions(encryptedFile());

    expect(opts).toContain("edit");
  });
});

describe("getFilesContextOptions — room/folder with no permissions", () => {
  it("room with empty security keeps only ungated entries", () => {
    const store = createTestFilesStore();
    store.dialogsStore = { roomGroups: [] } as never;
    const room = {
      id: 5,
      title: "Room",
      roomType: RoomsType.CustomRoom,
      rootFolderType: FolderType.Rooms,
      security: {},
      viewAccessibility: {},
    } as unknown as TItem;
    const opts = store.getFilesContextOptions(room);

    expect(opts).not.toContain("delete");
    expect(opts).not.toContain("edit-room");
    expect(opts).not.toContain("invite-users-to-room");
    expect(opts).toMatchSnapshot();
  });

  it("plain folder with empty security drops move/copy/delete/rename", () => {
    const store = createTestFilesStore({
      accessRightsStore: { canMoveItems: () => false },
    });
    const folder = {
      id: 6,
      parentId: 10,
      title: "Folder",
      isFolder: true,
      rootFolderType: FolderType.USER,
      security: {},
      viewAccessibility: {},
    } as unknown as TItem;
    const opts = store.getFilesContextOptions(folder);

    for (const gated of ["delete", "move-to", "copy-to", "duplicate", "rename"]) {
      expect(opts).not.toContain(gated);
    }
    expect(opts).toMatchSnapshot();
  });
});
