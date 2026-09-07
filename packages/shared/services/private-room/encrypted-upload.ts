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

import { getFolder, getFileEncryptionAccess } from "../../api/files";
import FilesFilter from "../../api/files/filter";
import { RoomsType } from "../../enums";
import { getFileExtension } from "../../utils/common";
import { encryptFile, wipeDek } from "../encryption/file-keys";
import { unwrapDekForCurrentUser } from "../encryption/room-file-access";
import {
  decryptFileNameRaw,
  estimateEncryptedSize,
  isDSE3Format,
  parseDSE3HeaderFromBlob,
} from "../encryption/streaming-encryption";
import { sniffPdfFormBlob } from "./pdf-form-signature";
import { loadFileSenderKeysSafe } from "./room-member-keys";

import type { DSE3Header, IdentityKeyPair } from "../encryption/types";

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

export function makeOpaqueUploadName(originalName: string): string {
  const name = `${newUuid()}${getFileExtension(originalName)}`;
  assertEncryptedUploadName(name);
  return name;
}

export class EncryptedReimportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptedReimportError";
  }
}

const DSE3_MAGIC_PROBE_BYTES = 8;

export async function sniffDse3Upload(file: Blob): Promise<DSE3Header | null> {
  const magic = new Uint8Array(
    await file.slice(0, DSE3_MAGIC_PROBE_BYTES).arrayBuffer(),
  );
  if (!isDSE3Format(magic)) return null;
  try {
    const { header } = await parseDSE3HeaderFromBlob(file);
    return header;
  } catch (error) {
    throw new EncryptedReimportError(
      `DSE3 magic with unreadable header: ${(error as Error)?.message}`,
    );
  }
}

const UUID_IN_NAME_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export type ReimportRecovery = {
  dek: Uint8Array;
  realName: string;
  sourceFileId: number;
};

export async function recoverDekForReimport(params: {
  file: File;
  header: DSE3Header;
  roomId: number | string;
  userId: string;
  identity: IdentityKeyPair;
}): Promise<ReimportRecovery> {
  const { file, header, roomId, userId, identity } = params;

  if (!header.encryptedName) {
    throw new EncryptedReimportError(
      "uploaded DSE3 blob has no embedded name to verify a DEK against",
    );
  }
  const encryptedName = header.encryptedName;

  const uuidMatch = file.name.toLowerCase().match(UUID_IN_NAME_RE);
  if (!uuidMatch) {
    throw new EncryptedReimportError(
      `uploaded DSE3 blob name carries no source uuid: ${JSON.stringify(file.name)}`,
    );
  }

  const filter = FilesFilter.getDefault();
  filter.search = uuidMatch[0];
  filter.withSubfolders = true;
  const { files } = await getFolder(roomId, filter);

  for (const candidate of files) {
    if (!candidate.encrypted) continue;
    let dek: Uint8Array | null = null;
    try {
      const info = await getFileEncryptionAccess(candidate.id);
      if (!info?.fileKeys?.length) continue;
      const roomMemberKeys = await loadFileSenderKeysSafe(candidate.id, roomId);
      dek = await unwrapDekForCurrentUser({
        fileKeys: info.fileKeys,
        roomMemberKeys,
        currentUserId: userId,
        currentIdentity: identity,
        fileId: candidate.id,
      });
      const realName = await decryptFileNameRaw(
        encryptedName,
        dek,
        header.fileNonce,
      );
      return { dek, realName, sourceFileId: candidate.id };
    } catch {
      if (dek) wipeDek(dek);
    }
  }

  throw new EncryptedReimportError(
    "no source file in the room decrypts the uploaded blob",
  );
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

  if ((await sniffDse3Upload(file)) !== null) {
    throw new EncryptedReimportError(
      "upload is already a DSE3 blob — refusing to encrypt it again",
    );
  }

  const isForm =
    getFileExtension(file.name) === ".pdf" && (await sniffPdfFormBlob(file));

  const { encryptedBlob, dek } = await encryptFile(file, {
    fileName: file.name,
    isForm,
    onProgress,
  });

  const uploadFileName = makeOpaqueUploadName(file.name);

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
