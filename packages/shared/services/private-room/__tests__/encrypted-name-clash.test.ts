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

import {
  listDecryptedFileNames,
  resolveNameClashes,
} from "../encrypted-name-clash";
import type { IdentityKeyPair } from "../../encryption/types";

vi.mock("../../../api/files", () => ({
  getFolder: vi.fn(),
}));
vi.mock("../encrypted-filename-recovery", () => ({
  recoverEncryptedFilenames: vi.fn(async () => {}),
}));
vi.mock("../../encryption/filename-cache", () => ({
  getCachedEncryptedFilename: vi.fn(),
}));
vi.mock("../room-member-keys", () => ({
  loadRoomMemberKeysSafe: vi.fn(async () => []),
}));

import { getFolder } from "../../../api/files";
import { recoverEncryptedFilenames } from "../encrypted-filename-recovery";
import { getCachedEncryptedFilename } from "../../encryption/filename-cache";
import { loadRoomMemberKeysSafe } from "../room-member-keys";

const identity = {} as IdentityKeyPair;

const named = (...names: string[]) =>
  names.map((name, i) => ({ item: `item-${i}`, name }));

describe("resolveNameClashes", () => {
  it("Copy into a room holding a file of the same name", () => {
    expect(
      resolveNameClashes(named("New document.docx"), ["New document.docx"]),
    ).toEqual([
      {
        item: "item-0",
        name: "New document.docx",
        renamed: "New document (1).docx",
      },
    ]);
  });

  it("Upload without a clash", () => {
    expect(
      resolveNameClashes(named("Plan.docx", "Budget.xlsx"), [
        "New document.docx",
      ]),
    ).toEqual([]);
  });

  it("compares names without regard to case", () => {
    expect(
      resolveNameClashes(named("new DOCUMENT.docx"), ["New document.docx"]),
    ).toEqual([
      {
        item: "item-0",
        name: "new DOCUMENT.docx",
        renamed: "new DOCUMENT (1).docx",
      },
    ]);
  });

  it("takes the first free suffix, counting the batch's own names", () => {
    expect(
      resolveNameClashes(named("Plan.docx", "Plan.docx"), [
        "Plan.docx",
        "Plan (1).docx",
      ]).map(({ renamed }) => renamed),
    ).toEqual(["Plan (2).docx", "Plan (3).docx"]);
  });

  it("renames the second of two new files that share a name", () => {
    expect(
      resolveNameClashes(named("Plan.docx", "Plan.docx"), []),
    ).toEqual([{ item: "item-1", name: "Plan.docx", renamed: "Plan (1).docx" }]);
  });
});

describe("listDecryptedFileNames", () => {
  beforeEach(() => {
    vi.mocked(getFolder).mockReset();
    vi.mocked(getCachedEncryptedFilename).mockReset();
  });

  const encryptedFile = (id: number) => ({
    id,
    title: `${id}-uuid.docx`,
    encrypted: true,
    viewUrl: `/files/${id}/view`,
  });

  it("recovers names not cached yet and leaves out the ones it cannot read", async () => {
    vi.mocked(getFolder)
      .mockResolvedValueOnce({
        files: [encryptedFile(1), encryptedFile(2)],
        folders: [{ id: 9 }],
        total: 4,
      } as never)
      .mockResolvedValueOnce({
        files: [encryptedFile(3)],
        folders: [],
        total: 4,
      } as never);
    vi.mocked(getCachedEncryptedFilename).mockImplementation((id) =>
      id === 2 ? null : `name-${id}.docx`,
    );

    const names = await listDecryptedFileNames(50, 50, "user-1", identity);

    expect(names).toEqual(["name-1.docx", "name-3.docx"]);
    expect(vi.mocked(getFolder).mock.calls.map(([id, f]) => [id, f.page])).toEqual(
      [
        [50, 0],
        [50, 1],
      ],
    );
    expect(recoverEncryptedFilenames).toHaveBeenCalledWith(
      [{ id: 2, viewUrl: "/files/2/view" }],
      "user-1",
      identity,
      50,
    );
  });

  it("loads no member keys when every name is cached", async () => {
    vi.mocked(getFolder).mockResolvedValueOnce({
      files: [encryptedFile(1), encryptedFile(2)],
      folders: [],
      total: 2,
    } as never);
    vi.mocked(getCachedEncryptedFilename).mockImplementation(
      (id) => `name-${id}.docx`,
    );
    const actual = await vi.importActual<
      typeof import("../encrypted-filename-recovery")
    >("../encrypted-filename-recovery");
    vi.mocked(recoverEncryptedFilenames).mockImplementationOnce(
      actual.recoverEncryptedFilenames,
    );

    const names = await listDecryptedFileNames(50, 50, "user-1", identity);

    expect(names).toEqual(["name-1.docx", "name-2.docx"]);
    expect(loadRoomMemberKeysSafe).not.toHaveBeenCalled();
  });
});
