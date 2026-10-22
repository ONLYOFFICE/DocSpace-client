// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import {
  getIsDisabled,
  getPickedRoomId,
  getSelectorTransfer,
  getShowEncryptedTransferBanner,
} from "../utils";

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

  it("Copy to another private room: encrypted files take the client copy and folders are refused", () => {
    const transfer = getSelectorTransfer({
      plan: {
        kind: "reencrypt-into",
        files: [encrypted(1)] as never,
        refusedFolders: [folder(3)] as never,
      },
      selection: [encrypted(1), folder(3)],
      selectedItemId: 80,
      isCopy: true,
    });
    expect(transfer).toEqual({
      kind: "encrypted",
      encryptedFiles: [encrypted(1)],
      fileIds: [],
      folderIds: [],
      movesIntoItself: false,
      refusedFolders: true,
      deleteSourceOnSuccess: false,
    });
  });

  it("refuses a refuse-move-into plan", () => {
    const transfer = getSelectorTransfer({
      plan: { kind: "refuse-move-into" },
      selection: [encrypted(1)],
      selectedItemId: 80,
      isMove: true,
    });
    expect(transfer).toEqual({ kind: "refuse" });
  });
});

describe("FilesSelector destination in another private room", () => {
  // Arguments of getIsDisabled up to `security`, for a copy into a folder.
  const copyInto = [false, false, false, false, false, true, false, false, false] as const;

  it("Room without create right", () => {
    expect(
      getIsDisabled(
        ...copyInto,
        { Create: false } as never,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        true,
      ),
    ).toBe(true);
    expect(
      getIsDisabled(
        ...copyInto,
        { Create: true } as never,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        true,
      ),
    ).toBe(false);
  });

  it("Subfolder of another private room", () => {
    expect(
      getPickedRoomId([
        { id: 10, label: "Rooms" },
        { id: 8, label: "Room B", isRoom: true },
        { id: 80, label: "Folder" },
      ]),
    ).toBe(8);
    expect(getPickedRoomId([{ id: 10, label: "Rooms" }])).toBeUndefined();
  });
});

describe("FilesSelector getShowEncryptedTransferBanner", () => {
  it.each([
    ["copy", { isCopy: true }],
    ["move", { isMove: true }],
  ])(
    "Warning in the destination picker: a %s of encrypted files out of a private room warns",
    (_, operation) => {
      expect(
        getShowEncryptedTransferBanner({
          selection: [encrypted(1), plain(2)],
          sourceInPrivateRoom: true,
          ...operation,
        }),
      ).toBe(true);
    },
  );

  it("warns from a subfolder too, whose own private flag is false", () => {
    expect(
      getShowEncryptedTransferBanner({
        selection: [encrypted(1)],
        sourceInPrivateRoom: true,
        isCopy: true,
      }),
    ).toBe(true);
  });

  it("does not warn for a source outside private rooms", () => {
    expect(
      getShowEncryptedTransferBanner({
        selection: [encrypted(1)],
        sourceInPrivateRoom: false,
        isCopy: true,
      }),
    ).toBe(false);
  });

  it("does not warn for a selection without encrypted files", () => {
    expect(
      getShowEncryptedTransferBanner({
        selection: [plain(1), folder(3)],
        sourceInPrivateRoom: true,
        isMove: true,
      }),
    ).toBe(false);
  });

  it("does not warn outside a copy or a move", () => {
    expect(
      getShowEncryptedTransferBanner({
        selection: [encrypted(1)],
        sourceInPrivateRoom: true,
      }),
    ).toBe(false);
  });
});
