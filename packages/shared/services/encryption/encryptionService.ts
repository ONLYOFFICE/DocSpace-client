// (c) Copyright Ascensio System SIA 2009-2025
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

import type {
  FileEncryptionMetadata,
  ServerAccessRequestKeyDto,
} from "./types";
import { ENCRYPTION_CONSTANTS } from "./types";
import {
  importPublicKey,
  generateAESKey,
  encryptAESKeyWithRSA,
  decryptAESKeyWithRSA,
  getPublicKeyFingerprint,
  getCrypto,
} from "./keyManagement";
import {
  isChunkedFormat,
  encryptFileChunked,
  decryptChunked,
  shouldUseChunkedEncryption,
} from "./streamingEncryption";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export type EncryptFileResult = {
  encryptedBlob: Blob;
  metadata: FileEncryptionMetadata;
};

export type EncryptionProgressCallback = (progress: number) => void;

export class EncryptionService {
  async encryptFile(
    file: File,
    recipientPublicKeyBase64: string,
    recipientUserId: string,
    onProgress?: EncryptionProgressCallback,
  ): Promise<EncryptFileResult> {
    const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
    const aesKeyRaw = generateAESKey();

    let encryptedBlob: Blob;
    let version: number;
    let iv: Uint8Array;

    if (shouldUseChunkedEncryption(file.size)) {
      encryptedBlob = await encryptFileChunked(file, aesKeyRaw, onProgress);
      version = 2;
      iv = new Uint8Array(0);
    } else {
      const subtle = getCrypto();
      const fileBuffer = await file.arrayBuffer();

      const aesKey = await subtle.importKey(
        "raw",
        aesKeyRaw as BufferSource,
        { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
        false,
        ["encrypt"],
      );

      iv = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE),
      );

      const encryptedContent = await subtle.encrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        aesKey,
        fileBuffer,
      );

      const encryptedWithIV = new Uint8Array(
        iv.length + encryptedContent.byteLength,
      );
      encryptedWithIV.set(iv, 0);
      encryptedWithIV.set(new Uint8Array(encryptedContent), iv.length);

      encryptedBlob = new Blob([encryptedWithIV], {
        type: "application/octet-stream",
      });
      version = 1;

      onProgress?.(1);
    }

    const encryptedAESKey = await encryptAESKeyWithRSA(
      aesKeyRaw,
      recipientPublicKey,
    );

    const metadata: FileEncryptionMetadata = {
      encrypted: true,
      version,
      encryptionAlgorithm: "AES-256-GCM",
      keyEncryptionAlgorithm: "RSA-OAEP-SHA256",
      encryptedKeys: [
        {
          userId: recipientUserId,
          publicKeyId: "",
          privateKeyEnc: encryptedAESKey,
        },
      ],
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      encryptedAt: new Date().toISOString(),
    };

    return { encryptedBlob, metadata };
  }

  async encryptFileForRecipients(
    file: File,
    recipients: Array<{ userId: string; publicKeyBase64: string }>,
  ): Promise<EncryptFileResult> {
    if (recipients.length === 0) {
      throw new Error("At least one recipient is required");
    }

    const subtle = getCrypto();
    const fileBuffer = await file.arrayBuffer();
    const aesKeyRaw = generateAESKey();

    const aesKey = await subtle.importKey(
      "raw",
      aesKeyRaw as BufferSource,
      { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
      false,
      ["encrypt"],
    );

    const iv = crypto.getRandomValues(
      new Uint8Array(ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE),
    );

    const encryptedContent = await subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      aesKey,
      fileBuffer,
    );

    const encryptedKeys = await Promise.all(
      recipients.map(async (recipient) => {
        const publicKey = await importPublicKey(recipient.publicKeyBase64);
        const encryptedAESKey = await encryptAESKeyWithRSA(
          aesKeyRaw,
          publicKey,
        );
        return {
          userId: recipient.userId,
          publicKeyId: "",
          privateKeyEnc: encryptedAESKey,
        };
      }),
    );

    const encryptedWithIV = new Uint8Array(
      iv.length + encryptedContent.byteLength,
    );
    encryptedWithIV.set(iv, 0);
    encryptedWithIV.set(new Uint8Array(encryptedContent), iv.length);

    const encryptedBlob = new Blob([encryptedWithIV], {
      type: "application/octet-stream",
    });

    const metadata: FileEncryptionMetadata = {
      encrypted: true,
      version: 1,
      encryptionAlgorithm: "AES-256-GCM",
      keyEncryptionAlgorithm: "RSA-OAEP-SHA256",
      encryptedKeys,
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      encryptedAt: new Date().toISOString(),
    };

    return { encryptedBlob, metadata };
  }

  async decryptFile(
    encryptedData: ArrayBuffer,
    metadata: FileEncryptionMetadata,
    privateKey: CryptoKey,
    userId: string,
    onProgress?: EncryptionProgressCallback,
  ): Promise<Blob> {
    if (!metadata.encrypted) {
      throw new Error("File is not encrypted");
    }

    const userKey = metadata.encryptedKeys.find((k) => k.userId === userId);
    if (!userKey) {
      throw new Error("You do not have access to decrypt this file");
    }

    let aesKeyRaw: Uint8Array;
    try {
      aesKeyRaw = await decryptAESKeyWithRSA(userKey.privateKeyEnc, privateKey);
    } catch {
      throw new Error(
        "Failed to decrypt file key - you may not have access to this file",
      );
    }

    if (isChunkedFormat(encryptedData)) {
      return decryptChunked(encryptedData, aesKeyRaw, onProgress);
    }

    const encryptedArray = new Uint8Array(encryptedData);
    const ivSize = ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;

    if (encryptedArray.length < ivSize) {
      throw new Error("Invalid encrypted data - too short to contain IV");
    }

    const iv = encryptedArray.slice(0, ivSize);
    const ciphertext = encryptedArray.slice(ivSize);

    const subtle = getCrypto();
    const aesKey = await subtle.importKey(
      "raw",
      aesKeyRaw as BufferSource,
      { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
      false,
      ["decrypt"],
    );

    let decryptedContent: ArrayBuffer;
    try {
      decryptedContent = await subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        aesKey,
        ciphertext,
      );
    } catch {
      throw new Error("Failed to decrypt file content - data may be corrupted");
    }

    onProgress?.(1);
    return new Blob([decryptedContent]);
  }

  async decryptFileAnyKey(
    encryptedData: ArrayBuffer,
    metadata: FileEncryptionMetadata,
    privateKey: CryptoKey,
    onProgress?: EncryptionProgressCallback,
  ): Promise<Blob> {
    if (!metadata.encrypted) {
      throw new Error("File is not encrypted");
    }

    const chunked = isChunkedFormat(encryptedData);

    if (chunked) {
      for (const encryptedKey of metadata.encryptedKeys) {
        try {
          const aesKeyRaw = await decryptAESKeyWithRSA(
            encryptedKey.privateKeyEnc,
            privateKey,
          );
          return await decryptChunked(encryptedData, aesKeyRaw, onProgress);
        } catch {
          continue;
        }
      }
      throw new Error("Failed to decrypt file - no valid key found");
    }

    // Legacy v1 format: [12-byte IV][encrypted content with auth tag]
    const encryptedArray = new Uint8Array(encryptedData);
    const ivSize = ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;

    if (encryptedArray.length < ivSize) {
      throw new Error("Invalid encrypted data - too short to contain IV");
    }

    const iv = encryptedArray.slice(0, ivSize);
    const ciphertext = encryptedArray.slice(ivSize);
    const subtle = getCrypto();

    for (const encryptedKey of metadata.encryptedKeys) {
      try {
        const aesKeyRaw = await decryptAESKeyWithRSA(
          encryptedKey.privateKeyEnc,
          privateKey,
        );

        const aesKey = await subtle.importKey(
          "raw",
          aesKeyRaw as BufferSource,
          { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
          false,
          ["decrypt"],
        );

        const decryptedContent = await subtle.decrypt(
          { name: "AES-GCM", iv: iv as BufferSource },
          aesKey,
          ciphertext,
        );

        onProgress?.(1);
        return new Blob([decryptedContent]);
      } catch {
        continue;
      }
    }

    throw new Error("Failed to decrypt file - no valid key found");
  }

  async createKeyForRecipient(
    metadata: FileEncryptionMetadata,
    privateKey: CryptoKey,
    currentUserId: string,
    newRecipientPublicKeyBase64: string,
    newRecipientUserId: string,
  ): Promise<ServerAccessRequestKeyDto> {
    const currentUserKey = metadata.encryptedKeys.find(
      (k) => k.userId === currentUserId,
    );
    if (!currentUserKey) {
      throw new Error("You do not have access to this file");
    }

    const aesKeyRaw = await decryptAESKeyWithRSA(
      currentUserKey.privateKeyEnc,
      privateKey,
    );

    const newRecipientPublicKey = await importPublicKey(
      newRecipientPublicKeyBase64,
    );

    const encryptedAESKey = await encryptAESKeyWithRSA(
      aesKeyRaw,
      newRecipientPublicKey,
    );

    // Generate fingerprint for publicKeyId instead of storing full key
    const publicKeyFingerprint = await getPublicKeyFingerprint(
      newRecipientPublicKeyBase64,
    );

    return {
      userId: newRecipientUserId,
      publicKeyId: publicKeyFingerprint,
      privateKeyEnc: encryptedAESKey,
    };
  }

  async decryptWithServerKey(
    encryptedData: ArrayBuffer,
    ivBase64: string,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
  ): Promise<Blob> {
    const iv = base64ToUint8Array(ivBase64);

    let aesKeyRaw: Uint8Array;
    try {
      aesKeyRaw = await decryptAESKeyWithRSA(encryptedSymmetricKey, privateKey);
    } catch {
      throw new Error(
        "Failed to decrypt file key - you may not have access to this file",
      );
    }

    const subtle = getCrypto();
    const aesKey = await subtle.importKey(
      "raw",
      aesKeyRaw as BufferSource,
      { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
      false,
      ["decrypt"],
    );

    let decryptedContent: ArrayBuffer;
    try {
      decryptedContent = await subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        aesKey,
        encryptedData,
      );
    } catch {
      throw new Error("Failed to decrypt file content - data may be corrupted");
    }

    return new Blob([decryptedContent]);
  }

  canUserDecrypt(metadata: FileEncryptionMetadata, userId: string): boolean {
    if (!metadata.encrypted) return true;
    return metadata.encryptedKeys.some((k) => k.userId === userId);
  }

  getAuthorizedUsers(metadata: FileEncryptionMetadata): string[] {
    if (!metadata.encrypted) return [];
    return metadata.encryptedKeys.map((k) => k.userId);
  }

  isValidMetadata(metadata: unknown): metadata is FileEncryptionMetadata {
    if (!metadata || typeof metadata !== "object") return false;

    const m = metadata as Record<string, unknown>;

    return (
      typeof m.encrypted === "boolean" &&
      typeof m.version === "number" &&
      m.encryptionAlgorithm === "AES-256-GCM" &&
      m.keyEncryptionAlgorithm === "RSA-OAEP-SHA256" &&
      Array.isArray(m.encryptedKeys) &&
      typeof m.iv === "string" &&
      typeof m.encryptedAt === "string"
    );
  }

  async getKeyFingerprint(publicKeyBase64: string): Promise<string> {
    return getPublicKeyFingerprint(publicKeyBase64);
  }
}

export const encryptionService = new EncryptionService();

export default encryptionService;
