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

import {
  AES_KEY_SIZE_BYTES,
  DSE3_FILE_NONCE_SIZE,
  type DecryptFileResult,
  type EncryptFileResult,
  type ProgressCallback,
} from "./types";
import { DecryptionError } from "./errors";
import { getRandomBytes, zeroBuffer } from "./utils";
import {
  decryptChunked,
  decryptChunkedFromBlob,
  decryptFileNameRaw,
  encryptChunked,
  encryptFileNameRaw,
  getDSE3HeaderSize,
  isDSE3Format,
  parseDSE3Header,
  parseDSE3HeaderFromBlob,
} from "./streaming-encryption";
import { rememberEncryptedFilename } from "./filename-cache";

export function generateDEK(): Uint8Array {
  return getRandomBytes(AES_KEY_SIZE_BYTES);
}

export type EncryptFileOptions = {
  dek?: Uint8Array;
  /** Encrypted into the DSE3 header - server never sees the real name. */
  fileName?: string;
  onProgress?: ProgressCallback;
};

export async function encryptFile(
  data: File | Blob | ArrayBuffer | Uint8Array,
  options: EncryptFileOptions = {},
): Promise<EncryptFileResult> {
  const dek = options.dek ?? generateDEK();
  // Single fileNonce binds the header-name AAD and every chunk's AAD.
  const fileNonce = getRandomBytes(DSE3_FILE_NONCE_SIZE);

  let encryptedName: Uint8Array | null = null;
  if (options.fileName) {
    encryptedName = await encryptFileNameRaw(
      options.fileName,
      dek,
      fileNonce,
    );
  }

  const encryptedBlob = await encryptChunked(
    data,
    dek,
    encryptedName,
    options.onProgress,
    fileNonce,
  );

  return { encryptedBlob, dek };
}

export type DecryptFileOptions = {
  onProgress?: ProgressCallback;
  /** Pass server-assigned fileId to seed the filename cache from the header. */
  cacheFilenameForFileId?: number | string;
};

export async function decryptFile(
  encryptedData: ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  options: DecryptFileOptions = {},
): Promise<DecryptFileResult> {
  const bytes =
    encryptedData instanceof Uint8Array
      ? encryptedData
      : new Uint8Array(encryptedData);

  if (!isDSE3Format(bytes)) {
    throw new DecryptionError("not a DSE3 v2 file");
  }
  const header = parseDSE3Header(bytes);
  const headerSize = getDSE3HeaderSize(header);

  let fileName: string | null = null;
  if (header.encryptedName) {
    fileName = await decryptFileNameRaw(
      header.encryptedName,
      dek,
      header.fileNonce,
    );
    if (fileName && options.cacheFilenameForFileId) {
      rememberEncryptedFilename(options.cacheFilenameForFileId, fileName);
    }
  }

  const data = await decryptChunked(
    bytes,
    dek,
    header,
    headerSize,
    options.onProgress,
  );
  return { data, fileName };
}

export async function decryptFileFromBlob(
  encrypted: Blob,
  dek: Uint8Array,
  options: DecryptFileOptions = {},
): Promise<DecryptFileResult> {
  const magic = new Uint8Array(await encrypted.slice(0, 4).arrayBuffer());
  if (!isDSE3Format(magic)) {
    throw new DecryptionError("not a DSE3 v2 file");
  }

  const { header, headerSize } = await parseDSE3HeaderFromBlob(encrypted);

  let fileName: string | null = null;
  if (header.encryptedName) {
    fileName = await decryptFileNameRaw(
      header.encryptedName,
      dek,
      header.fileNonce,
    );
    if (fileName && options.cacheFilenameForFileId) {
      rememberEncryptedFilename(options.cacheFilenameForFileId, fileName);
    }
  }

  const data = await decryptChunkedFromBlob(
    encrypted,
    dek,
    header,
    headerSize,
    options.onProgress,
  );
  return { data, fileName };
}

export function wipeDek(dek: Uint8Array): void {
  zeroBuffer(dek);
}
