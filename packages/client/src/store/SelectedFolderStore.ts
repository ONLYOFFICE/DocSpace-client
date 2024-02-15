import { makeAutoObservable } from "mobx";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import {
  NonFunctionProperties,
  NonFunctionPropertyNames,
  TCreatedBy,
  TPathParts,
} from "@docspace/shared/types";
import { TFolder, TFolderSecurity } from "@docspace/shared/api/files/types";
import { TLogo, TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { setDocumentTitle } from "../helpers/utils";

export type TNavigationPath = {
  id: number;
  title: string;
  isRoom: boolean;
  roomType: RoomsType;
  isRootRoom: boolean;
  shared: boolean;
  canCopyPublicLink: boolean;
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
      canCopyPublicLink: this.canCopyPublicLink,
      type: this.type,
      isRootFolder: this.isRootFolder,
    };
  };

  get isRootFolder() {
    return this.pathParts && this.pathParts.length <= 1;
  }

  get canCopyPublicLink() {
    return (
      this.access === ShareAccessRights.RoomManager ||
      this.access === ShareAccessRights.None
    );
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

  updateEditedSelectedRoom = (title = this.title, tags = this.tags) => {
    this.title = title;
    this.tags = tags;
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

  setSelectedFolder: (selectedFolder: TSetSelectedFolder | null) => void = (
    selectedFolder,
  ) => {
    const socketHelper = this.settingsStore?.socketHelper;

    if (this.id !== null && socketHelper) {
      socketHelper.emit({
        command: "unsubscribe",
        data: { roomParts: `DIR-${this.id}`, individual: true },
      });
    }

    if (selectedFolder && socketHelper) {
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

      if (!("type" in selectedFolder)) this.type = null;

      Object.entries(selectedFolder).forEach(([key, item]) => {
        if (key in this) {
          // @ts-expect-error its always be good
          this[key] = item;
        }
      });
    }
  };
}

export default SelectedFolderStore;
