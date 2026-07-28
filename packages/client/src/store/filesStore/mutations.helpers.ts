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
import { EMPTY_ARRAY } from "@docspace/shared/constants";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { Nullable } from "@docspace/shared/types";
import type { default as TFilesFilter } from "@docspace/shared/api/files/filter";
import type { default as TRoomsFilter } from "@docspace/shared/api/rooms/filter";

import type { default as FilesStore } from "../FilesStore";

// State-mutation actions extracted from FilesStore. Side-effectful (not
// computeds); moved verbatim into free functions over `self: FilesStore`.
// noImplicitThis guarantees the this->self rewrite is complete.
export function removeFilesImpl(
  self: FilesStore,
  fileIds?: Nullable<(number | string)[]>,
  folderIds?: Nullable<(number | string)[]>,
  showToast?: Nullable<() => void>,
  destFolderId?: Nullable<number | string>,
) {
  const {
    isRoomsFolder,
    isArchiveFolder,
    isTemplatesFolder,
    isAIAgentsFolder,
    isFormsFolder,
  } = self.treeFoldersStore;

  const isRooms =
    isRoomsFolder ||
    isArchiveFolder ||
    isTemplatesFolder ||
    isAIAgentsFolder ||
    isFormsFolder;

  let deleteCount = 0;

  if (fileIds) {
    let i = fileIds.length;
    while (i !== 0) {
      const file = self.files.find((x) => x.id === fileIds[i - 1]);
      if (file) deleteCount += 1;

      i--;
    }
  }

  if (folderIds) {
    let i = folderIds.length;
    while (i !== 0) {
      const folder = self.folders.find((x) => x.id === folderIds[i - 1]);
      if (folder) deleteCount += 1;

      i--;
    }
  }

  const newFilter = isRooms ? self.roomsFilter.clone() : self.filter.clone();
  newFilter.total -= deleteCount;

  if (destFolderId && destFolderId === self.selectedFolderStore.id) return;

  if (newFilter.total <= self.filesList.length) {
    const files = fileIds
      ? self.files.filter((x) => !fileIds.includes(x.id))
      : self.files;
    const folders = folderIds
      ? self.folders.filter((x) => !folderIds.includes(x.id))
      : self.folders;

    // when only folderIds are passed the old JS still
    // reads `fileIds.includes` lazily via the ternary branches — the
    // non-null assertion below keeps the same unchecked access.
    const hotkeysClipboard = fileIds
      ? self.hotkeysClipboard.filter(
          (f) => !fileIds.includes(f.id!) && !f.isFolder,
        )
      : self.hotkeysClipboard.filter(
          (f) => !folderIds!.includes(f.id!) && f.isFolder,
        );

    if (!self.isFiltered) {
      self.setIsEmptyPage(newFilter.total <= 0);
    }

    runInAction(() => {
      isRooms
        ? self.setRoomsFilter(newFilter as TRoomsFilter)
        : self.setFilter(newFilter as TFilesFilter);
      self.setFiles(files);
      self.setFolders(folders);
      self.setHotkeysClipboard(hotkeysClipboard);
      if (fileIds) self.setTempActionFilesIds(EMPTY_ARRAY);
      if (folderIds) self.setTempActionFoldersIds(EMPTY_ARRAY);
      self.clearActiveOperations(fileIds, folderIds);
    });

    showToast && showToast();

    return;
  }

  if (self.filesList.length - deleteCount >= self.filter.pageCount) {
    const files = fileIds
      ? self.files.filter((x) => !fileIds.includes(x.id))
      : self.files;

    const folders = folderIds
      ? self.folders.filter((x) => !folderIds.includes(x.id))
      : self.folders;

    runInAction(() => {
      isRooms
        ? self.setRoomsFilter(newFilter as TRoomsFilter)
        : self.setFilter(newFilter as TFilesFilter);
      self.setFiles(files);
      self.setFolders(folders);
      if (fileIds) self.setTempActionFilesIds(EMPTY_ARRAY);
      if (folderIds) self.setTempActionFoldersIds(EMPTY_ARRAY);
      self.clearActiveOperations(fileIds, folderIds);
    });

    showToast && showToast();

    return;
  }

  // RoomsFilter has no declared startIndex/folder members
  // but the old JS sets/reads them on either filter kind; the erased casts
  // keep that dynamic behavior.
  (newFilter as TFilesFilter).startIndex =
    (newFilter.page + 1) * newFilter.pageCount - deleteCount;
  newFilter.pageCount = deleteCount;
  if (isRooms) {
    const req = isAIAgentsFolder ? api.ai.getNewAiAgents : api.rooms.getRooms;
    return req(newFilter as TRoomsFilter)
      .then((res) => {
        const folders = folderIds
          ? self.folders.filter((x) => !folderIds.includes(x.id))
          : self.folders;

        const newFolders = [...folders, ...res.folders];

        const roomsFilter = self.roomsFilter.clone();
        roomsFilter.total = res.total;

        runInAction(() => {
          self.setRoomsFilter(roomsFilter);
          self.setFolders(newFolders);
          self.clearActiveOperations(fileIds, folderIds);
        });

        showToast && showToast();
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        if (fileIds) self.setTempActionFilesIds(EMPTY_ARRAY);
        if (folderIds) self.setTempActionFoldersIds(EMPTY_ARRAY);
      });
  }
  api.files
    .getFolder((newFilter as TFilesFilter).folder, newFilter as TFilesFilter)
    .then((res) => {
      const files = fileIds
        ? self.files.filter((x) => !fileIds.includes(x.id))
        : self.files;
      const folders = folderIds
        ? self.folders.filter((x) => !folderIds.includes(x.id))
        : self.folders;

      const newFiles = [...files, ...res.files];
      const newFolders = [...folders, ...res.folders];

      const filter = self.filter.clone();
      filter.total = res.total;

      runInAction(() => {
        self.setFilter(filter);
        self.setFiles(newFiles);
        self.setFolders(newFolders);
        self.clearActiveOperations(fileIds, folderIds);
      });

      showToast && showToast();
    })
    .catch((err) => {
      toastr.error(err);
    })
    .finally(() => {
      if (fileIds) self.setTempActionFilesIds(EMPTY_ARRAY);
      if (folderIds) self.setTempActionFoldersIds(EMPTY_ARRAY);
    });
}
