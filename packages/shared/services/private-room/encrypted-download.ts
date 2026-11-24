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
import { KeyReplacedError } from "../encryption/errors";
import { reportPotentialGhostState } from "../encryption/ghost-state-notifier";
import type { RoomMemberPublicKey } from "../encryption/room-file-access";
import type { IdentityKeyPair, ServerAccessKeyDto } from "../encryption/types";
import { addSuffix, fileNameKey, toSafeFileName } from "./safe-file-name";

export type DecryptConfig = {
  encryptedData: ArrayBuffer | Blob;
  fileId: number;
  fileKeys: ServerAccessKeyDto[];
  roomMemberKeys: RoomMemberPublicKey[];
  /** The caller's key list of the access answer. */
  userKeys?: readonly { id: string }[] | null;
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
  /** The file is wrapped for a key the user no longer holds. */
  keyReplaced?: boolean;
};

export async function decryptDownloadedFile(
  config: DecryptConfig,
): Promise<DecryptResult> {
  try {
    const dek = await unwrapDekForCurrentUser({
      fileKeys: config.fileKeys,
      roomMemberKeys: config.roomMemberKeys,
      userKeys: config.userKeys,
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

    const finalName = toSafeFileName(
      decryptedName,
      config.originalFileName,
      config.fileId,
    );
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
      keyReplaced: error instanceof KeyReplacedError,
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
      userKeys: config.userKeys,
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
  a.download = toSafeFileName(
    fileName,
    file instanceof File ? file.name : null,
    "download",
  );
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
  /** The file is wrapped for a key the user no longer holds. */
  keyReplaced?: boolean;
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
      keyReplaced: decryptResult.keyReplaced,
    };
  }

  const arrayBuffer = await decryptResult.file.arrayBuffer();
  return {
    success: true,
    data: new Uint8Array(arrayBuffer),
    fileName: decryptResult.file.name,
  };
}

const isBuiltPath = (path: string) =>
  path
    .split("/")
    .every((segment) => segment !== "" && toSafeFileName(segment) === segment);

/** Writes entries whose paths `toArchiveEntries` built; throws on any other. */
// Spec: private-rooms/file-operations, "Archive directories come from the folder tree"
export function createZipFromBuffers(
  files: Array<{ name: string; data: Uint8Array }>,
): Uint8Array {
  const unbuilt = files.find((file) => !isBuiltPath(file.name));
  if (unbuilt) {
    throw new Error(`archive entry path was not built: ${unbuilt.name}`);
  }

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

/**
 * Unique names, in order, compared without regard to case: the first
 * occurrence of a name keeps it, a later one gets the lowest " (n)" before
 * the extension that is neither in the list nor given out already, so
 * "a.txt", "a (1).txt", "a.txt" ends in "a (2).txt".
 */
export function deduplicateFileNames(names: string[]): string[] {
  const listed = new Set(names.map(fileNameKey));
  const used = new Set<string>();

  return names.map((name) => {
    if (!used.has(fileNameKey(name))) {
      used.add(fileNameKey(name));
      return name;
    }

    for (let n = 1; ; n += 1) {
      const candidate = addSuffix(name, ` (${n})`);
      const key = fileNameKey(candidate);
      if (!listed.has(key) && !used.has(key)) {
        used.add(key);
        return candidate;
      }
    }
  });
}

export type ArchiveItem = {
  data: Uint8Array;
  /** Name candidates in order, the last one the file's id. */
  names: Array<string | number | null | undefined>;
  /** From the folder the user picked down to the file's own folder. */
  folders: Array<{ id: number | string; title: string }>;
};

type ArchiveDir = {
  path: string;
  sub: Map<string, ArchiveDir>;
  children: Array<{ name: string; dir?: ArchiveDir }>;
};

const newArchiveDir = (): ArchiveDir => ({
  path: "",
  sub: new Map(),
  children: [],
});

/**
 * Archive entries in the order of the items: one directory per folder, and
 * the folders and files of each directory named apart from each other.
 */
// Spec: private-rooms/file-operations, "Archive directories come from the folder tree"
export function toArchiveEntries(
  items: ArchiveItem[],
): Array<{ name: string; data: Uint8Array }> {
  const root = newArchiveDir();
  const files = items.map((item) => {
    let dir = root;
    for (const folder of item.folders) {
      let next = dir.sub.get(String(folder.id));
      if (!next) {
        next = newArchiveDir();
        dir.sub.set(String(folder.id), next);
        dir.children.push({
          name: toSafeFileName(folder.title, folder.id),
          dir: next,
        });
      }
      dir = next;
    }
    const entry = { name: toSafeFileName(...item.names) };
    dir.children.push(entry);
    return { dir, entry, data: item.data };
  });

  const pending = [root];
  for (let dir = pending.pop(); dir; dir = pending.pop()) {
    const { path, children } = dir;
    deduplicateFileNames(children.map((c) => c.name)).forEach((name, i) => {
      const child = children[i];
      child.name = name;
      if (child.dir) {
        child.dir.path = `${path}${name}/`;
        pending.push(child.dir);
      }
    });
  }

  return files.map(({ dir, entry, data }) => ({
    name: `${dir.path}${entry.name}`,
    data,
  }));
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
