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

export class CryptoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "CryptoError";
  }
}

export class InvalidPassphraseError extends CryptoError {
  constructor() {
    super("Invalid passphrase", "INVALID_PASSPHRASE");
    this.name = "InvalidPassphraseError";
  }
}

export class InvalidRecoveryPhraseError extends CryptoError {
  constructor() {
    super("Invalid recovery phrase", "INVALID_RECOVERY_PHRASE");
    this.name = "InvalidRecoveryPhraseError";
  }
}

export class DecryptionError extends CryptoError {
  constructor(detail?: string) {
    super(
      `Decryption failed${detail ? `: ${detail}` : ""}`,
      "DECRYPTION_FAILED",
    );
    this.name = "DecryptionError";
  }
}

export class NoAccessError extends CryptoError {
  constructor(userId?: string) {
    super(
      `No decryption access${userId ? ` for user ${userId}` : ""}`,
      "NO_ACCESS",
    );
    this.name = "NoAccessError";
  }
}

export class InvalidFormatError extends CryptoError {
  constructor(detail?: string) {
    super(
      `Invalid encrypted format${detail ? `: ${detail}` : ""}`,
      "INVALID_FORMAT",
    );
    this.name = "InvalidFormatError";
  }
}

export class UnsupportedVersionError extends CryptoError {
  constructor(version: number, expected: number) {
    super(
      `Unsupported format version: got ${version}, expected ${expected}`,
      "UNSUPPORTED_VERSION",
    );
    this.name = "UnsupportedVersionError";
  }
}

export class UnsupportedSuiteError extends CryptoError {
  constructor(suite: number) {
    super(`Unsupported cipher suite: 0x${suite.toString(16)}`, "UNSUPPORTED_SUITE");
    this.name = "UnsupportedSuiteError";
  }
}

export class AuthenticationError extends CryptoError {
  constructor(detail?: string) {
    super(
      `Authentication failed${detail ? `: ${detail}` : ""}`,
      "AUTHENTICATION_FAILED",
    );
    this.name = "AuthenticationError";
  }
}

export class WebCryptoUnavailableError extends CryptoError {
  constructor() {
    super(
      "Web Crypto API not available — requires a secure context (HTTPS)",
      "NO_WEBCRYPTO",
    );
    this.name = "WebCryptoUnavailableError";
  }
}

export class KeyNotFoundError extends CryptoError {
  constructor(keyId?: string) {
    super(`Key not found${keyId ? `: ${keyId}` : ""}`, "KEY_NOT_FOUND");
    this.name = "KeyNotFoundError";
  }
}
