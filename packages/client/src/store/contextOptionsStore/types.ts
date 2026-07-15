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

import type { TFileLink } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

import type UploadDataStore from "../UploadDataStore";
import type { TContextItem, TContextItemSecurity } from "./helpers";

// multi-select items always carry contextOptions/security in
// the .js FilesStore filesList view-model.
export type TSelectionItem = TContextItem & {
  contextOptions: string[];
  security: TContextItemSecurity;
};

export type TFilesStore = {
  activeFiles: unknown[];
  activeFolders: unknown[];
  selection: TSelectionItem[];
  roomsForDelete: unknown[];
  roomsForRestore: unknown[];
  isThirdPartySelection: boolean;
  isFiltered: boolean;
  allFilesIsEditing: boolean;
  canConvertSelected: boolean;
  roomsFilter: { groupId?: string | null } | null;
  addActiveItems: (
    files?: (number | string)[] | null,
    folders?: (number | string)[] | null,
    destFolderId?: number | string,
  ) => void;
  setActiveFiles: (
    activeFiles: (number | string)[],
    destFolderId?: number | string,
  ) => void;
  setSelection: (selection: TSelectionItem[]) => void;
  setBufferSelection: (bufferSelection: unknown) => void;
  getItemUrl: (
    id: number | string,
    isFolder?: boolean,
    needConvert?: boolean,
    canOpenPlayer?: boolean,
    shareKey?: string,
    isAiRoom?: boolean,
  ) => string;
  openDocEditor: (
    id: number | string,
    preview?: boolean,
    shareKey?: string | null,
    editForm?: boolean,
    fillForm?: boolean,
  ) => Window | null | undefined;
  getPrimaryLink: (roomId: number | string) => Promise<TFileLink | undefined>;
  getFilesListItems: (items: unknown[]) => TContextItem[];
  removeFiles: (
    fileIds?: unknown[] | null,
    folderIds?: unknown[] | null,
  ) => void;
  getFilesContextOptions: (
    item: TContextItem,
    optionsToRemove?: string[],
  ) => string[];
};

export type TFilesActionsStore = {
  uploadDataStore: UploadDataStore;
  isGroupMenuBlocked: boolean;
  emptyTrashInProgress: boolean;
  emptyPersonalRoomInProgress: boolean;
  isExpiredLinkAsync: (
    item: TContextItem,
    withLoader?: boolean,
  ) => Promise<boolean>;
  openLocationAction: (item: TContextItem) => Promise<unknown>;
  checkAndOpenLocationAction: (item: TContextItem) => Promise<unknown>;
  finalizeVersionAction: (id: number | string) => Promise<unknown>;
  setFavoriteAction: (
    action: "mark" | "remove",
    items: TContextItem[],
  ) => Promise<unknown>;
  lockFileAction: (id: number | string, locked: boolean) => Promise<unknown>;
  setGroupMenuBlocked: (blocked: boolean) => void;
  downloadAction: (label: string, item?: unknown) => Promise<unknown>;
  downloadFiles: (
    fileConvertIds: unknown[],
    folderIds: (number | string)[],
    translations: { label: string },
  ) => Promise<unknown>;
  changeCustomFilter: (item: TContextItem, t: TTranslation) => Promise<unknown>;
  duplicateAction: (item: TContextItem) => Promise<unknown>;
  setThirdpartyInfo: (providerKey?: string) => void;
  askAIAction: (item: TContextItem) => void;
  retryVectorization: (files: TContextItem[]) => Promise<unknown>;
  setPinAction: (
    action: "pin" | "unpin",
    id: number,
    t: TTranslation,
    isAIAgent?: boolean,
  ) => Promise<unknown>;
  setMuteAction: (
    action: "mute" | "unmute",
    item: TContextItem,
    t: TTranslation,
  ) => void;
  exportRoomIndex: (t: TTranslation, roomId: number) => Promise<unknown>;
  removeFilesFromRecent: (
    fileIds: number[],
    t: TTranslation,
  ) => Promise<unknown>;
  onClickRemoveFromRecent: (
    selection: TSelectionItem[],
    t: TTranslation,
  ) => void;
  onCreateRoomFromTemplate: (
    item: TContextItem,
    addSelection?: boolean,
  ) => void;
  setProcessCreatingRoomFromData: (value: boolean) => void;
  deleteAction: (
    translations: Record<string, string>,
    newSelection?: unknown,
    withoutDialog?: boolean,
  ) => Promise<unknown>;
  deleteRoomsAction: (
    itemIds: unknown[],
    translations: Record<string, string>,
  ) => Promise<unknown>;
  deleteItemAction: (
    id: number | string,
    title: string,
    translations: Record<string, unknown>,
    isFile: boolean,
    providerKey?: string,
    isRoom?: boolean,
  ) => Promise<unknown>;
  markAsRead: (
    folderIds: (number | string)[],
    fileIds: (number | string)[],
    item: TContextItem,
  ) => Promise<unknown>;
  onSelectItem: (
    item: { id: number; isFolder?: boolean },
    needSelect?: boolean,
    needClear?: boolean,
  ) => void;
  pinRooms: (t: TTranslation) => void;
  unpinRooms: (t: TTranslation) => void;
  deleteRooms: (t: TTranslation) => void;
};

