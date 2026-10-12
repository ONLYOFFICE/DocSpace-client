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

import type { IdentityKeyPair } from "../encryption/types";
import {
  getEmptyTemplateBytes,
  type TEmptyTemplateExtension,
} from "./empty-template";
import { orchestrateEncryptedUpload } from "./encrypted-upload-orchestrator";

export class EncryptedFileCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptedFileCreationError";
  }
}

export type CreateEncryptedFileArgs = {
  extension: TEmptyTemplateExtension;
  title: string;
  folderId: number | string;
  roomId: number | string;
  identity: IdentityKeyPair;
  userId: string;
  publicKey: string;
  publicKeyId: string;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

export type CreateEncryptedFileResult = {
  fileId: number | string;
  fileName: string;
};

export async function createEncryptedFile(
  args: CreateEncryptedFileArgs,
): Promise<CreateEncryptedFileResult> {
  const {
    extension,
    title,
    folderId,
    roomId,
    identity,
    userId,
    publicKey,
    publicKeyId,
    signal,
    onProgress,
  } = args;

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new EncryptedFileCreationError("File title must not be empty");
  }

  if (!identity || !userId || !publicKey || !publicKeyId) {
    throw new EncryptedFileCreationError(
      "Encryption identity and keys are required to create a file in a private room",
    );
  }

  const templateBytes = await getEmptyTemplateBytes({
    extension,
    signal,
  });

  const fileName = `${trimmedTitle}.${extension}`;
  const templateFile = new File([templateBytes], fileName);

  const { results } = await orchestrateEncryptedUpload({
    files: [templateFile],
    folderId,
    roomId,
    identity,
    userId,
    publicKey,
    publicKeyId,
    signal,
    uploadStore: onProgress
      ? {
          files: [],
          reportProgress: (_uploadId, percent) => onProgress(percent),
        }
      : undefined,
  });

  const result = results[0];

  if (result?.ok && result.fileId != null) {
    return { fileId: result.fileId, fileName };
  }

  if (result?.error) throw result.error;
  throw new EncryptedFileCreationError(
    result?.aborted
      ? "File creation was aborted"
      : "Encrypted file creation failed without a specific error",
  );
}
