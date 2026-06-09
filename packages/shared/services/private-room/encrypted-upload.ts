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

import { RoomsType } from "../../enums";
import { getFileExtension } from "../../utils/common";
import { encryptFile } from "../encryption/file-keys";
import { estimateEncryptedSize } from "../encryption/streaming-encryption";

export type UploadConfig = {
  file: File;
  folderId: number;
  roomType: RoomsType;
  isPrivate?: boolean;
  onProgress?: (progress: number) => void;
};

export type PreparedUpload = {
  data: Blob;
  encrypted: boolean;
  /** Raw 32-byte AES-256 DEK; null if not encrypted. Caller wipes after wrap. */
  dek: Uint8Array | null;
  uploadFileName: string;
  originalFileType: string;
  originalFileSize: number;
  originalFileName: string;
};

const ENCRYPTABLE_ROOM_TYPES: RoomsType[] = [RoomsType.CustomRoom];

const ENCRYPTED_UPLOAD_NAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/;

export function isEncryptableRoomType(roomType: RoomsType): boolean {
  return ENCRYPTABLE_ROOM_TYPES.includes(roomType);
}

export function shouldEncryptUpload(
  roomType: RoomsType,
  isPrivate: boolean = false,
): boolean {
  return isEncryptableRoomType(roomType) && isPrivate;
}

export type UploadFolderContext = {
  isPrivacyFolder: boolean;
  selectedRoomType?: RoomsType | null;
};

export type ItemUploadContext = {
  roomType?: RoomsType;
  isPrivate?: boolean;
};

export function resolveItemRoomContext(
  uploadContext: ItemUploadContext | undefined,
  folder: UploadFolderContext,
): { roomType: RoomsType | null | undefined; isPrivate: boolean } {
  const roomType =
    uploadContext?.roomType ??
    (folder.isPrivacyFolder ? RoomsType.CustomRoom : folder.selectedRoomType);
  const isPrivate =
    uploadContext && "isPrivate" in uploadContext
      ? !!uploadContext.isPrivate
      : folder.isPrivacyFolder;
  return { roomType, isPrivate };
}

export function willEncryptUploadItem(
  params: {
    uploadContext?: ItemUploadContext;
    alreadyEncrypted?: boolean;
    publicKey?: string | null;
    userId?: string | null;
  },
  folder: UploadFolderContext,
): boolean {
  if (params.alreadyEncrypted) return false;
  if (!params.publicKey || !params.userId) return false;
  const { roomType, isPrivate } = resolveItemRoomContext(
    params.uploadContext,
    folder,
  );
  if (roomType === null || roomType === undefined) return false;
  return shouldEncryptUpload(roomType, isPrivate);
}

function newUuid(): string {
  return globalThis.crypto.randomUUID();
}

export function assertEncryptedUploadName(name: string): void {
  if (!ENCRYPTED_UPLOAD_NAME_RE.test(name)) {
    throw new Error(
      `Encrypted upload name does not match UUID format: ${JSON.stringify(name)}`,
    );
  }
}

export async function prepareEncryptedUpload(
  config: UploadConfig,
): Promise<PreparedUpload> {
  const { file, roomType, isPrivate = false, onProgress } = config;
  const shouldEncrypt = shouldEncryptUpload(roomType, isPrivate);

  if (!shouldEncrypt) {
    return {
      data: file,
      encrypted: false,
      dek: null,
      uploadFileName: file.name,
      originalFileType: file.type || "application/octet-stream",
      originalFileSize: file.size,
      originalFileName: file.name,
    };
  }

  const { encryptedBlob, dek } = await encryptFile(file, {
    fileName: file.name,
    onProgress,
  });

  const ext = getFileExtension(file.name);
  const uploadFileName = `${newUuid()}${ext}`;
  assertEncryptedUploadName(uploadFileName);

  return {
    data: encryptedBlob,
    encrypted: true,
    dek,
    uploadFileName,
    originalFileType: file.type || "application/octet-stream",
    originalFileSize: file.size,
    originalFileName: file.name,
  };
}

export function createEncryptedFormData(
  preparedUpload: PreparedUpload,
  additionalFields: Record<string, string> = {},
): FormData {
  const formData = new FormData();
  formData.append("file", preparedUpload.data, preparedUpload.uploadFileName);
  if (preparedUpload.encrypted) {
    formData.append("encrypted", "true");
  }
  for (const [key, value] of Object.entries(additionalFields)) {
    formData.append(key, value);
  }
  return formData;
}

export async function prepareMultipleEncryptedUploads(
  files: File[],
  roomType: RoomsType,
  isPrivate: boolean = false,
  onFileProgress?: (fileIndex: number, progress: number) => void,
): Promise<PreparedUpload[]> {
  const results: PreparedUpload[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const prepared = await prepareEncryptedUpload({
      file,
      folderId: 0,
      roomType,
      isPrivate,
      onProgress: (progress) => onFileProgress?.(i, progress),
    });
    results.push(prepared);
  }
  return results;
}

export function estimateEncryptedUploadSize(files: File[]): number {
  return files.reduce(
    (total, file) => total + estimateEncryptedSize(file.size),
    0,
  );
}
