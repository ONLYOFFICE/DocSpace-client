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

// Spec: private-rooms/file-operations, "Name clashes in a private room are checked on the client".

import { getFolder } from "../../api/files";
import FilesFilter from "../../api/files/filter";
import type { TFile } from "../../api/files/types";
import { getCachedEncryptedFilename } from "../encryption/filename-cache";
import { wipeDek } from "../encryption/file-keys";
import type { IdentityKeyPair } from "../encryption/types";
import { addCopySuffix } from "./encrypted-copy";
import { recoverDekForReimport, sniffDse3Upload } from "./encrypted-upload";
import { recoverEncryptedFilenames } from "./encrypted-filename-recovery";
import { fileNameKey as nameKey } from "./safe-file-name";

const PAGE_SIZE = 100;

/**
 * The decrypted names of the files directly in a folder of a private room.
 * Names not cached yet are recovered first; one that cannot be recovered is
 * left out.
 */
export async function listDecryptedFileNames(
  folderId: number | string,
  roomId: number | string,
  userId: string,
  identity: IdentityKeyPair,
): Promise<string[]> {
  const files: TFile[] = [];
  let loaded = 0;
  for (let page = 0; ; page += 1) {
    const filter = FilesFilter.getDefault();
    filter.page = page;
    filter.pageCount = PAGE_SIZE;

    const data = await getFolder(folderId, filter);
    const count = data.files.length + data.folders.length;
    files.push(...data.files);
    loaded += count;
    if (count === 0 || loaded >= data.total) break;
  }

  await recoverEncryptedFilenames(
    files
      .filter(
        (file) =>
          file.encrypted &&
          file.viewUrl &&
          !getCachedEncryptedFilename(file.id),
      )
      .map((file) => ({ id: file.id, viewUrl: file.viewUrl })),
    userId,
    identity,
    roomId,
  );

  return files.flatMap((file) => {
    const name = file.encrypted
      ? getCachedEncryptedFilename(file.id)
      : file.title;
    return name ? [name] : [];
  });
}

/**
 * The name a new file is compared under: its own, or for a container
 * downloaded without decryption the one recovered from its header. Throws
 * EncryptedReimportError when a container's name cannot be recovered.
 */
// Spec: private-rooms/file-operations, "Re-import of a file downloaded without decryption"
export async function getUploadComparisonName(
  file: File,
  roomId: number | string,
  userId: string,
  identity: IdentityKeyPair,
): Promise<{ name: string; recovered: boolean }> {
  const header = await sniffDse3Upload(file);
  if (!header) return { name: file.name, recovered: false };
  const { dek, realName } = await recoverDekForReimport({
    file,
    header,
    roomId,
    userId,
    identity,
  });
  wipeDek(dek);
  return { name: realName, recovered: true };
}

/**
 * The comparison names of a folder's new files; a file whose name cannot be
 * recovered is set aside with its error.
 */
export async function nameUploadsForComparison<T>(
  items: T[],
  fileOf: (item: T) => File,
  roomId: number | string,
  userId: string,
  identity: IdentityKeyPair,
) {
  const named: { item: T; name: string; recovered: boolean }[] = [];
  const failed: { item: T; error: unknown }[] = [];
  for (const item of items) {
    try {
      const compared = await getUploadComparisonName(
        fileOf(item),
        roomId,
        userId,
        identity,
      );
      named.push({ item, ...compared });
    } catch (error) {
      failed.push({ item, error });
    }
  }
  return { named, failed };
}

export type TNameClash<T> = { item: T; name: string; renamed: string };

/**
 * The new files whose name is taken, by an existing file or by an earlier
 * file of the same batch, each with the first free copy-suffixed name.
 */
export function resolveNameClashes<T>(
  items: { item: T; name: string }[],
  existingNames: string[],
): TNameClash<T>[] {
  const taken = new Set(existingNames.map(nameKey));
  const clashes: TNameClash<T>[] = [];

  for (const { item, name } of items) {
    if (!taken.has(nameKey(name))) {
      taken.add(nameKey(name));
      continue;
    }

    let n = 1;
    let renamed = addCopySuffix(name, n);
    while (taken.has(nameKey(renamed))) {
      n += 1;
      renamed = addCopySuffix(name, n);
    }
    taken.add(nameKey(renamed));
    clashes.push({ item, name, renamed });
  }

  return clashes;
}
