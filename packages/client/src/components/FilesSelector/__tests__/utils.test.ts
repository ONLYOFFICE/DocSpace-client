// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import { getSelectorTransfer } from "../utils";

const encrypted = (id: number) =>
  ({ id, title: `e${id}.docx`, fileExst: ".docx", encrypted: true }) as TFile;
const plain = (id: number) =>
  ({ id, title: `p${id}.docx`, fileExst: ".docx" }) as TFile;
const folder = (id: number) => ({ id, title: `d${id}`, isFolder: true }) as TFolder;

describe("FilesSelector getSelectorTransfer", () => {
  it("refuses a refuse-folder-out plan", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "refuse-folder-out" },
      selection: [folder(3)],
      selectedItemId: 50,
      isMove: true,
    });
    expect(transfer).toEqual({ kind: "refuse" });
  });

  it("refuses a refuse-into plan", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "refuse-into" },
      selection: [plain(1)],
      selectedItemId: 50,
      isCopy: true,
    });
    expect(transfer).toEqual({ kind: "refuse" });
  });

  it("keeps the server-side transfer for a generic plan", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "generic" },
      selection: [plain(1), folder(3)],
      selectedItemId: 50,
      isMove: true,
    });
    expect(transfer).toEqual({ kind: "generic" });
  });

  it("Move out of the room: encrypted files are decrypted with their sources deleted and folders are refused", () => {
    const selection = [encrypted(1), plain(2), folder(3)];
    const transfer = getSelectorTransfer({
      plan: {
        kind: "decrypt-out",
        files: [encrypted(1), plain(2)] as never,
        refusedFolders: [folder(3)] as never,
      },
      selection,
      selectedItemId: 50,
      isMove: true,
    });
    expect(transfer).toEqual({
      kind: "encrypted",
      encryptedFiles: [selection[0]],
      fileIds: [2],
      folderIds: [],
      movesIntoItself: false,
      refusedFolders: true,
      deleteSourceOnSuccess: true,
    });
  });

  it("Copy to My documents: encrypted files are decrypted and the sources stay", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "decrypt-out", files: [encrypted(1)] as never, refusedFolders: [] },
      selection: [encrypted(1)],
      selectedItemId: 50,
      isCopy: true,
    });
    expect(transfer).toMatchObject({
      kind: "encrypted",
      refusedFolders: false,
      deleteSourceOnSuccess: false,
    });
  });

  it("Same-room copy: encrypted files take the client copy and folders the server copy", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "same-room" },
      selection: [encrypted(1), folder(3), folder(50)],
      selectedItemId: 50,
      isCopy: true,
    });
    expect(transfer).toMatchObject({
      kind: "encrypted",
      fileIds: [],
      folderIds: [3],
      movesIntoItself: true,
      deleteSourceOnSuccess: false,
    });
  });

  it("keeps the server-side move inside the same private room", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "same-room" },
      selection: [encrypted(1)],
      selectedItemId: 50,
      isMove: true,
    });
    expect(transfer).toEqual({ kind: "generic" });
  });
});
