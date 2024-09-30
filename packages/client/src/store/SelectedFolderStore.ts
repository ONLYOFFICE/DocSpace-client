// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { makeAutoObservable } from "mobx";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type {
  NonFunctionProperties,
  NonFunctionPropertyNames,
  Nullable,
  TCreatedBy,
  TPathParts,
  // TTranslation,
} from "@docspace/shared/types";
import { TFolder, TFolderSecurity } from "@docspace/shared/api/files/types";
import {
  TLogo,
  TRoomLifetime,
  TRoomSecurity,
} from "@docspace/shared/api/rooms/types";

import { setDocumentTitle } from "../helpers/utils";

export type TNavigationPath = {
  id: number;
  title: string;
  isRoom: boolean;
  roomType: RoomsType;
  isRootRoom: boolean;
  shared: boolean;
};

type ExcludeTypes = SettingsStore | Function;

export type TSelectedFolder = NonFunctionProperties<
  SelectedFolderStore,
  ExcludeTypes
>;

export type TSetSelectedFolder = {
  [key in NonFunctionPropertyNames<
    SelectedFolderStore,
    ExcludeTypes
  >]?: TSelectedFolder[key];
};

class SelectedFolderStore {
  folders: TFolder[] | null = null;

  parentId = 0;

  filesCount = 0;

  foldersCount = 0;

  isShareable = false;

  new = 0;

  id: number | string | null = null;

  title: string = "";

  access: ShareAccessRights | null = null;

  shared = false;

  created: Date | null = null;

  createdBy: TCreatedBy | null = null;

  updated: Date | null = null;

  updatedBy: TCreatedBy | null = null;

  rootFolderType: FolderType | null = null;

  pathParts: TPathParts[] = [];

  navigationPath: TNavigationPath[] = [];

  providerItem = null;

  providerKey = null;

  providerId = null;

  roomType: RoomsType | null = null;

  pinned = false;

  isRoom = false;

  isArchive = false;

  logo: TLogo | null = null;

  tags: string[] = [];

  rootFolderId: number = 0;

  private settingsStore: SettingsStore = {} as SettingsStore;

  security: TFolderSecurity | TRoomSecurity | null = null;

  type = null;

  inRoom = false;

  isFolder = true;

  mute = false;

  private = false;

  canShare = false;

  indexing = false;

  parentRoomType: Nullable<FolderType> = null;

  lifetime: TRoomLifetime | null = null;

  denyDownload: boolean | undefined;

  usedSpace: number | undefined;

  quotaLimit: number | undefined;

  isCustomQuota: boolean | undefined;

  changeDocumentsTabs = false;

  order: Nullable<string> = null;

  constructor(settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
  }

  getSelectedFolder: () => TSelectedFolder = () => {
    return {
      folders: this.folders,
      parentId: this.parentId,
      filesCount: this.filesCount,
      foldersCount: this.foldersCount,
      isShareable: this.isShareable,
      new: this.new,
      id: this.id,
      title: this.title,
      access: this.access,
      shared: this.shared,
      created: this.created,
      createdBy: this.createdBy,
      updated: this.updated,
      updatedBy: this.updatedBy,
      rootFolderType: this.rootFolderType,
      pathParts: this.pathParts,
      navigationPath: this.navigationPath,
      providerItem: this.providerItem,
      providerKey: this.providerKey,
      providerId: this.providerId,
      roomType: this.roomType,
      pinned: this.pinned,
      isRoom: this.isRoom,
      logo: this.logo,
      tags: this.tags,
      rootFolderId: this.rootFolderId,
      security: this.security,
      inRoom: this.inRoom,
      isFolder: this.isFolder,
      mute: this.mute,
      private: this.private,
      canShare: this.canShare,
      isArchive: this.isArchive,
      type: this.type,
      isRootFolder: this.isRootFolder,
      parentRoomType: this.parentRoomType,
      lifetime: this.lifetime,
      indexing: this.indexing,
      denyDownload: this.denyDownload,
      usedSpace: this.usedSpace,
      quotaLimit: this.quotaLimit,
      isCustomQuota: this.isCustomQuota,
      order: this.order,
    };
  };

  get isIndexedFolder() {
    return !!(this.indexing || this.order);
  }

  get isRootFolder() {
    return this.pathParts && this.pathParts.length <= 1;
  }

  toDefault = () => {
    this.folders = null;
    this.parentId = 0;
    this.filesCount = 0;
    this.foldersCount = 0;
    this.isShareable = false;
    this.new = 0;
    this.id = 0;
    this.title = "";
    this.access = null;
    this.shared = false;
    this.created = null;
    this.createdBy = null;
    this.updated = null;
    this.updatedBy = null;
    this.rootFolderType = null;
    this.pathParts = [];
    this.navigationPath = [];
    this.providerItem = null;
    this.providerKey = null;
    this.providerId = null;
    this.roomType = null;
    this.pinned = false;
    this.isRoom = false;
    this.logo = null;
    this.tags = [];
    this.rootFolderId = 0;
    this.security = null;
    this.type = null;
    this.inRoom = false;
    this.parentRoomType = null;
    this.lifetime = null;
    this.indexing = false;
    this.denyDownload = false;
    this.usedSpace = undefined;
    this.quotaLimit = undefined;
    this.isCustomQuota = undefined;
    this.order = null;
  };

  setParentId = (parentId: number) => {
    this.parentId = parentId;
  };

  setRoomType = (roomType: RoomsType) => {
    this.roomType = roomType;
  };

  setCreatedBy = (createdBy: TCreatedBy) => {
    this.createdBy = createdBy;
  };

  setNavigationPath = (navigationPath: TNavigationPath[]) => {
    this.navigationPath = navigationPath;
  };

  setShared = (shared: boolean) => {
    this.shared = shared;
  };

  setChangeDocumentsTabs = (changeDocumentsTabs: boolean) => {
    this.changeDocumentsTabs = changeDocumentsTabs;
  };

  updateEditedSelectedRoom: (selectedFolder: TSetSelectedFolder) => void = (
    selectedFolder,
  ) => {
    Object.entries(selectedFolder).forEach(([key, item]) => {
      if (key in this) {
        // @ts-expect-error its always be good
        this[key] = item;
      }
    });
  };

  setInRoom = (inRoom: boolean) => {
    this.inRoom = inRoom;
  };

  addDefaultLogoPaths = () => {
    const cachebreaker = new Date().getTime();
    this.logo = {
      small: `/storage/room_logos/root/${this.id}_small.png?${cachebreaker}`,
      medium: `/storage/room_logos/root/${this.id}_medium.png?${cachebreaker}`,
      large: `/storage/room_logos/root/${this.id}_large.png?${cachebreaker}`,
      original: `/storage/room_logos/root/${this.id}_original.png?${cachebreaker}`,
    };
  };

  removeLogoPaths = () => {
    this.logo = {
      small: "",
      medium: "",
      large: "",
      original: "",
    };
  };

  updateLogoPathsCacheBreaker = () => {
    if (!this.logo?.original) return;

    const cachebreaker = new Date().getTime();
    this.logo = {
      small: `${this.logo.small.split("?")[0]}?${cachebreaker}`,
      medium: `${this.logo.medium.split("?")[0]}?${cachebreaker}`,
      large: `${this.logo.large.split("?")[0]}?${cachebreaker}`,
      original: `${this.logo.original.split("?")[0]}?${cachebreaker}`,
    };
  };

  setDefaultValuesIfUndefined: (selectedFolder: TSetSelectedFolder) => void = (
    selectedFolder,
  ) => {
    if (!("type" in selectedFolder)) this.type = null;
    if (!("providerId" in selectedFolder)) this.providerId = null;
    if (!("providerItem" in selectedFolder)) this.providerItem = null;
    if (!("providerKey" in selectedFolder)) this.providerKey = null;
    if (!("order" in selectedFolder)) this.order = null;
  };

  setSelectedFolder: (
    // t: TTranslation,
    selectedFolder: TSetSelectedFolder | null,
  ) => void = (selectedFolder) => {
    const socketHelper = this.settingsStore?.socketHelper;

    this.toDefault();

    if (
      this.id !== null &&
      socketHelper &&
      socketHelper.socketSubscribers.has(`DIR-${this.id}`)
    ) {
      socketHelper.emit({
        command: "unsubscribe",
        data: { roomParts: `DIR-${this.id}`, individual: true },
      });
    }

    if (
      selectedFolder &&
      socketHelper &&
      !socketHelper.socketSubscribers.has(`DIR-${selectedFolder.id}`)
    ) {
      socketHelper.emit({
        command: "subscribe",
        data: { roomParts: `DIR-${selectedFolder.id}`, individual: true },
      });
    }

    if (!selectedFolder) {
      this.toDefault();
    } else {
      const selectedFolderItems = Object.keys(selectedFolder);

      if (!selectedFolderItems.includes("roomType")) this.roomType = null;

      setDocumentTitle(selectedFolder.title);

      this.setDefaultValuesIfUndefined(selectedFolder);

      Object.entries(selectedFolder).forEach(([key, item]) => {
        if (key in this) {
          // @ts-expect-error its always be good
          this[key] = item;
        }
      });

      this.setChangeDocumentsTabs(false);
    }

    selectedFolder?.pathParts?.forEach((value) => {
      if (value.roomType) this.setInRoom(true);
    });
  };
}

export default SelectedFolderStore;
