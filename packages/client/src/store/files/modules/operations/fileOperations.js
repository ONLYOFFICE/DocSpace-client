import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { FileStatus } from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

export class FileOperations {
  loadTimeout = null;
  isInit = false;
  alreadyFetchingRooms = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  initFiles = async () => {
    if (this.isInit) return;
    
    this.loadTimeout = setTimeout(() => {
      this.rootStore.clientLoadingStore?.setIsFolderLoading(true);
    }, LOADER_TIMEOUT);

    try {
      await this.fetchFiles();
      this.isInit = true;
    } catch (err) {
      console.error("Init files error:", err);
      toastr.error(err);
    } finally {
      clearTimeout(this.loadTimeout);
      this.rootStore.clientLoadingStore?.setIsFolderLoading(false);
    }
  };

  fetchFiles = async () => {
    const { selectedFolderStore, fileState, filterState } = this.rootStore;
    const folderId = selectedFolderStore.id;
    
    try {
      const response = await api.files.getFiles(folderId, filterState.currentFilter);
      const { files, folders, pathParts, ...filterData } = response.data;

      filterState.setFilter(filterData);
      fileState.setFiles(files);
      fileState.setFolders(folders);
      selectedFolderStore.setPathParts(pathParts);
    } catch (err) {
      console.error("Fetch files error:", err);
      throw err;
    }
  };

  createFile = async (fileData) => {
    try {
      const response = await api.files.createFile(fileData);
      const newFile = response.data;
      this.rootStore.fileState.addFile(newFile);
      return newFile;
    } catch (err) {
      console.error("Create file error:", err);
      toastr.error(err);
      throw err;
    }
  };

  deleteFiles = async (fileIds) => {
    try {
      await api.files.deleteFiles(fileIds);
      fileIds.forEach(id => {
        this.rootStore.fileState.removeFile(id);
      });
      this.rootStore.selectionState.clearSelection();
    } catch (err) {
      console.error("Delete files error:", err);
      toastr.error(err);
      throw err;
    }
  };

  updateFile = async (fileId, updates) => {
    try {
      const response = await api.files.updateFile(fileId, updates);
      const updatedFile = response.data;
      this.rootStore.fileState.updateFile(fileId, updatedFile);
      return updatedFile;
    } catch (err) {
      console.error("Update file error:", err);
      toastr.error(err);
      throw err;
    }
  };

  moveFiles = async (fileIds, destFolderId) => {
    try {
      await api.files.moveFiles(fileIds, destFolderId);
      fileIds.forEach(id => {
        this.rootStore.fileState.removeFile(id);
      });
      this.rootStore.selectionState.clearSelection();
    } catch (err) {
      console.error("Move files error:", err);
      toastr.error(err);
      throw err;
    }
  };

  copyFiles = async (fileIds, destFolderId) => {
    try {
      await api.files.copyFiles(fileIds, destFolderId);
      this.rootStore.selectionState.clearSelection();
    } catch (err) {
      console.error("Copy files error:", err);
      toastr.error(err);
      throw err;
    }
  };
}

export default FileOperations;
