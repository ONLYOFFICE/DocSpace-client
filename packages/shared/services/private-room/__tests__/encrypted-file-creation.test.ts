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
  EncryptedFileCreationError,
  createEncryptedFile,
} from "../encrypted-file-creation";
import { getEmptyTemplateBytes } from "../empty-template";
import { orchestrateEncryptedUpload } from "../encrypted-upload-orchestrator";
import type { OrchestrateEncryptedUploadArgs } from "../encrypted-upload-orchestrator";

vi.mock("../empty-template", async (importOriginal) => {
  const original = await importOriginal<typeof import("../empty-template")>();
  return {
    ...original,
    getEmptyTemplateBytes: vi.fn(async () => {
      const bytes = new Uint8Array(64);
      bytes.set([0x50, 0x4b, 0x03, 0x04]);
      return bytes.buffer;
    }),
  };
});

vi.mock("../encrypted-upload-orchestrator", () => ({
  orchestrateEncryptedUpload: vi.fn(async () => ({
    results: [
      {
        ok: true,
        fileId: 42,
        uploadId: "upload-1",
        originalName: "Report.docx",
      },
    ],
    quotaErrorRaised: false,
    aborted: false,
  })),
}));

function makeIdentity() {
  return {
    privateKey: {} as CryptoKey,
    publicKey: new Uint8Array(32),
  };
}

function baseArgs() {
  return {
    extension: "docx" as const,
    title: "Report",
    folderId: 7,
    roomId: 7,
    identity: makeIdentity() as never,
    userId: "user-1",
    publicKey: "base64pubkey==",
    publicKeyId: "key-1",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEncryptedFile", () => {
  it("encrypt-uploads the template under the plaintext file name", async () => {
    const result = await createEncryptedFile(baseArgs());

    expect(result).toEqual({ fileId: 42, fileName: "Report.docx" });

    expect(getEmptyTemplateBytes).toHaveBeenCalledWith({
      extension: "docx",
      signal: undefined,
    });

    const call = vi.mocked(orchestrateEncryptedUpload).mock
      .calls[0][0] as OrchestrateEncryptedUploadArgs;
    expect(call.folderId).toBe(7);
    expect(call.roomId).toBe(7);
    expect(call.userId).toBe("user-1");
    expect(call.publicKey).toBe("base64pubkey==");
    expect(call.publicKeyId).toBe("key-1");
    expect(call.files).toHaveLength(1);

    const file = call.files[0];
    expect(file.name).toBe("Report.docx");
    expect(file.size).toBe(64);
  });

  it("trims the title before composing the file name", async () => {
    const result = await createEncryptedFile({
      ...baseArgs(),
      title: "  Report  ",
    });

    expect(result.fileName).toBe("Report.docx");
  });

  it("rejects an empty title without any network activity", async () => {
    await expect(
      createEncryptedFile({ ...baseArgs(), title: "   " }),
    ).rejects.toBeInstanceOf(EncryptedFileCreationError);

    expect(getEmptyTemplateBytes).not.toHaveBeenCalled();
    expect(orchestrateEncryptedUpload).not.toHaveBeenCalled();
  });

  it("refuses to run without encryption keys — no plaintext fallback", async () => {
    await expect(
      createEncryptedFile({ ...baseArgs(), publicKey: "" }),
    ).rejects.toBeInstanceOf(EncryptedFileCreationError);

    expect(getEmptyTemplateBytes).not.toHaveBeenCalled();
    expect(orchestrateEncryptedUpload).not.toHaveBeenCalled();
  });

  it("rethrows the original upload error so callers can classify it", async () => {
    const quotaError = Object.assign(new Error("quota"), {
      response: { status: 402 },
    });
    vi.mocked(orchestrateEncryptedUpload).mockResolvedValueOnce({
      results: [
        {
          ok: false,
          uploadId: "upload-1",
          originalName: "Report.docx",
          error: quotaError,
        },
      ],
      quotaErrorRaised: true,
      aborted: false,
    });

    await expect(createEncryptedFile(baseArgs())).rejects.toBe(quotaError);
  });

  it("throws when the upload was aborted", async () => {
    vi.mocked(orchestrateEncryptedUpload).mockResolvedValueOnce({
      results: [
        {
          ok: false,
          uploadId: "upload-1",
          originalName: "Report.docx",
          aborted: true,
        },
      ],
      quotaErrorRaised: false,
      aborted: true,
    });

    await expect(createEncryptedFile(baseArgs())).rejects.toBeInstanceOf(
      EncryptedFileCreationError,
    );
  });

  it("forwards upload progress to onProgress", async () => {
    vi.mocked(orchestrateEncryptedUpload).mockImplementationOnce(
      async (args: OrchestrateEncryptedUploadArgs) => {
        args.uploadStore?.reportProgress?.("upload-1", 50);
        args.uploadStore?.reportProgress?.("upload-1", 100);
        return {
          results: [
            {
              ok: true,
              fileId: 42,
              uploadId: "upload-1",
              originalName: "Report.docx",
            },
          ],
          quotaErrorRaised: false,
          aborted: false,
        };
      },
    );

    const onProgress = vi.fn();
    await createEncryptedFile({ ...baseArgs(), onProgress });

    expect(onProgress).toHaveBeenNthCalledWith(1, 50);
    expect(onProgress).toHaveBeenNthCalledWith(2, 100);
  });
});
