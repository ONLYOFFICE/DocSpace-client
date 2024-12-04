import api from "@docspace/shared/api";
import { runInAction } from "mobx";

class FileService {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  async getFileInfo(id) {
    const fileInfo = await api.files.getFileInfo(id);
    this.setFile(fileInfo);
    return fileInfo;
  }

  setFile(file) {
    const index = this.rootStore.files.findIndex((x) => x.id === file.id);
    if (index !== -1) {
      this.rootStore.files[index] = file;
      this.rootStore.createThumbnail(file);
    }
  }

  removeFiles = (fileIds, folderIds, showToast, destFolderId) => {
    const { isRoomsFolder, isArchiveFolder } = this.rootStore.treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

    let deleteCount = 0;

    if (fileIds) {
      let i = fileIds.length;
      while (i !== 0) {
        const file = this.rootStore.files.find((x) => x.id === fileIds[i - 1]);
        if (file) deleteCount += 1;

        i--;
      }
    }

    if (folderIds) {
      let i = folderIds.length;
      while (i !== 0) {
        const folder = this.rootStore.folders.find(
          (x) => x.id === folderIds[i - 1]
        );
        if (folder) deleteCount += 1;

        i--;
      }
    }

    const newFilter = isRooms
      ? this.rootStore.roomsFilter.clone()
      : this.rootStore.filter.clone();
    newFilter.total -= deleteCount;

    if (destFolderId && destFolderId === this.rootStore.selectedFolderStore.id)
      return;

    if (newFilter.total <= this.rootStore.filesList.length) {
      const files = fileIds
        ? this.rootStore.files.filter((x) => !fileIds.includes(x.id))
        : this.rootStore.files;
      const folders = folderIds
        ? this.rootStore.folders.filter((x) => !folderIds.includes(x.id))
        : this.rootStore.folders;

      const hotkeysClipboard = fileIds
        ? this.rootStore.hotkeysClipboard.filter(
            (f) => !fileIds.includes(f.id) && !f.isFolder
          )
        : this.rootStore.hotkeysClipboard.filter(
            (f) => !folderIds.includes(f.id) && f.isFolder
          );

      this.rootStore.setIsEmptyPage(newFilter.total <= 0);

      runInAction(() => {
        isRooms
          ? this.rootStore.setRoomsFilter(newFilter)
          : this.rootStore.setFilter(newFilter);
        this.rootStore.setFiles(files);
        this.rootStore.setFolders(folders);
        this.rootStore.setTempActionFilesIds([]);
        this.rootStore.setHotkeysClipboard(hotkeysClipboard);
        this.rootStore.setTempActionFoldersIds([]);
      });

      showToast && showToast();

      return;
    }

    if (
      this.rootStore.filesList.length - deleteCount >=
      this.rootStore.filter.pageCount
    ) {
      const files = fileIds
        ? this.rootStore.files.filter((x) => !fileIds.includes(x.id))
        : this.rootStore.files;

      const folders = folderIds
        ? this.rootStore.folders.filter((x) => !folderIds.includes(x.id))
        : this.rootStore.folders;

      runInAction(() => {
        isRooms
          ? this.rootStore.setRoomsFilter(newFilter)
          : this.rootStore.setFilter(newFilter);
        this.rootStore.setFiles(files);
        this.rootStore.setFolders(folders);
        this.rootStore.setTempActionFilesIds([]);
        this.rootStore.setTempActionFoldersIds([]);
      });

      showToast && showToast();

      return;
    }

    newFilter.startIndex =
      (newFilter.page + 1) * newFilter.pageCount - deleteCount;
    newFilter.pageCount = deleteCount;
    if (isRooms) {
      return api.rooms
        .getRooms(newFilter)
        .then((res) => {
          const folders = folderIds
            ? this.rootStore.folders.filter((x) => !folderIds.includes(x.id))
            : this.rootStore.folders;

          const newFolders = [...folders, ...res.folders];

          const roomsFilter = this.rootStore.roomsFilter.clone();
          roomsFilter.total = res.total;

          runInAction(() => {
            this.rootStore.setRoomsFilter(roomsFilter);
            this.rootStore.setFolders(newFolders);
          });

          showToast && showToast();
        })
        .catch((err) => {
          // toastr.error(err);
          console.error(err);
        })
        .finally(() => {
          this.rootStore.setTempActionFilesIds([]);
          this.rootStore.setTempActionFoldersIds([]);
        });
    } else {
      api.files
        .getFolder(newFilter.folder, newFilter)
        .then((res) => {
          const files = fileIds
            ? this.rootStore.files.filter((x) => !fileIds.includes(x.id))
            : this.rootStore.files;
          const folders = folderIds
            ? this.rootStore.folders.filter((x) => !folderIds.includes(x.id))
            : this.rootStore.folders;

          const newFiles = [...files, ...res.files];
          const newFolders = [...folders, ...res.folders];

          const filter = this.rootStore.filter.clone();
          filter.total = res.total;

          runInAction(() => {
            this.rootStore.setFilter(filter);
            this.rootStore.setFiles(newFiles);
            this.rootStore.setFolders(newFolders);
          });

          showToast && showToast();
        })
        .catch((err) => {
          // toastr.error(err);
          console.error(err);
        })
        .finally(() => {
          this.rootStore.setTempActionFilesIds([]);
          this.rootStore.setTempActionFoldersIds([]);
        });
    }
  };
}

export default FileService;
