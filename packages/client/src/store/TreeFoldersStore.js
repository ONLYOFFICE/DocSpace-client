// (c) Copyright Ascensio System SIA 2009-2025
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
import { getFoldersTree, getSubfolders } from "@docspace/shared/api/files";
import { FolderType } from "@docspace/shared/enums";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";

import i18n from "../i18n";

class TreeFoldersStore {
  selectedFolderStore;

  settingsStore;

  publicRoomStore;

  treeFolders = [];

  selectedTreeNode = [];

  expandedPanelKeys = null;

  rootFoldersTitles = {};

  isLoadingNodes = false;

  constructor(selectedFolderStore, settingsStore, publicRoomStore) {
    makeAutoObservable(this);

    this.selectedFolderStore = selectedFolderStore;
    this.settingsStore = settingsStore;
    this.publicRoomStore = publicRoomStore;
  }

  fetchTreeFolders = async () => {
    if (this.publicRoomStore.isPublicRoom) return;

    const treeFolders = await getFoldersTree();

    treeFolders.forEach((folder) => {
      switch (folder.rootFolderType) {
        case FolderType.USER:
          folder.title = i18n.t("Common:MyDocuments");
          break;
        case FolderType.SHARE:
          folder.title = i18n.t("Common:SharedWithMe");
          break;
        case FolderType.Rooms:
          folder.title = i18n.t("Common:Rooms");
          break;
        case FolderType.Archive:
          folder.title = i18n.t("Common:Archive");
          break;
        case FolderType.TRASH:
          folder.title = i18n.t("Common:TrashSection");
          break;
        case FolderType.Favorites:
          folder.title = i18n.t("Common:Favorites");
          break;
        case FolderType.Recent:
          folder.title = i18n.t("Common:Recent");
          break;
        default:
          break;
      }
    });

    treeFolders.unshift({
      id: "aiAgents",
      title: i18n.t("Common:AIAgents"),
      rootFolderType: FolderType.AIAgents,
      folderClassName: "ai-agents",
      security: {
        Create: false,
      },
    });

    this.setRootFoldersTitles(treeFolders);
    this.setTreeFolders(treeFolders);
    this.listenTreeFolders(treeFolders);
    return treeFolders;
  };

  listenTreeFolders = (treeFolders) => {
    const roomParts = treeFolders
      .filter((f) => {
        return f.rootFolderType !== FolderType.Recent;
      })
      .map((f) => `DIR-${f.id}`)
      .filter((f) => !SocketHelper?.socketSubscribers.has(f));

    if (roomParts.length > 0) {
      // SocketHelper?.emit(SocketCommands.Unsubscribe, {
      //   roomParts: treeFolders.map((f) => `DIR-${f.id}`),
      //   individual: true,
      // });

      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts,
        individual: true,
      });
    }
  };

  updateTreeFoldersItem = (opt) => {
    if (opt?.data && opt?.cmd === "create") {
      const data = JSON.parse(opt.data);

      const parentId = opt?.type === "file" ? data.folderId : data.parentId;

      const idx = this.treeFolders.findIndex((f) => f.id === parentId);

      if (idx >= 0) {
        if (opt.type === "file") {
          this.treeFolders[idx].filesCount++;
          if (this.treeFolders[idx].files) {
            this.treeFolders[idx].files.push(data);
          } else {
            this.treeFolders[idx].files = [data];
          }
        } else {
          this.treeFolders[idx].foldersCount++;
          if (this.treeFolders[idx].folders) {
            this.treeFolders[idx].folders.push(data);
          } else {
            this.treeFolders[idx].folders = [data];
          }
        }
      }
    }
  };

  resetTreeItemCount = () => {
    this.treeFolders.map((item) => {
      return (item.newItems = 0);
    });
  };

  setRootFoldersTitles = (treeFolders) => {
    treeFolders.forEach((elem) => {
      this.rootFoldersTitles[elem.rootFolderType] = {
        ...elem,
      };
    });
  };

  getFoldersTree = () => {
    if (this.publicRoomStore.isPublicRoom) return;

    getFoldersTree();
  };

  setTreeFolders = (treeFolders) => {
    this.treeFolders = treeFolders;
  };

  setIsLoadingNodes = (isLoadingNodes) => {
    this.isLoadingNodes = isLoadingNodes;
  };

  setSelectedNode = (node) => {
    if (node[0]) {
      this.selectedTreeNode = node;
    }
  };

  setExpandedPanelKeys = (expandedPanelKeys) => {
    this.expandedPanelKeys = expandedPanelKeys;
  };

  // updateRootBadge = (id, count) => {
  //   const index = this.treeFolders.findIndex((x) => x.id === id);
  //   if (index < 0) return;

  //   this.treeFolders = this.treeFolders.map((f, i) => {
  //     if (i !== index) return f;
  //     f.newItems -= count;
  //     return f;
  //   });
  // };

  isMy = (myType) => myType === FolderType.USER;

  isCommon = (commonType) => commonType === FolderType.COMMON;

  isShare = (shareType) => shareType === FolderType.SHARE;

  isRoomRoot = (type) => type === FolderType.Rooms;

  getRootFolder = (rootFolderType) => {
    return this.treeFolders.find((x) => x.rootFolderType === rootFolderType);
  };

  getSubfolders = (folderId) => getSubfolders(folderId);

  get myRoomsId() {
    return this.rootFoldersTitles[FolderType.Rooms]?.id;
  }

  get archiveRoomsId() {
    return this.rootFoldersTitles[FolderType.Archive]?.id;
  }

  get trashFolderInfo() {
    return this.rootFoldersTitles[FolderType.TRASH];
  }

  get personalFolderId() {
    return this.rootFoldersTitles[FolderType.USER]?.id;
  }

  get isPersonalReadOnly() {
    return (
      this.isPersonalRoom &&
      this.rootFoldersTitles[FolderType.USER]?.security?.Read &&
      !this.rootFoldersTitles[FolderType.USER]?.security?.Create
    );
  }

  /**
   * @type {import("@docspace/shared/api/files/types").TFolder=}
   */
  get myFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.USER);
  }

  get sharedWithMeFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.SHARE);
  }

  get favoritesFolder() {
    return this.treeFolders.find(
      (x) => x.rootFolderType === FolderType.Favorites,
    );
  }

  get recentFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.Recent);
  }

  /**
   * @type {import("@docspace/shared/api/rooms/types").TRoom=}
   */
  get roomsFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.Rooms);
  }

  get archiveFolder() {
    return this.treeFolders.find(
      (x) => x.rootFolderType === FolderType.Archive,
    );
  }

  get templatesFolder() {
    return this.treeFolders.find(
      (x) => x.rootFolderType === FolderType.Templates,
    );
  }

  get privacyFolder() {
    return this.treeFolders.find(
      (x) => x.rootFolderType === FolderType.Privacy,
    );
  }

  get commonFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.COMMON);
  }

  get recycleBinFolder() {
    return this.treeFolders.find((x) => x.rootFolderType === FolderType.TRASH);
  }

  get myFolderId() {
    return this.myFolder ? this.myFolder.id : null;
  }

  get commonFolderId() {
    return this.commonFolder ? this.commonFolder.id : null;
  }

  get roomsFolderId() {
    return this.roomsFolder ? this.roomsFolder.id : null;
  }

  get archiveFolderId() {
    return this.archiveFolder ? this.archiveFolder.id : null;
  }

  get recycleBinFolderId() {
    return this.recycleBinFolder ? this.recycleBinFolder.id : null;
  }

  get favoritesFolderId() {
    return this.favoritesFolder ? this.favoritesFolder.id : null;
  }

  get recentFolderId() {
    return this.recentFolder ? this.recentFolder.id : null;
  }

  get sharedWithMeFolderId() {
    return this.sharedWithMeFolder ? this.sharedWithMeFolder.id : null;
  }

  get isPersonalRoom() {
    return (
      this.myFolder &&
      this.myFolder.rootFolderType === this.selectedFolderStore.rootFolderType
    );
  }

  get isSharedWithMeFolder() {
    return (
      this.sharedWithMeFolder &&
      this.sharedWithMeFolder.id === this.selectedFolderStore.id
    );
  }

  get isSharedWithMeFolderRoot() {
    return this.selectedFolderStore.rootFolderType === FolderType.SHARE;
  }

  get isFavoritesFolder() {
    return (
      this.favoritesFolder &&
      this.selectedFolderStore.id === this.favoritesFolder.id
    );
  }

  get isTrashFolder() {
    return (
      this.recycleBinFolder &&
      this.selectedFolderStore.id === this.recycleBinFolder.id
    );
  }

  get isRecentFolder() {
    return (
      this.recentFolder && this.selectedFolderStore.id === this.recentFolder.id
    );
  }

  get isPrivacyFolder() {
    return (
      this.privacyFolder &&
      this.privacyFolder.rootFolderType ===
        this.selectedFolderStore.rootFolderType
    );
  }

  get isCommonFolder() {
    return (
      this.commonFolder && this.commonFolder.id === this.selectedFolderStore.id
    );
  }

  get isRecycleBinFolder() {
    return (
      this.recycleBinFolder &&
      this.selectedFolderStore.id === this.recycleBinFolder.id
    );
  }

  get isRoomsFolder() {
    return (
      this.roomsFolder && this.selectedFolderStore.id === this.roomsFolder.id
    );
  }

  get isRoom() {
    return (
      this.roomsFolder &&
      this.roomsFolder.rootFolderType ===
        this.selectedFolderStore.rootFolderType
    );
  }

  get isArchiveFolder() {
    return (
      this.archiveFolder &&
      this.selectedFolderStore.id === this.archiveFolder.id
    );
  }

  get isTemplatesFolderRoot() {
    return FolderType.RoomTemplates === this.selectedFolderStore.rootFolderType;
  }

  get isTemplatesFolder() {
    return (
      FolderType.RoomTemplates === this.selectedFolderStore.rootFolderType &&
      this.selectedFolderStore.isRootFolder
    );
  }

  get isRoomsFolderRoot() {
    return FolderType.Rooms === this.selectedFolderStore.rootFolderType;
  }

  get isArchiveFolderRoot() {
    return FolderType.Archive === this.selectedFolderStore.rootFolderType;
  }

  get isVDRRoomRoot() {
    return (
      FolderType.VirtualDataRoom === this.selectedFolderStore.parentRoomType
    );
  }

  get isDocumentsFolder() {
    return FolderType.USER === this.selectedFolderStore.rootFolderType;
  }

  get isRoot() {
    return this.selectedFolderStore?.pathParts?.length === 1;
  }

  get selectedKeys() {
    const selectedKeys =
      this.selectedTreeNode.length > 0 &&
      this.selectedTreeNode[0] !== "@my" &&
      this.selectedTreeNode[0] !== "@common"
        ? this.selectedTreeNode
        : [`${this.selectedFolderStore.id}`];
    return selectedKeys;
  }
}

export default TreeFoldersStore;
