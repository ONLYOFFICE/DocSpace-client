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

import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { createEncryptedFile } from "@docspace/shared/services/private-room/encrypted-file-creation";

import {
  getUniqueFileTitle,
  isEncryptedCreateExtension,
  runEncryptedFileCreation,
} from "../encryptedFileCreation";

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  requireUnlock: vi.fn(async () => ({
    privateKey: {},
    publicKey: new Uint8Array(32),
  })),
}));

vi.mock(
  "@docspace/shared/services/private-room/encrypted-file-creation",
  () => ({
    createEncryptedFile: vi.fn(async () => ({
      fileId: 42,
      fileName: "Report.docx",
    })),
  }),
);

function baseParams() {
  return {
    extension: "docx" as const,
    title: "Report",
    parentId: 7,
    roomId: 7,
    userId: "user-1",
    publicKey: "base64pubkey==",
    publicKeyId: "key-1",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isEncryptedCreateExtension", () => {
  it("accepts only the supported template extensions", () => {
    expect(isEncryptedCreateExtension("docx")).toBe(true);
    expect(isEncryptedCreateExtension("xlsx")).toBe(true);
    expect(isEncryptedCreateExtension("pptx")).toBe(true);
    expect(isEncryptedCreateExtension("pdf")).toBe(true);
    expect(isEncryptedCreateExtension("docxf")).toBe(false);
    expect(isEncryptedCreateExtension("")).toBe(false);
    expect(isEncryptedCreateExtension(null)).toBe(false);
    expect(isEncryptedCreateExtension(undefined)).toBe(false);
  });
});

describe("getUniqueFileTitle", () => {
  it("returns the base title when the folder has no clash", () => {
    expect(getUniqueFileTitle("New document", "docx", [])).toBe("New document");
    expect(
      getUniqueFileTitle("New document", "docx", ["Other.docx", "New.xlsx"]),
    ).toBe("New document");
  });

  it("appends an index until the name is free", () => {
    const existing = [
      "New document.docx",
      "New document (1).docx",
      "budget.xlsx",
    ];
    expect(getUniqueFileTitle("New document", "docx", existing)).toBe(
      "New document (2)",
    );
  });

  it("compares case-insensitively", () => {
    expect(getUniqueFileTitle("New document", "docx", ["new document.DOCX"]))
      .toBe("New document (1)");
  });

  it("does not clash across different extensions", () => {
    expect(getUniqueFileTitle("New document", "docx", ["New document.xlsx"]))
      .toBe("New document");
  });
});

describe("runEncryptedFileCreation", () => {
  it("unlocks the identity and delegates to the shared service", async () => {
    const result = await runEncryptedFileCreation(baseParams());

    expect(result).toEqual({ fileId: 42, fileName: "Report.docx" });
    expect(requireUnlock).toHaveBeenCalledWith("user-1");
    expect(createEncryptedFile).toHaveBeenCalledWith({
      extension: "docx",
      title: "Report",
      folderId: 7,
      roomId: 7,
      identity: expect.anything(),
      userId: "user-1",
      publicKey: "base64pubkey==",
      publicKeyId: "key-1",
    });
  });

  it("returns null when the user dismisses the unlock dialog", async () => {
    vi.mocked(requireUnlock).mockResolvedValueOnce(null);

    const result = await runEncryptedFileCreation(baseParams());

    expect(result).toBeNull();
    expect(createEncryptedFile).not.toHaveBeenCalled();
  });

  it("throws without keys — no plaintext fallback", async () => {
    await expect(
      runEncryptedFileCreation({ ...baseParams(), publicKey: null }),
    ).rejects.toThrow();
    await expect(
      runEncryptedFileCreation({ ...baseParams(), roomId: null }),
    ).rejects.toThrow();

    expect(requireUnlock).not.toHaveBeenCalled();
    expect(createEncryptedFile).not.toHaveBeenCalled();
  });

  it("rejects unsupported extensions before unlocking", async () => {
    await expect(
      runEncryptedFileCreation({
        ...baseParams(),
        extension: "exe" as never,
      }),
    ).rejects.toThrow();

    expect(requireUnlock).not.toHaveBeenCalled();
  });
});
