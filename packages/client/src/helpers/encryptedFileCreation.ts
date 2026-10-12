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

import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { resolveDisplayTitle } from "@docspace/shared/services/encryption/filename-cache";
import { createEncryptedFile } from "@docspace/shared/services/private-room/encrypted-file-creation";
import {
  EMPTY_TEMPLATE_EXTENSIONS,
  type TEmptyTemplateExtension,
} from "@docspace/shared/services/private-room/empty-template";

export function isEncryptedCreateExtension(
  extension: string | null | undefined,
): extension is TEmptyTemplateExtension {
  return EMPTY_TEMPLATE_EXTENSIONS.includes(
    extension as TEmptyTemplateExtension,
  );
}

export function getUniqueFileTitle(
  baseTitle: string,
  extension: string,
  existingFileNames: Iterable<string>,
): string {
  const taken = new Set<string>();
  for (const name of existingFileNames) {
    taken.add(name.toLowerCase());
  }

  let candidate = baseTitle;
  let index = 1;
  while (taken.has(`${candidate}.${extension}`.toLowerCase())) {
    candidate = `${baseTitle} (${index})`;
    index += 1;
  }
  return candidate;
}

export function getDisplayFileNames(
  files: Iterable<{
    id?: number | string | null;
    title?: string | null;
    encrypted?: boolean | null;
  }>,
): string[] {
  const names: string[] = [];
  for (const file of files) {
    const name = resolveDisplayTitle(file);
    if (name) names.push(name);
  }
  return names;
}

export type RunEncryptedFileCreationParams = {
  extension: TEmptyTemplateExtension;
  title: string;
  parentId: number | string;
  roomId: number | string | null;
  userId: string | null;
  publicKey: string | null;
  publicKeyId: string | null;
};

export type RunEncryptedFileCreationResult = {
  fileId: number | string;
  fileName: string;
};

export async function runEncryptedFileCreation(
  params: RunEncryptedFileCreationParams,
): Promise<RunEncryptedFileCreationResult | null> {
  const {
    extension,
    title,
    parentId,
    roomId,
    userId,
    publicKey,
    publicKeyId,
  } = params;

  if (!isEncryptedCreateExtension(extension)) {
    throw new Error(
      `Creating "${extension}" files is not supported in private rooms`,
    );
  }

  if (!userId || !publicKey || !publicKeyId || !roomId) {
    throw new Error(
      "Encryption keys are not available — cannot create a file in a private room",
    );
  }

  const identity = await requireUnlock(userId);
  if (!identity) return null;

  return createEncryptedFile({
    extension,
    title,
    folderId: parentId,
    roomId,
    identity,
    userId,
    publicKey,
    publicKeyId,
  });
}
