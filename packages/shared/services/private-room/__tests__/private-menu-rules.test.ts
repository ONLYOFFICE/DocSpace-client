// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import {
  getEncryptedFileWithheld,
  PRIVATE_FOLDER_WITHHELD,
  PRIVATE_ROOM_WITHHELD,
  withheldMenuKeys,
} from "../private-menu-rules";

const ALWAYS_FOR_ENCRYPTED_FILES = [
  "share",
  "create-room",
  "ai",
  "forms",
  "docu-sign",
  "custom-filter",
  "spreadsheet-data",
  "convert",
  "download-as",
  "favorites",
  "rename",
  "index",
  "versions",
  "plugins",
];

describe("private menu rules", () => {
  it("Full menu of an encrypted file: the server-side actions are withheld, opening and download stay", () => {
    const withheld = getEncryptedFileWithheld({ hasKeys: true });

    expect([...withheld].sort()).toEqual([...ALWAYS_FOR_ENCRYPTED_FILES].sort());
  });

  it("an encrypted file that opens only after a server conversion cannot be opened", () => {
    const withheld = getEncryptedFileWithheld({ mustConvert: true, hasKeys: true });

    expect(withheld.has("open")).toBe(true);
    expect(withheld.has("download")).toBe(false);
  });

  it("User without keys: neither opening nor download is offered", () => {
    const withheld = getEncryptedFileWithheld({ hasKeys: false });

    expect(withheld.has("open")).toBe(true);
    expect(withheld.has("download")).toBe(true);
  });

  it("Folder menu in a private room: sharing, room creation, favorites, index, copy and duplicate are withheld", () => {
    expect([...PRIVATE_FOLDER_WITHHELD].sort()).toEqual(
      ["copy", "create-room", "duplicate", "favorites", "index", "plugins", "share"],
    );
  });

  it("Private room context menu: links, embedding, index, template and duplicate are withheld", () => {
    expect([...PRIVATE_ROOM_WITHHELD].sort()).toEqual([
      "duplicate",
      "embedding",
      "external-link",
      "index",
      "plugins",
      "room-template",
      "share",
    ]);
  });

  it("maps the withheld intents through an app's keys and skips intents it has none for", () => {
    expect(
      withheldMenuKeys(PRIVATE_FOLDER_WITHHELD, {
        copy: ["copy"],
        duplicate: ["duplicate"],
        favorites: ["mark-as-favorite", "remove-from-favorites"],
      }).sort(),
    ).toEqual(["copy", "duplicate", "mark-as-favorite", "remove-from-favorites"]);
  });
});
