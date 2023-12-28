import { ShareAccessRights } from "@docspace/common/constants";
import { makeAutoObservable } from "mobx";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

class SelectedFolderStore {
  folders = null;
  parentId = null;
  filesCount = null;
  foldersCount = null;
  isShareable = null;
  new = null;
  id = null;
  title = null;
  access = null;
  shared = null;
  created = null;
  createdBy = null;
  updated = null;
  updatedBy = null;
  rootFolderType = null;
  pathParts = null;
  navigationPath = null;
  providerItem = null;
  providerKey = null;
  providerId = null;
  roomType = null;
  pinned = null;
  isRoom = null;
  isArchive = null;
  logo = null;
  tags = null;
  rootFolderId = null;
  settingsStore = null;
  security = null;
  type = null;
  inRoom = true;

  constructor(settingsStore) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
  }

  getSelectedFolder = () => {
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
    this.parentId = null;
    this.filesCount = null;
    this.foldersCount = null;
    this.isShareable = null;
    this.new = null;
    this.id = null;
    this.title = null;
    this.access = null;
    this.shared = null;
    this.created = null;
    this.createdBy = null;
    this.updated = null;
    this.updatedBy = null;
    this.rootFolderType = null;
    this.pathParts = null;
    this.navigationPath = null;
    this.providerItem = null;
    this.providerKey = null;
    this.providerId = null;
    this.roomType = null;
    this.pinned = null;
    this.isRoom = null;
    this.logo = null;
    this.tags = null;
    this.rootFolderId = null;
    this.security = null;
    this.type = null;
    this.inRoom = true;
  };

  setParentId = (parentId) => {
    this.parentId = parentId;
  };

  setRoomType = (roomType) => {
    this.roomType = roomType;
  };

  setCreatedBy = (createdBy) => {
    this.createdBy = createdBy;
  };

  setNavigationPath = (navigationPath) => {
    this.navigationPath = navigationPath;
  };

  setShared = (shared) => {
    this.shared = shared;
  };

  updateEditedSelectedRoom = (title = this.title, tags = this.tags) => {
    this.title = title;
    this.tags = tags;
  };

  addDefaultLogoPaths = () => {
    const cachebreaker = new Date().getTime();
    this.logo = {
      small: `/storage/room_logos/root/${this.id}_small.png?` + cachebreaker,
      medium: `/storage/room_logos/root/${this.id}_medium.png?` + cachebreaker,
      large: `/storage/room_logos/root/${this.id}_large.png?` + cachebreaker,
      original:
        `/storage/room_logos/root/${this.id}_original.png?` + cachebreaker,
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
    if (!this.logo.original) return;

    const cachebreaker = new Date().getTime();
    this.logo = {
      small: this.logo.small.split("?")[0] + "?" + cachebreaker,
      medium: this.logo.medium.split("?")[0] + "?" + cachebreaker,
      large: this.logo.large.split("?")[0] + "?" + cachebreaker,
      original: this.logo.original.split("?")[0] + "?" + cachebreaker,
    };
  };

  setSelectedFolder = (selectedFolder) => {
    const { socketHelper } = this.settingsStore;

    if (this.id !== null) {
      socketHelper.emit({
        command: "unsubscribe",
        data: { roomParts: `DIR-${this.id}`, individual: true },
      });
    }

    if (selectedFolder) {
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

      if (!selectedFolder.hasOwnProperty("type")) this.type = null;

      for (let key of selectedFolderItems) {
        if (key in this) {
          this[key] = selectedFolder[key];
        }
      }
    }
  };
}

export default SelectedFolderStore;
