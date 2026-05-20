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
