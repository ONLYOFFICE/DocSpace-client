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

import {
  CryptoError,
  DecryptionError,
  NoAccessError,
  KeyNotFoundError,
  InvalidPassphraseError,
  WebCryptoUnavailableError,
} from "@docspace/shared/services/encryption/errors";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

// ---------------------------------------------------------------------------
// Helpers — replicate the fallback-choice logic from each hook's catch block.
//
// These pure functions mirror exactly what each hook does in its catch(error)
// handler so we can test the selection logic without React / MobX context.
// ---------------------------------------------------------------------------

/** Mirrors the fallback selection in useEncryptedDownload (downloadFile and downloadZip). */
function selectDownloadMessage(
  t: (key: string) => string,
  error: unknown,
): string {
  return error instanceof CryptoError
    ? getEncryptionErrorMessage(t, error)
    : t("Common:EncryptionDownloadFailed");
}

/** Mirrors the fallback selection in useEncryptedCopyMove (duplicateFile / runCopyMove). */
function selectCopyMessage(
  t: (key: string, vars?: Record<string, unknown>) => string,
  error: unknown,
  names: string,
): string {
  return error instanceof CryptoError
    ? getEncryptionErrorMessage(t, error)
    : t("Common:EncryptedCopyFailed", { names });
}

/** Mirrors the fallback selection in useEncryptedUpload (onFileError + outer catch). */
function selectUploadMessage(
  t: (key: string) => string,
  error: unknown,
): string {
  return error instanceof CryptoError
    ? getEncryptionErrorMessage(t, error)
    : t("Common:EncryptionPrepareFailed");
}

// Minimal t() stub — returns the full "Namespace:Key" string so tests can
// check which key was selected without needing locale files.
const t = (key: string, vars?: Record<string, unknown>): string => {
  if (vars) return `${key}:${JSON.stringify(vars)}`;
  return key;
};

// ---------------------------------------------------------------------------
// useEncryptedDownload — fallback choice
// ---------------------------------------------------------------------------

describe("useEncryptedDownload — error key selection", () => {
  // Untyped errors (network, API, unexpected) must surface the
  // operation-specific download key rather than the generic EncryptionError.
  it("uses EncryptionDownloadFailed for a plain Error (untyped)", () => {
    const result = selectDownloadMessage(t, new Error("network timeout"));
    expect(result).toBe("Common:EncryptionDownloadFailed");
  });

  it("uses EncryptionDownloadFailed for a non-Error thrown value", () => {
    expect(selectDownloadMessage(t, "string error")).toBe(
      "Common:EncryptionDownloadFailed",
    );
    expect(selectDownloadMessage(t, null)).toBe(
      "Common:EncryptionDownloadFailed",
    );
    expect(selectDownloadMessage(t, { status: 500 })).toBe(
      "Common:EncryptionDownloadFailed",
    );
  });

  // Typed crypto errors must still route through getEncryptionErrorMessage so
  // the precise crypto message is shown (not the generic download key).
  it("uses getEncryptionErrorMessage for a DecryptionError (typed crypto)", () => {
    const error = new DecryptionError("bad ciphertext");
    const result = selectDownloadMessage(t, error);
    // DecryptionError → Common:EncryptionError
    expect(result).toBe("Common:EncryptionError");
    expect(result).not.toBe("Common:EncryptionDownloadFailed");
  });

  it("uses getEncryptionErrorMessage for a NoAccessError (typed crypto)", () => {
    const result = selectDownloadMessage(t, new NoAccessError("u1"));
    expect(result).toBe("Common:NoAccessToEncryptedFile");
  });

  it("uses getEncryptionErrorMessage for a KeyNotFoundError (typed crypto)", () => {
    const result = selectDownloadMessage(t, new KeyNotFoundError("k1"));
    expect(result).toBe("Common:NoEncryptionKey");
  });

  it("uses getEncryptionErrorMessage for a WebCryptoUnavailableError (typed crypto)", () => {
    const result = selectDownloadMessage(t, new WebCryptoUnavailableError());
    expect(result).toBe("Common:EncryptionRequiresHttps");
  });

  it("uses getEncryptionErrorMessage for an InvalidPassphraseError (typed crypto)", () => {
    const result = selectDownloadMessage(t, new InvalidPassphraseError());
    expect(result).toBe("Common:InvalidPassphrase");
  });

  // The same logic applies to downloadZip — it reuses selectDownloadMessage.
  it("uses EncryptionDownloadFailed for downloadZip untyped failure (zip/decrypt-all)", () => {
    const result = selectDownloadMessage(t, new Error("zip creation failed"));
    // Files:DecryptAllFailed is not in the SDK namespace; EncryptionDownloadFailed
    // is used as the fallback for all untyped download failures.
    expect(result).toBe("Common:EncryptionDownloadFailed");
  });

  it("uses precise crypto key for downloadZip typed failure", () => {
    const result = selectDownloadMessage(t, new DecryptionError());
    expect(result).toBe("Common:EncryptionError");
    expect(result).not.toBe("Common:EncryptionDownloadFailed");
  });
});

// ---------------------------------------------------------------------------
// useEncryptedCopyMove — fallback choice
// ---------------------------------------------------------------------------

describe("useEncryptedCopyMove — error key selection", () => {
  it("uses EncryptedCopyFailed with names for a plain Error (untyped)", () => {
    const result = selectCopyMessage(t, new Error("network"), "report.docx");
    expect(result).toContain("Common:EncryptedCopyFailed");
    expect(result).toContain("report.docx");
  });

  it("passes names interpolation variable", () => {
    const result = selectCopyMessage(
      t,
      new Error("timeout"),
      "file1.pdf, file2.pdf",
    );
    expect(result).toContain('"names":"file1.pdf, file2.pdf"');
  });

  it("uses EncryptedCopyFailed for non-Error thrown value", () => {
    expect(selectCopyMessage(t, null, "doc.txt")).toContain(
      "Common:EncryptedCopyFailed",
    );
    expect(selectCopyMessage(t, "bad", "doc.txt")).toContain(
      "Common:EncryptedCopyFailed",
    );
  });

  it("uses getEncryptionErrorMessage for a DecryptionError (typed crypto)", () => {
    const result = selectCopyMessage(t, new DecryptionError(), "file.pdf");
    expect(result).toBe("Common:EncryptionError");
    expect(result).not.toContain("EncryptedCopyFailed");
  });

  it("uses getEncryptionErrorMessage for a NoAccessError (typed crypto)", () => {
    const result = selectCopyMessage(t, new NoAccessError(), "file.pdf");
    expect(result).toBe("Common:NoAccessToEncryptedFile");
  });

  it("uses getEncryptionErrorMessage for a KeyNotFoundError (typed crypto)", () => {
    const result = selectCopyMessage(t, new KeyNotFoundError(), "file.pdf");
    expect(result).toBe("Common:NoEncryptionKey");
  });
});

// ---------------------------------------------------------------------------
// useEncryptedUpload — fallback choice (onFileError + outer catch)
// ---------------------------------------------------------------------------

describe("useEncryptedUpload — error key selection", () => {
  it("uses EncryptionPrepareFailed for a plain Error (untyped)", () => {
    const result = selectUploadMessage(t, new Error("session error"));
    expect(result).toBe("Common:EncryptionPrepareFailed");
  });

  it("uses EncryptionPrepareFailed for a non-Error thrown value", () => {
    expect(selectUploadMessage(t, null)).toBe("Common:EncryptionPrepareFailed");
    expect(selectUploadMessage(t, "string error")).toBe(
      "Common:EncryptionPrepareFailed",
    );
    expect(selectUploadMessage(t, { status: 403 })).toBe(
      "Common:EncryptionPrepareFailed",
    );
  });

  it("uses getEncryptionErrorMessage for a DecryptionError (typed crypto)", () => {
    const result = selectUploadMessage(t, new DecryptionError());
    expect(result).toBe("Common:EncryptionError");
    expect(result).not.toBe("Common:EncryptionPrepareFailed");
  });

  it("uses getEncryptionErrorMessage for a WebCryptoUnavailableError (typed crypto)", () => {
    const result = selectUploadMessage(t, new WebCryptoUnavailableError());
    expect(result).toBe("Common:EncryptionRequiresHttps");
  });

  it("uses getEncryptionErrorMessage for a NoAccessError (typed crypto)", () => {
    const result = selectUploadMessage(t, new NoAccessError());
    expect(result).toBe("Common:NoAccessToEncryptedFile");
  });

  it("uses getEncryptionErrorMessage for a KeyNotFoundError (typed crypto)", () => {
    const result = selectUploadMessage(t, new KeyNotFoundError());
    expect(result).toBe("Common:NoEncryptionKey");
  });

  // Note: EncryptionUploadWrapFailed cannot be distinguished from prepare
  // failures at the onFileError callback boundary in the current SDK
  // architecture (both go through the same uploadOneFile error path). Both
  // map to EncryptionPrepareFailed for untyped errors. This is a known
  // intentional simplification documented in the hook's comment.
  it("uses EncryptionPrepareFailed for untyped wrap-phase errors (architecture limitation)", () => {
    // Simulate a wrap failure (non-crypto, e.g. network error during setFileEncryptionKeys)
    const wrapError = new Error("setFileEncryptionKeys 503");
    const result = selectUploadMessage(t, wrapError);
    expect(result).toBe("Common:EncryptionPrepareFailed");
  });
});

// ---------------------------------------------------------------------------
// CryptoError subclass detection — ensure the instanceof check is exhaustive
// ---------------------------------------------------------------------------

describe("CryptoError instanceof guard — covers all typed error classes", () => {
  const typedErrors = [
    new CryptoError("base", "BASE"),
    new DecryptionError("test"),
    new NoAccessError("uid"),
    new KeyNotFoundError("kid"),
    new InvalidPassphraseError(),
    new WebCryptoUnavailableError(),
  ];

  for (const err of typedErrors) {
    it(`${err.name} is instanceof CryptoError → routes to getEncryptionErrorMessage`, () => {
      expect(err instanceof CryptoError).toBe(true);
      // All crypto errors should return something OTHER than the fallback
      // operation keys when passed through the download selector.
      const downloadResult = selectDownloadMessage(t, err);
      expect(downloadResult).not.toBe("Common:EncryptionDownloadFailed");

      const uploadResult = selectUploadMessage(t, err);
      expect(uploadResult).not.toBe("Common:EncryptionPrepareFailed");
    });
  }

  it("plain Error is NOT instanceof CryptoError → routes to operation key", () => {
    const plain = new Error("oops");
    expect(plain instanceof CryptoError).toBe(false);
    expect(selectDownloadMessage(t, plain)).toBe(
      "Common:EncryptionDownloadFailed",
    );
    expect(selectUploadMessage(t, plain)).toBe("Common:EncryptionPrepareFailed");
    expect(selectCopyMessage(t, plain, "f.pdf")).toContain(
      "Common:EncryptedCopyFailed",
    );
  });
});
