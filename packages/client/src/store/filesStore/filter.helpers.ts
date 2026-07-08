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
import { match } from "ts-pattern";
import {
  getUserFilter,
  setUserFilter,
} from "@docspace/shared/utils/userFilterUtils";
import { CategoryType } from "@docspace/shared/constants";
import { RoomSearchArea } from "@docspace/shared/enums";
import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ARCHIVE_ROOM,
  FILTER_DOCUMENTS,
  FILTER_RECENT,
  FILTER_FAVORITES,
  FILTER_ROOM_DOCUMENTS,
  FILTER_SHARE,
  FILTER_SHARED_ROOM,
  FILTER_TEMPLATES_ROOM,
  FILTER_TRASH,
} from "@docspace/shared/utils/filterConstants";


import type { Nullable } from "@docspace/shared/types";
import type { default as TFilesFilter } from "@docspace/shared/api/files/filter";
import type { default as TRoomsFilter } from "@docspace/shared/api/rooms/filter";

import type { default as FilesStore } from "../FilesStore";

// Filter build/persist actions extracted from FilesStore. Side-effectful
// (URL persistence, navigation); free functions over `self: FilesStore`.

export function setFilesFilterImpl(
  self: FilesStore,
  filter: TFilesFilter,
  folderId: Nullable<number | string> = null,
) {
  const key = match(self.categoryType)
    .with(
      CategoryType.Archive,
      () => `${FILTER_ARCHIVE_DOCUMENTS}=${self.userStore.user?.id}`,
    )
    .with(
      CategoryType.SharedRoom,
      CategoryType.Form,
      () => `${FILTER_ROOM_DOCUMENTS}=${self.userStore.user?.id}`,
    )
    .with(
      CategoryType.Recent,
      () => `${FILTER_RECENT}=${self.userStore.user?.id}`,
    )
    .with(
      CategoryType.SharedWithMe,
      () => `${FILTER_SHARE}=${self.userStore.user?.id}`,
    )
    .with(
      CategoryType.Favorite,
      () => `${FILTER_FAVORITES}=${self.userStore.user?.id}`,
    )
    .when(
      () =>
        +(folderId as string) === self.treeFoldersStore.recycleBinFolderId,
      () => `${FILTER_TRASH}=${self.userStore.user?.id}`,
    )
    .when(
      () => !self.publicRoomStore.isPublicRoom,
      () => `${FILTER_DOCUMENTS}=${self.userStore.user?.id}`,
    )
    .otherwise(() => null);

  if (key) {
    setUserFilter(key, {
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
    });
  }

  self.filter = filter;

  runInAction(() => {
    if (filter && self.isHidePagination) {
      self.isHidePagination = false;
    }
  });

  runInAction(() => {
    if (filter && self.isLoadingFilesFind) {
      self.isLoadingFilesFind = false;
    }
  });
}

export function setRoomsFilterImpl(self: FilesStore, filter: TRoomsFilter) {
  filter.pageCount = 100;

  const isArchive = self.categoryType === CategoryType.Archive;
  const isTemplate = filter.searchArea === RoomSearchArea.Templates;

  const key = isArchive
    ? `${FILTER_ARCHIVE_ROOM}=${self.userStore.user?.id}`
    : isTemplate
      ? `${FILTER_TEMPLATES_ROOM}=${self.userStore.user?.id}`
      : `${FILTER_SHARED_ROOM}=${self.userStore.user?.id}`;

  const sharedStorageFilter = getUserFilter(key);

  sharedStorageFilter.sortBy = filter.sortBy;
  sharedStorageFilter.sortOrder = filter.sortOrder;

  setUserFilter(key, sharedStorageFilter);

  self.roomsFilter = filter;

  runInAction(() => {
    if (filter && self.isHidePagination) {
      self.isHidePagination = false;
    }
  });

  runInAction(() => {
    if (filter && self.isLoadingFilesFind) {
      self.isLoadingFilesFind = false;
    }
  });
}
