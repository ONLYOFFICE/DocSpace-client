import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class FileOperationsManager {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  createFile = async (folderId, file, fileOptions = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-file",
        () => api.files.createFile(folderId, file, fileOptions)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create file");
      throw err;
    }
  };

  updateFile = async (fileId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-file",
        () => api.files.updateFile(fileId, updates)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update file");
      throw err;
    }
  };

  deleteFile = async (fileId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-file",
        () => api.files.deleteFile(fileId)
      );
      await this.rootStore.folderManager.refreshFolder();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete file");
      throw err;
    }
  };

  moveFile = async (fileId, destinationFolderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "move-file",
        () => api.files.moveFile(fileId, destinationFolderId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Move file");
      throw err;
    }
  };

  copyFile = async (fileId, destinationFolderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "copy-file",
        () => api.files.copyFile(fileId, destinationFolderId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Copy file");
      throw err;
    }
  };

  downloadFile = async (fileId, version = null) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "download-file",
        () => api.files.downloadFile(fileId, version)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Download file");
      throw err;
    }
  };

  lockFile = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "lock-file",
        () => api.files.lockFile(fileId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Lock file");
      throw err;
    }
  };

  unlockFile = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "unlock-file",
        () => api.files.unlockFile(fileId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Unlock file");
      throw err;
    }
  };

  getFileVersions = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "get-versions",
        () => api.files.getFileVersions(fileId)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get file versions");
      throw err;
    }
  };

  restoreFileVersion = async (fileId, versionId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "restore-version",
        () => api.files.restoreFileVersion(fileId, versionId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Restore file version");
      throw err;
    }
  };

  getFileInfo = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "get-file-info",
        () => api.files.getFileInfo(fileId)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get file info");
      throw err;
    }
  };
}

export default FileOperationsManager;
