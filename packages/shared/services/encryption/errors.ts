// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
