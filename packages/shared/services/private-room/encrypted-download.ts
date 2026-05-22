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

import { Zip, ZipPassThrough } from "fflate";

import { decryptFile, decryptFileFromBlob } from "../encryption/file-keys";
import { unwrapDekForCurrentUser } from "../encryption/room-file-access";
import { reportPotentialGhostState } from "../encryption/ghost-state-notifier";
import type { RoomMemberPublicKey } from "../encryption/room-file-access";
import type { IdentityKeyPair, ServerAccessKeyDto } from "../encryption/types";

export type DecryptConfig = {
  encryptedData: ArrayBuffer | Blob;
  fileId: number;
  fileKeys: ServerAccessKeyDto[];
  roomMemberKeys: RoomMemberPublicKey[];
  userId: string;
  identity: IdentityKeyPair;
  /** Fallback when the DSE3 header has no encrypted name. */
  originalFileName: string;
  originalFileType: string;
  onProgress?: (progress: number) => void;
};

export type DecryptResult = {
  success: boolean;
  file?: File;
  error?: string;
};

export async function decryptDownloadedFile(
  config: DecryptConfig,
): Promise<DecryptResult> {
  try {
    const dek = await unwrapDekForCurrentUser({
      fileKeys: config.fileKeys,
      roomMemberKeys: config.roomMemberKeys,
      currentUserId: config.userId,
      currentIdentity: config.identity,
      fileId: config.fileId,
    });

    const { data: decryptedBlob, fileName: decryptedName } =
      config.encryptedData instanceof Blob
        ? await decryptFileFromBlob(config.encryptedData, dek, {
            onProgress: config.onProgress,
            cacheFilenameForFileId: config.fileId,
          })
        : await decryptFile(config.encryptedData, dek, {
            onProgress: config.onProgress,
            cacheFilenameForFileId: config.fileId,
          });

    const finalName = decryptedName || config.originalFileName;
    const decryptedFile = new File([decryptedBlob], finalName, {
      type: config.originalFileType || "application/octet-stream",
    });

    return { success: true, file: decryptedFile };
  } catch (error) {
    reportPotentialGhostState(error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Decryption failed",
    };
  }
}

export type DownloadAndDecryptConfig = Omit<DecryptConfig, "encryptedData"> & {
  downloadUrl: string;
  onDownloadProgress?: (progress: number) => void;
};

export async function downloadAndDecryptFile(
  config: DownloadAndDecryptConfig,
): Promise<DecryptResult> {
  try {
    const response = await fetch(config.downloadUrl);
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
      return { success: false, error: "Failed to read response stream" };
    }

    let chunks: Uint8Array[] | null = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total && config.onDownloadProgress) {
        config.onDownloadProgress(loaded / total);
      }
    }

    const encryptedBlob = new Blob(chunks as BlobPart[]);
    chunks = null;

    return await decryptDownloadedFile({
      encryptedData: encryptedBlob,
      fileId: config.fileId,
      fileKeys: config.fileKeys,
      roomMemberKeys: config.roomMemberKeys,
      userId: config.userId,
      identity: config.identity,
      originalFileName: config.originalFileName,
      originalFileType: config.originalFileType,
      onProgress: config.onProgress,
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Download failed",
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

export type BatchDecryptResult = {
  success: boolean;
  data?: Uint8Array;
  fileName: string;
  error?: string;
};

export async function downloadAndDecryptFileToBuffer(
  config: DownloadAndDecryptConfig,
): Promise<BatchDecryptResult> {
  const decryptResult = await downloadAndDecryptFile(config);

  if (!decryptResult.success || !decryptResult.file) {
    return {
      success: false,
      fileName: config.originalFileName,
      error: decryptResult.error,
    };
  }

  const arrayBuffer = await decryptResult.file.arrayBuffer();
  return {
    success: true,
    data: new Uint8Array(arrayBuffer),
    fileName: decryptResult.file.name,
  };
}

export function createZipFromBuffers(
  files: Array<{ name: string; data: Uint8Array }>,
): Uint8Array {
  const outputChunks: Uint8Array[] = [];
  let totalSize = 0;

  const zip = new Zip((err, chunk) => {
    if (err) throw err;
    outputChunks.push(chunk);
    totalSize += chunk.length;
  });

  for (const file of files) {
    const entry = new ZipPassThrough(file.name);
    zip.add(entry);
    entry.push(file.data, true);
  }
  zip.end();

  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of outputChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export function deduplicateFileNames(names: string[]): string[] {
  const counts = new Map<string, number>();
  const result: string[] = [];

  for (const name of names) {
    const count = counts.get(name) ?? 0;
    counts.set(name, count + 1);

    if (count === 0) {
      result.push(name);
    } else {
      const dotIdx = name.lastIndexOf(".");
      if (dotIdx > 0) {
        const base = name.slice(0, dotIdx);
        const ext = name.slice(dotIdx);
        result.push(`${base} (${count})${ext}`);
      } else {
        result.push(`${name} (${count})`);
      }
    }
  }
  return result;
}

export function canUserDecrypt(
  fileKeys:
    | Array<{ userId: string }>
    | null
    | undefined,
  userId: string | null | undefined,
): boolean {
  if (!fileKeys || fileKeys.length === 0) return false;
  if (!userId) return false;
  return fileKeys.some((key) => String(key.userId) === String(userId));
}
