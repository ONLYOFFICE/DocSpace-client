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

import { runInAction } from "mobx";
import api from "@docspace/shared/api";
import { SortByFieldName } from "@docspace/shared/enums";
import { getCachedEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { recoverEncryptedFilenames } from "@docspace/shared/services/private-room/encrypted-filename-recovery";

import type { default as TFilesFilter } from "@docspace/shared/api/files/filter";

import type { TItem } from "./types";
import type { default as FilesStore } from "../FilesStore";

// Client-side search over decrypted names for private (E2E-encrypted) rooms.
// Encrypted file titles are stored server-side as opaque UUIDs, so the query
// never goes to the server; instead the current folder is loaded in full,
// names are recovered locally, and `filesList` is filtered in memory.
// See docs/private-room-client-search.md.

export const CLIENT_SEARCH_MAX_ITEMS = 10_000;

export function setClientSearchQueryImpl(
  self: FilesStore,
  query: string | null,
) {
  const next = query?.trim() || null;
  if (next === self.clientSearchQuery) return;

  if (!next) {
    clearClientSearchImpl(self);
    return;
  }

  self.clientSearchQuery = next;
  void loadAllPagesForClientSearchImpl(self);
}

export function clearClientSearchImpl(self: FilesStore) {
  // Bumping the generation cancels an in-flight page-loading loop.
  self.clientSearchGeneration += 1;
  self.clientSearchQuery = null;
  self.clientSearchLoading = false;
  self.clientSearchCapped = false;
}

// Loads every page of the current folder so the in-memory filter sees the
// whole folder, then awaits filename recovery so the UI can tell "still
// decrypting" apart from "no matches". Cancellation is generation-based:
// clearing the query, re-running the loader, or navigating away makes the
// running loop stale.
export async function loadAllPagesForClientSearchImpl(
  self: FilesStore,
): Promise<void> {
  const generation = runInAction(() => {
    self.clientSearchGeneration += 1;
    self.clientSearchLoading = true;
    self.clientSearchCapped = false;
    return self.clientSearchGeneration;
  });

  const folderId = self.selectedFolderStore.id;
  const isStale = () =>
    generation !== self.clientSearchGeneration ||
    !self.clientSearchQuery ||
    self.selectedFolderStore.id !== folderId;

  try {
    while (!isStale()) {
      const loaded = self.files.length + self.folders.length;
      if (loaded >= (self.filter.total ?? 0)) break;
      if (loaded >= CLIENT_SEARCH_MAX_ITEMS) {
        runInAction(() => {
          self.clientSearchCapped = true;
        });
        break;
      }

      const newFilter = self.filter.clone() as TFilesFilter;
      newFilter.page += 1;

      let data;
      try {
        data = await api.files.getFolder(newFilter.folder, newFilter);
      } catch (error) {
        console.error("Client search: failed to load folder page", error);
        break;
      }
      if (isStale()) return;

      // A stale `total` must not spin the loop once the server runs dry.
      if (data.files.length + data.folders.length === 0) break;

      const newFiles = [...self.files, ...data.files].filter(
        (x, index, arr) => index === arr.findIndex((i) => i.id === x.id),
      );
      const newFolders = [...self.folders, ...data.folders].filter(
        (x, index, arr) => index === arr.findIndex((i) => i.id === x.id),
      );

      runInAction(() => {
        self.setFilter(newFilter);
        self.setFiles(newFiles);
        self.setFolders(newFolders);
      });
    }

    if (!isStale()) await awaitFilenameRecovery(self);
  } finally {
    if (generation === self.clientSearchGeneration) {
      runInAction(() => {
        self.clientSearchLoading = false;
      });
    }
  }
}

// Joins the recovery of every still-undecrypted name in the loaded folder.
// setFiles() already fires a void-ed recovery pass per page; the in-flight
// registry inside encrypted-filename-recovery dedupes the actual fetches, so
// this await is a settle signal, not duplicate work.
async function awaitFilenameRecovery(self: FilesStore): Promise<void> {
  const userId = self.userStore?.user?.id;
  if (!userId) return;
  const identity = SecretStorage.getCached(String(userId));
  if (!identity) return;
  const roomId =
    self.selectedFolderStore.navigationPath.find((r) => r.isRoom)?.id ??
    (self.selectedFolderStore.isRoom ? self.selectedFolderStore.id : null);
  if (!roomId) return;

  const candidates = (self.files ?? [])
    .filter(
      (f) =>
        f.encrypted && f.id && f.viewUrl && !getCachedEncryptedFilename(f.id),
    )
    .map((f) => ({ id: f.id, viewUrl: f.viewUrl }));
  if (candidates.length === 0) return;

  await recoverEncryptedFilenames(
    candidates,
    String(userId),
    identity,
    roomId,
  );
}

// Filters the already-built list items by the client search query. Items
// arrive with resolved titles (decrypted names swapped in by
// buildFilesListItems), so matching `item.title` matches what the user sees.
export function applyClientSearchImpl(
  self: FilesStore,
  items: TItem[],
): TItem[] {
  const query = self.clientSearchQuery?.toLowerCase();
  if (!query) return items;

  const matched = items.filter((item) =>
    (item.title ?? "").toLowerCase().includes(query),
  );

  if (self.filter.sortBy !== SortByFieldName.Name) return matched;

  // Server-side name sort ordered encrypted files by their opaque UUID
  // titles; re-sort by the resolved titles. Folders stay grouped first.
  const direction = self.filter.sortOrder === "descending" ? -1 : 1;
  return matched.sort((a, b) => {
    const aFolder = a.isFolder ? 1 : 0;
    const bFolder = b.isFolder ? 1 : 0;
    if (aFolder !== bFolder) return bFolder - aFolder;
    return (
      direction *
      (a.title ?? "").localeCompare(b.title ?? "", undefined, {
        numeric: true,
        sensitivity: "accent",
      })
    );
  });
}
