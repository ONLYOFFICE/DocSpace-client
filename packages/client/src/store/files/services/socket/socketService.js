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

import { makeAutoObservable, runInAction } from "mobx";
import SocketHelper, {
  // SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";
import { FileStatus } from "@docspace/shared/enums";

export class SocketService {
  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, {
      rootStore: false,
    });

    this.initSocketEvents();
  }

  initSocketEvents = () => {
    SocketHelper.on(SocketEvents.ModifyFolder, this.handleModifyFolder);
    SocketHelper.on(SocketEvents.UpdateHistory, this.handleUpdateHistory);
    SocketHelper.on(SocketEvents.RefreshFolder, this.handleRefreshFolder);
    SocketHelper.on(SocketEvents.MarkAsNewFolder, this.handleMarkAsNewFolder);
    SocketHelper.on(SocketEvents.MarkAsNewFile, this.handleMarkAsNewFile);
    SocketHelper.on(SocketEvents.StartEditFile, this.handleStartEditFile);
    SocketHelper.on(SocketEvents.StopEditFile, this.handleStopEditFile);
  };

  handleModifyFolder = async (opt) => {
    const { socketSubscribers } = SocketHelper;

    if (opt && opt.data) {
      const data = JSON.parse(opt.data);

      const pathParts = data.folderId
        ? `DIR-${data.folderId}`
        : `DIR-${data.parentId}`;

      if (
        !socketSubscribers.has(pathParts) &&
        !socketSubscribers.has(`DIR-${data.id}`)
      ) {
        console.log("[WS] s:modify-folder: SKIP UNSUBSCRIBED", { data });
        return;
      }
    }

    console.log("[WS] s:modify-folder", opt);

    if (opt?.cmd === "create" && !this.rootStore.showNewFilesInList) {
      const newFilter = this.rootStore.filter;
      newFilter.total += 1;
      this.rootStore.setFilter(newFilter);
      return;
    }

    if (!this.rootStore.clientLoadingStore.isLoading)
      switch (opt?.cmd) {
        case "create":
          this.wsModifyFolderCreate(opt);
          break;
        case "update":
          this.wsModifyFolderUpdate(opt);
          break;
        case "delete":
          this.wsModifyFolderDelete(opt);
          break;
      }

    this.rootStore.treeFoldersStore.updateTreeFoldersItem(opt);
  };

  handleUpdateHistory = ({ id, type }) => {
    const { infoPanelSelection, fetchHistory, isVisible } =
      this.rootStore.infoPanelStore;

    if (!isVisible) return;
    let infoPanelSelectionType = "file";
    if (infoPanelSelection?.isRoom || infoPanelSelection?.isFolder)
      infoPanelSelectionType = "folder";

    if (id === infoPanelSelection?.id && type === infoPanelSelectionType) {
      console.log("[WS] s:update-history", id);
      this.rootStore.fetchHistory();
    }
  };

  handleRefreshFolder = (id) => {
    const { socketSubscribers } = SocketHelper;
    const pathParts = `DIR-${id}`;

    if (!socketSubscribers.has(pathParts)) return;

    if (!id || this.rootStore.clientLoadingStore.isLoading) return;

    //console.log(
    //  `selected folder id ${this.selectedFolderStore.id} an changed folder id ${id}`
    //);
  };

  handleMarkAsNewFolder = ({ folderId, count }) => {
    const { socketSubscribers } = SocketHelper;
    const pathParts = `DIR-${folderId}`;

    if (!socketSubscribers.has(pathParts)) return;

    console.log(`[WS] markasnew-folder ${folderId}:${count}`);

    const foundIndex =
      folderId && this.rootStore.folders.findIndex((x) => x.id === folderId);

    const treeFoundIndex =
      folderId &&
      this.rootStore.treeFoldersStore.treeFolders.findIndex(
        (x) => x.id === folderId,
      );
    if (foundIndex === -1 && treeFoundIndex === -1) return;

    runInAction(() => {
      if (foundIndex > -1)
        this.rootStore.folders[foundIndex].new = count >= 0 ? count : 0;
      if (treeFoundIndex > -1)
        this.rootStore.treeFoldersStore.fetchTreeFolders();
    });
  };

  handleMarkAsNewFile = ({ fileId, count }) => {
    const { socketSubscribers } = SocketHelper;
    const pathParts = `FILE-${fileId}`;

    if (!socketSubscribers.has(pathParts)) return;

    console.log(`[WS] markasnew-file ${fileId}:${count}`);

    const foundIndex =
      fileId && this.rootStore.files.findIndex((x) => x.id === fileId);

    this.rootStore.treeFoldersStore.fetchTreeFolders();

    if (foundIndex == -1) return;

    this.rootStore.updateFileStatus(
      foundIndex,
      count > 0
        ? this.rootStore.files[foundIndex].fileStatus | FileStatus.IsNew
        : this.rootStore.files[foundIndex].fileStatus & ~FileStatus.IsNew,
    );
  };

  handleStartEditFile = (id) => {
    const { socketSubscribers } = SocketHelper;
    const pathParts = `FILE-${id}`;

    if (!socketSubscribers.has(pathParts)) return;

    const foundIndex = this.rootStore.files.findIndex((x) => x.id === id);
    if (foundIndex == -1) return;

    console.log(
      `[WS] s:start-edit-file`,
      id,
      this.rootStore.files[foundIndex].title,
    );

    this.updateSelectionStatus(
      id,
      this.rootStore.files[foundIndex].fileStatus | FileStatus.IsEditing,
      true,
    );

    this.rootStore.updateFileStatus(
      foundIndex,
      this.rootStore.files[foundIndex].fileStatus | FileStatus.IsEditing,
    );
  };

  handleStopEditFile = (id) => {
    const { socketSubscribers } = SocketHelper;
    const pathParts = `FILE-${id}`;

    const { isVisible, infoPanelSelection, setInfoPanelSelection } =
      this.rootStore.infoPanelStore;

    if (!socketSubscribers.has(pathParts)) return;

    const foundIndex = this.rootStore.files.findIndex((x) => x.id === id);
    if (foundIndex == -1) return;

    console.log(
      `[WS] s:stop-edit-file`,
      id,
      this.rootStore.files[foundIndex].title,
    );

    this.rootStore.updateSelectionStatus(
      id,
      this.rootStore.files[foundIndex].fileStatus & ~FileStatus.IsEditing,
      false,
    );

    this.rootStore.updateFileStatus(
      foundIndex,
      this.rootStore.files[foundIndex].fileStatus & ~FileStatus.IsEditing,
    );

    this.rootStore.getFileInfo(id).then((file) => {
      if (
        isVisible &&
        file.id === infoPanelSelection?.id &&
        infoPanelSelection?.fileExst === file.fileExst
      ) {
        setInfoPanelSelection(merge(cloneDeep(infoPanelSelection), file));
      }
    });

    this.rootStore.createThumbnail(this.rootStore.files[foundIndex]);
  };

  wsModifyFolderCreate = async (opt) => {
    if (opt?.type === "file" && opt?.id) {
      const foundIndex = this.files.findIndex((x) => x.id === opt?.id);

      const file = JSON.parse(opt?.data);

      if (this.selectedFolderStore.id !== file.folderId) {
        const movedToIndex = this.getFolderIndex(file.folderId);
        if (movedToIndex > -1) this.folders[movedToIndex].filesCount++;
        return;
      }

      //To update a file version
      if (foundIndex > -1) {
        if (
          this.files[foundIndex].version !== file.version ||
          this.files[foundIndex].versionGroup !== file.versionGroup
        ) {
          this.files[foundIndex].version = file.version;
          this.files[foundIndex].versionGroup = file.versionGroup;
        }
        this.checkSelection(file);
      }

      if (foundIndex > -1) return;

      this.selectedFolderStore.setFilesCount(
        this.selectedFolderStore.filesCount + 1,
      );

      setTimeout(() => {
        const foundIndex = this.files.findIndex((x) => x.id === file.id);
        if (foundIndex > -1) {
          //console.log("Skip in timeout");
          return null;
        }

        this.createNewFilesQueue.enqueue(() => {
          const foundIndex = this.files.findIndex((x) => x.id === file.id);
          if (foundIndex > -1) {
            //console.log("Skip in queue");
            return null;
          }

          return api.files.getFileInfo(file.id);
        });
      }, 300);
    } else if (opt?.type === "folder" && opt?.id) {
      this.selectedFolderStore.setFoldersCount(
        this.selectedFolderStore.foldersCount + 1,
      );

      const foundIndex = this.folders.findIndex((x) => x.id == opt?.id);

      if (foundIndex > -1) return;

      const folder = JSON.parse(opt?.data);

      if (this.selectedFolderStore.id != folder.parentId) {
        const movedToIndex = this.getFolderIndex(folder.parentId);
        if (movedToIndex > -1) this.folders[movedToIndex].foldersCount++;
      }

      if (
        this.selectedFolderStore.id != folder.parentId ||
        (folder.roomType &&
          folder.createdBy.id === this.userStore.user.id &&
          this.roomCreated)
      ) {
        return (this.roomCreated = false);
      }

      const folderInfo = await api.files.getFolderInfo(folder.id);

      console.log("[WS] create new folder", folderInfo.id, folderInfo.title);

      const newFolders = [folderInfo, ...this.folders];

      const newFilter = this.filter;
      newFilter.total += 1;

      runInAction(() => {
        this.setFilter(newFilter);
        this.setFolders(newFolders);
      });
    }
  };

  wsModifyFolderUpdate = (opt) => {
    const { infoPanelSelection, updateInfoPanelSelection } =
      this.infoPanelStore;

    if (opt?.type === "file" && opt?.data) {
      const file = JSON.parse(opt?.data);
      if (!file || !file.id) return;

      this.getFileInfo(file.id); //this.setFile(file);
      console.log("[WS] update file", file.id, file.title);

      if (
        infoPanelSelection?.id == file.id &&
        !infoPanelSelection?.isFolder &&
        !infoPanelSelection?.isRoom
      ) {
        const newInfoPanelSelection = this.getFilesListItems([file]);
        updateInfoPanelSelection(newInfoPanelSelection[0]);
      }

      this.checkSelection(file);
    } else if (opt?.type === "folder" && opt?.data) {
      const folder = JSON.parse(opt?.data);
      if (!folder || !folder.id) return;

      api.files
        .getFolderInfo(folder.id)
        .then((f) => {
          console.log("[WS] update folder", f.id, f.title);

          if (this.selection?.length) {
            const foundIndex = this.selection?.findIndex((x) => x.id === f.id);
            if (foundIndex > -1) {
              runInAction(() => {
                this.selection[foundIndex] = f;
              });
            }
          }

          if (this.bufferSelection) {
            if (
              this.bufferSelection.id === f.id &&
              (this.bufferSelection.isFolder || this.bufferSelection.isRoom)
            ) {
              this.setBufferSelection(f);
            }
          }

          const navigationPath = [...this.selectedFolderStore.navigationPath];

          const idx = navigationPath.findIndex((p) => p.id === f.id);

          if (idx !== -1) {
            navigationPath[idx].title = f?.title;
          }

          if (f.id === this.selectedFolderStore.id) {
            this.selectedFolderStore.setSelectedFolder({
              ...f,
              navigationPath,
            });
          }

          if (
            infoPanelSelection?.id == f.id &&
            (infoPanelSelection?.isFolder || infoPanelSelection?.isRoom)
          ) {
            const newInfoPanelSelection = this.getFilesListItems([f]);
            updateInfoPanelSelection(newInfoPanelSelection[0]);
          }

          this.setFolder(f);
        })
        .catch(() => {
          // console.log("Folder deleted")
        });
    }
  };

  wsModifyFolderDelete = (opt) => {
    if (opt?.type === "file" && opt?.id) {
      const foundIndex = this.files.findIndex((x) => x.id === opt?.id);
      if (foundIndex == -1) return;

      const foundFile = this.files[foundIndex];

      this.selectedFolderStore.setFilesCount(
        this.selectedFolderStore.filesCount - 1,
      );

      console.log("[WS] delete file", foundFile.id, foundFile.title);

      // this.setFiles(
      //   this.files.filter((_, index) => {
      //     return index !== foundIndex;
      //   })
      // );

      // const newFilter = this.filter.clone();
      // newFilter.total -= 1;
      // this.setFilter(newFilter);

      const tempActionFilesIds = JSON.parse(
        JSON.stringify(this.tempActionFilesIds),
      );
      tempActionFilesIds.push(foundFile.id);

      this.setTempActionFilesIds(tempActionFilesIds);

      this.removeStaleItemFromSelection(foundFile);
      this.debounceRemoveFiles();

      // Hide pagination when deleting files
      runInAction(() => {
        this.isHidePagination = true;
      });

      runInAction(() => {
        if (
          this.files.length === 0 &&
          this.folders.length === 0 &&
          this.pageItemsLength > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    } else if (opt?.type === "folder" && opt?.id) {
      const foundIndex = this.folders.findIndex((x) => x.id === opt?.id);
      if (foundIndex == -1) {
        const removedId = opt.id;
        const pathParts = this.selectedFolderStore.pathParts;

        const includePathPart = pathParts.some(({ id }) => id === removedId);

        if (includePathPart) {
          window.DocSpace.navigate("/");
        }

        return;
      }

      const foundFolder = this.folders[foundIndex];

      this.selectedFolderStore.setFoldersCount(
        this.selectedFolderStore.foldersCount - 1,
      );

      console.log("[WS] delete folder", foundFolder.id, foundFolder.title);

      const tempActionFoldersIds = JSON.parse(
        JSON.stringify(this.tempActionFoldersIds),
      );
      tempActionFoldersIds.push(foundFolder.id);

      this.setTempActionFoldersIds(tempActionFoldersIds);
      this.removeStaleItemFromSelection(foundFolder);
      this.debounceRemoveFolders();

      runInAction(() => {
        this.isHidePagination = true;
      });

      runInAction(() => {
        if (
          this.files.length === 0 &&
          this.folders.length === 0 &&
          this.pageItemsLength > 1
        ) {
          this.isLoadingFilesFind = true;
        }
      });
    }
  };

  reconnect = () => {
    SocketHelper.tryConnect();
    this.initSocketEvents();
  };
}

export default SocketService;
