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

import { encryptionService } from "@docspace/shared/services/encryption/encryptionService";
import { SecretStorageService } from "@docspace/shared/services/encryption/secretStorage";
import { decryptPrivateKey } from "@docspace/shared/services/encryption/keyManagement";
import type {
  FileEncryptionMetadata,
  SerializedKeyPair,
} from "@docspace/shared/services/encryption/types";

export type DecryptConfig = {
  encryptedData: ArrayBuffer;
  metadata: FileEncryptionMetadata;
  originalFileName: string;
  originalFileType: string;
  userKeys: SerializedKeyPair;
  userId: string;
  onPassphraseRequired: () => Promise<string | null>;
};

export type DecryptResult = {
  success: boolean;
  file?: File;
  error?: string;
};

export async function decryptDownloadedFile(
  config: DecryptConfig,
): Promise<DecryptResult> {
  const {
    encryptedData,
    metadata,
    originalFileName,
    originalFileType,
    userKeys,
    userId,
    onPassphraseRequired,
  } = config;

  if (!metadata.encrypted) {
    return {
      success: false,
      error: "File is not encrypted",
    };
  }

  let privateKey = await SecretStorageService.getCachedKey();

  if (!privateKey) {
    const passphrase = await onPassphraseRequired();

    if (!passphrase) {
      return {
        success: false,
        error: "Passphrase required for decryption",
      };
    }

    try {
      privateKey = await decryptPrivateKey(userKeys.privateKeyEnc, passphrase);

      await SecretStorageService.cacheDecryptedKey(privateKey);
    } catch {
      SecretStorageService.markDecryptionAttempted();
      return {
        success: false,
        error: "Invalid passphrase",
      };
    }
  }

  try {
    const decryptedBlob = await encryptionService.decryptFile(
      encryptedData,
      metadata,
      privateKey,
      userId,
    );

    const decryptedFile = new File([decryptedBlob], originalFileName, {
      type: originalFileType || "application/octet-stream",
    });

    return {
      success: true,
      file: decryptedFile,
    };
  } catch (decryptError) {
    return {
      success: false,
      error:
        decryptError instanceof Error
          ? decryptError.message
          : "Decryption failed",
    };
  }
}

export async function createDecryptedPreviewUrl(
  config: DecryptConfig,
): Promise<string | null> {
  const result = await decryptDownloadedFile(config);

  if (!result.success || !result.file) {
    return null;
  }

  return URL.createObjectURL(result.file);
}

export async function downloadAndDecryptFile(
  downloadUrl: string,
  metadata: FileEncryptionMetadata,
  originalFileName: string,
  originalFileType: string,
  userKeys: SerializedKeyPair,
  userId: string,
  onPassphraseRequired: () => Promise<string | null>,
  onProgress?: (progress: number) => void,
): Promise<DecryptResult> {
  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download file: ${response.status} ${response.statusText}`,
      };
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? Number.parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
      return {
        success: false,
        error: "Failed to read response stream",
      };
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (total && onProgress) {
        onProgress(loaded / total);
      }
    }

    const encryptedData = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      encryptedData.set(chunk, offset);
      offset += chunk.length;
    }

    return await decryptDownloadedFile({
      encryptedData: encryptedData.buffer,
      metadata,
      originalFileName,
      originalFileType,
      userKeys,
      userId,
      onPassphraseRequired,
    });
  } catch (downloadError) {
    return {
      success: false,
      error:
        downloadError instanceof Error
          ? downloadError.message
          : "Download failed",
    };
  }
}

export function triggerFileDownload(
  file: File | Blob,
  fileName?: string,
): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || (file instanceof File ? file.name : "download");
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canUserDecrypt(
  metadata: FileEncryptionMetadata | null | undefined,
  userId: string | null | undefined,
): boolean {
  if (!metadata?.encrypted) return true;
  if (!userId) return false;

  return metadata.encryptedKeys?.some((key) => key.userId === userId) ?? false;
}

export function getUserEncryptedKey(
  metadata: FileEncryptionMetadata,
  userId: string,
): string | null {
  const userKey = metadata.encryptedKeys?.find((key) => key.userId === userId);
  return userKey?.privateKeyEnc ?? null;
}
