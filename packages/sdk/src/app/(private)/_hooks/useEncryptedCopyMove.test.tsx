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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  paths: new Map<number, unknown[]>(),
  requireIdentity: vi.fn(async () => ({ publicKey: new Uint8Array() })),
  uploadFiles: vi.fn(async () => ({ ok: true })),
  uploadDecrypted: vi.fn(async () => {}),
  existingNames: [] as string[],
  decryptedName: "memo.txt",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { names?: string }) =>
      options?.names ? `${key}:${options.names}` : key,
  }),
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => ({ requireIdentity: env.requireIdentity }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

vi.mock("@docspace/shared/api/files", () => ({
  getFolderPath: vi.fn(async (folderId: number) => {
    const path = env.paths.get(folderId);
    if (!path) throw new Error(`no path for folder ${folderId}`);
    return path;
  }),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-copy", () => ({
  decryptEncryptedItemToFile: vi.fn(
    async () => new File(["plain"], env.decryptedName, { type: "text/plain" }),
  ),
  addCopySuffix: (name: string, n = 1) =>
    name.replace(/(\.[^.]+)$/, ` (${n})$1`),
}));

vi.mock(
  "@docspace/shared/services/private-room/encrypted-name-clash",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    listDecryptedFileNames: vi.fn(async () => env.existingNames),
  }),
);

vi.mock("../_store/EncryptionIdentityStore", () => ({
  useEncryptionIdentityStore: () => ({ userKeys: { userId: "me" } }),
}));

vi.mock("./useEncryptedUpload", () => ({
  useEncryptedUpload: () => ({ uploadFiles: env.uploadFiles }),
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useEncryptedCopyMove } from "./useEncryptedCopyMove";

// GET folder/{id}/path answers: a folder inside a room reads private: false.
const SECTION = { id: 2, title: "Rooms" };
const OTHER_ROOM = { id: 20, title: "Other", roomType: 5, private: true };
const OTHER_ROOM_FOLDER = { id: 21, title: "Drafts", private: false };
const SHARED_ROOM = { id: 30, title: "Shared", roomType: 6, private: false };
const OWN_ROOM = { id: 10, title: "Room", roomType: 5, private: true };

const MEMO = { id: 7, title: "memo.txt", viewUrl: "/memo", fileExst: ".txt" };

describe("useEncryptedCopyMove", () => {
  let root: Root | null = null;
  let actions: ReturnType<typeof useEncryptedCopyMove>;

  const Probe = () => {
    actions = useEncryptedCopyMove();
    return null;
  };

  beforeEach(() => {
    env.paths.clear();
    env.paths.set(21, [SECTION, OTHER_ROOM, OTHER_ROOM_FOLDER]);
    env.paths.set(30, [SECTION, SHARED_ROOM]);
    env.paths.set(10, [SECTION, OWN_ROOM]);
    env.existingNames = [];
    env.decryptedName = "memo.txt";
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  const copyTo = (destFolderId: number) =>
    act(() =>
      actions.copyFiles({
        files: [MEMO],
        destFolderId,
        sourceRoomId: 10,
        uploadDecrypted: env.uploadDecrypted,
      }),
    );

  it("Copy into a folder of another private room", async () => {
    await copyTo(21);

    expect(env.uploadFiles).toHaveBeenCalledWith(
      expect.objectContaining({ folderId: 21, roomId: 20 }),
    );
    expect(env.uploadDecrypted).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Destination outside private rooms", async () => {
    await copyTo(30);

    expect(env.uploadDecrypted).toHaveBeenCalledTimes(1);
    const [uploaded, folderId] = env.uploadDecrypted.mock.calls[0] as unknown as [
      File[],
      number,
    ];
    expect(uploaded.map((f) => f.name)).toEqual(["memo.txt"]);
    expect(folderId).toBe(30);
    expect(env.uploadFiles).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Copy of a name that already has a copy", async () => {
    env.existingNames = ["Report.docx", "Report (1).docx"];
    env.decryptedName = "Report.docx";
    const report = { ...MEMO, title: "Report.docx", fileExst: ".docx" };

    await act(() =>
      actions.duplicateFile({ item: report, roomId: 10, folderId: 10 }),
    );
    await act(() =>
      actions.copyFiles({
        files: [report],
        destFolderId: 10,
        sourceRoomId: 10,
        uploadDecrypted: env.uploadDecrypted,
      }),
    );

    const uploads = env.uploadFiles.mock.calls.map(
      (call) =>
        (call as unknown as [{ files: File[]; folderId: number; roomId: number }])[0],
    );
    expect(
      uploads.map(({ files, folderId, roomId }) => ({
        names: files.map((f) => f.name),
        folderId,
        roomId,
      })),
    ).toEqual([
      { names: ["Report (2).docx"], folderId: 10, roomId: 10 },
      { names: ["Report (2).docx"], folderId: 10, roomId: 10 },
    ]);
    expect(env.uploadDecrypted).not.toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("Destination unknown", async () => {
    await copyTo(99);


    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedCopyFailed:memo.txt");
    expect(env.requireIdentity).not.toHaveBeenCalled();
    expect(env.uploadFiles).not.toHaveBeenCalled();
    expect(env.uploadDecrypted).not.toHaveBeenCalled();
  });
});
