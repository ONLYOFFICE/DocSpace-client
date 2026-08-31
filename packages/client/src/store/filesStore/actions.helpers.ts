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

import api from "@docspace/shared/api";
import { isMobile, isSystemFolder } from "@docspace/shared/utils";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { thumbnailStatuses } from "@docspace/shared/constants";
import {
  frameCallEvent,
  updateTempContent,
} from "@docspace/shared/utils/common";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import config from "PACKAGE_FILE";

import type { Nullable } from "@docspace/shared/types";
import type { TFile } from "@docspace/shared/api/files/types";

import { THUMBNAILS_CACHE } from "./constants";

import type { default as FilesStore } from "../FilesStore";

// Misc side-effectful actions extracted from FilesStore (init, doc editor,
// thumbnails, favorites, scroll, trash check). Free functions over `self`.

export function initFilesImpl(self: FilesStore) {
  if (self.isInit) return;

  const { isAuthenticated } = self.authStore;
  const { getFilesSettings } = self.filesSettingsStore;

  const {
    getPortalCultures,
    getLegacyEncryptionKeys,
    // setModuleInfo,
    isDesktopClient,
    getInvitationSettings,
  } = self.settingsStore;

  // setModuleInfo(config.homepage, config.id);

  const requests = [];

  updateTempContent();
  if (!isAuthenticated) {
    return self.clientLoadingStore.setIsLoaded(true);
  }
  updateTempContent(isAuthenticated);

  const isNotPaidPeriod = self.currentTariffStatusStore?.isNotPaidPeriod;

  if (!self.isEditor) {
    requests.push(getPortalCultures());

    if (!isNotPaidPeriod) {
      requests.push(
        getInvitationSettings(),
        self.treeFoldersStore.fetchTreeFolders().then((treeFolders) => {
          if (!treeFolders || !treeFolders.length) return;

          const trashFolder = treeFolders.find(
            (f) => f.rootFolderType == FolderType.TRASH,
          );

          if (!trashFolder) return;

          const isEmpty = !trashFolder.foldersCount && !trashFolder.filesCount;

          self.setTrashIsEmpty(isEmpty);
        }),
      );

      if (isDesktopClient) {
        requests.push(getLegacyEncryptionKeys());
      }

      if (self.userStore?.getEncryptionKeys) {
        requests.push(self.userStore.getEncryptionKeys().catch(() => {}));
      }
    }
  }
  if (!isNotPaidPeriod) requests.push(getFilesSettings());

  return Promise.all(requests).then(() => {
    self.clientLoadingStore.setIsArticleLoading(false);
    self.clientLoadingStore.setFirstLoad(false);

    self.setIsInit(true);
  });
}

export function scrollToTopImpl(self: FilesStore) {
  if (self.selectedFolderStore.isIndexedFolder) return;

  const scrollElm = isMobile()
    ? document.querySelector("#customScrollBar > .scroll-wrapper > .scroller")
    : document.querySelector("#sectionScroll > .scroll-wrapper > .scroller");

  scrollElm && scrollElm.scrollTo(0, 0);
}

export async function fetchFavoritesFolderImpl(
  self: FilesStore,
  folderId: number | string,
) {
  // The live filter carries the section scope (folderType: Rooms/Forms/AI/
  // MyDocs) along with sort and paging. It must be passed on: calling
  // getFolder with the id alone skips the query string entirely, so the
  // refreshed listing comes back unscoped and shows favorites belonging to
  // every other section.
  const requestFilter = self.filter.clone();
  requestFilter.folder = folderId as string;

  const favoritesFolder = await api.files.getFolder(folderId, requestFilter);

  self.setFolders(favoritesFolder.folders);
  self.setFiles(favoritesFolder.files);

  const newFilter = self.filter.clone();
  newFilter.total = favoritesFolder.total;
  self.setFilter(newFilter);

  self.selectedFolderStore.setSelectedFolder({
    folders: favoritesFolder.folders,
    ...favoritesFolder.current,
    pathParts: favoritesFolder.pathParts,
  });
}

export function openDocEditorImpl(
  self: FilesStore,
  id: number | string,
  preview = false,
  shareKey: Nullable<string> = null,
  editForm = false,
  fillForm = false,
  targetWindow: Nullable<Window> = null,
) {
  const { openOnNewPage } = self.filesSettingsStore;

  const share = shareKey || self.publicRoomStore.publicRoomKey;

  const folderType = self.selectedFolderStore.type;

  const isFormRoom = self.selectedFolderStore.roomType === RoomsType.FormRoom;
  const isPublic = self.publicRoomStore.isPublicRoom;

  const { isFrame, frameConfig } = self.settingsStore;

  const canShare =
    share && (isPublic || !isFormRoom) && !isSystemFolder(folderType!);

  const searchParams = new URLSearchParams();

  // URLSearchParams.append is typed for strings while the
  // old JS passes numeric ids / nullable share keys; erased casts keep
  // the values (they are stringified by the browser API).
  searchParams.append("fileId", id as string);
  if (canShare) searchParams.append("share", share as string);
  if (preview) searchParams.append("action", "view");
  if (editForm) searchParams.append("action", "edit");
  if (fillForm) searchParams.append("action", "fill");

  const url = combineUrl(
    window.ClientConfig?.proxy?.url,
    config.homepage,
    `/doceditor?${searchParams.toString()}`,
  );

  if (isFrame && frameConfig?.events?.onEditorOpen) {
    const item = self.files.find((f) => f.id === id);

    frameCallEvent({
      event: "onEditorOpen",
      data: {
        ...item,
        share,
        action: preview ? "view" : fillForm ? "fill" : "edit",
      },
    });

    return;
  }

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
    return targetWindow;
  }

  return window.open(url, openOnNewPage ? "_blank" : "_self");
}

export async function createThumbnailsImpl(
  self: FilesStore,
  files: Nullable<TFile[]> = null,
) {
  if ((self.viewAs !== "tile" || !self.files) && !files) return;

  const currentFiles = files || self.files;

  const newFiles = currentFiles.filter((f) => {
    return (
      typeof f.id !== "string" &&
      f?.thumbnailStatus === thumbnailStatuses.WAITING &&
      !self.thumbnails.has(`${f.id}|${f.versionGroup}`)
    );
  });

  if (!newFiles.length) return;

  if (self.thumbnails.size > THUMBNAILS_CACHE) self.thumbnails.clear();

  newFiles.forEach((f) => self.thumbnails.add(`${f.id}|${f.versionGroup}`));

  console.log("thumbnails", self.thumbnails);

  const fileIds = newFiles.map((f) => f.id);

  const res = await api.files.createThumbnails(fileIds);

  return res;
}

export async function createThumbnailImpl(self: FilesStore, file?: TFile) {
  if (
    self.viewAs !== "tile" ||
    !file ||
    !file.id ||
    typeof file.id === "string" ||
    file.thumbnailStatus !== thumbnailStatuses.WAITING ||
    self.thumbnails.has(`${file.id}|${file.versionGroup}`)
  ) {
    return;
  }

  if (self.thumbnails.size > THUMBNAILS_CACHE) self.thumbnails.clear();

  self.thumbnails.add(`${file.id}|${file.versionGroup}`);

  console.log("thumbnails", self.thumbnails);

  const res = await api.files.createThumbnails([file.id]);

  return res;
}

export async function getIsEmptyTrashImpl(self: FilesStore) {
  const res = await api.files.getTrashFolderList();
  const items = [...res.files, ...res.folders];
  self.setTrashIsEmpty(items.length === 0);
}

