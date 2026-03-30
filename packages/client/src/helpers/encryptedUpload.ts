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

import { RoomsType } from "@docspace/shared/enums";
import { encryptFile } from "@docspace/shared/services/encryption/encryptionService";
import { estimateEncryptedSize } from "@docspace/shared/services/encryption/streamingEncryption";

export type UploadConfig = {
  file: File;
  folderId: number;
  roomType: RoomsType;
  isPrivate?: boolean;
  userPublicKey: string | null;
  userId: string | null;
  onProgress?: (progress: number) => void;
};

export type PreparedUpload = {
  data: Blob;
  encrypted: boolean;
  dek: Uint8Array | null; // raw DEK — caller wraps for recipients after upload
  uploadFileName: string; // obfuscated name for server (UUID.ext) or real name if not encrypted
  originalFileType: string;
  originalFileSize: number;
};

const ENCRYPTABLE_ROOM_TYPES: RoomsType[] = [RoomsType.CustomRoom];

function obfuscateFileName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return `${crypto.randomUUID()}${ext}`;
}

export function isEncryptableRoomType(roomType: RoomsType): boolean {
  return ENCRYPTABLE_ROOM_TYPES.includes(roomType);
}

export function shouldEncryptUpload(
  roomType: RoomsType,
  userPublicKey: string | null | undefined,
  userId: string | null | undefined,
  isPrivate: boolean = false,
): boolean {
  return (
    isEncryptableRoomType(roomType) && isPrivate && !!userPublicKey && !!userId
  );
}

export async function prepareEncryptedUpload(
  config: UploadConfig,
): Promise<PreparedUpload> {
  const {
    file,
    roomType,
    isPrivate = false,
    userPublicKey,
    userId,
    onProgress,
  } = config;

  const shouldEncrypt = shouldEncryptUpload(
    roomType,
    userPublicKey,
    userId,
    isPrivate,
  );

  if (!shouldEncrypt || !userPublicKey || !userId) {
    return {
      data: file,
      encrypted: false,
      dek: null,
      uploadFileName: file.name,
      originalFileType: file.type || "application/octet-stream",
      originalFileSize: file.size,
    };
  }

  // Encrypt file — real name goes inside DSE3 header (encrypted).
  // Server receives only an obfuscated UUID-based name.
  const { encryptedBlob, dek } = await encryptFile(file, {
    fileName: file.name,
    onProgress,
  });

  return {
    data: encryptedBlob,
    encrypted: true,
    dek,
    uploadFileName: obfuscateFileName(file.name),
    originalFileType: "application/octet-stream",
    originalFileSize: file.size,
  };
}

export function createEncryptedFormData(
  preparedUpload: PreparedUpload,
  additionalFields: Record<string, string> = {},
): FormData {
  const formData = new FormData();

  // For encrypted files, the server receives only the obfuscated UUID name.
  // The real file name is encrypted inside the DSE3 blob header.
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
  userPublicKey: string | null,
  userId: string | null,
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
      userPublicKey,
      userId,
      onProgress: (progress) => onFileProgress?.(i, progress),
    });
    results.push(prepared);
  }

  return results;
}

export function estimateEncryptedUploadSize(files: File[]): number {
  return files.reduce((total, file) => {
    return total + estimateEncryptedSize(file.size);
  }, 0);
}
