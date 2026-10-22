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
import type { IdentityKeyPair } from "../encryption/types";
import { addCopySuffix } from "./encrypted-copy";
import { recoverEncryptedFilenames } from "./encrypted-filename-recovery";

const PAGE_SIZE = 100;

/** Titles in one folder compare without regard to case. */
const nameKey = (name: string) => name.toLowerCase();

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
      .filter((file) => file.encrypted && file.viewUrl)
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
