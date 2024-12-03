import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class FolderManager {
  currentFolder = null;
  folderPath = [];
  folderTree = null;
  recentFolders = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchFolder = async (folderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-folder-${folderId}`,
        () => api.files.getFolder(folderId)
      );
      this.setCurrentFolder(response.data);
      await this.fetchFolderPath(folderId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch folder");
      throw err;
    }
  };

  fetchFolderPath = async (folderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-folder-path-${folderId}`,
        () => api.files.getFolderPath(folderId)
      );
      this.setFolderPath(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch folder path");
      throw err;
    }
  };

  fetchFolderTree = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-folder-tree",
        () => api.files.getFolderTree()
      );
      this.setFolderTree(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch folder tree");
      throw err;
    }
  };

  createFolder = async (parentId, folderData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `create-folder-${parentId}`,
        () => api.files.createFolder(parentId, folderData)
      );
      await this.rootStore.fileState.refreshFolder(parentId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create folder");
      throw err;
    }
  };

  updateFolder = async (folderId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `update-folder-${folderId}`,
        () => api.files.updateFolder(folderId, updates)
      );
      if (folderId === this.currentFolder?.id) {
        this.setCurrentFolder({ ...this.currentFolder, ...response.data });
      }
      await this.rootStore.fileState.refreshCurrentFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update folder");
      throw err;
    }
  };

  deleteFolder = async (folderId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `delete-folder-${folderId}`,
        () => api.files.deleteFolder(folderId)
      );
      if (folderId === this.currentFolder?.id) {
        const parentId = this.folderPath[this.folderPath.length - 2]?.id;
        if (parentId) {
          await this.fetchFolder(parentId);
        }
      }
      await this.rootStore.fileState.refreshCurrentFolder();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete folder");
      throw err;
    }
  };

  moveFolder = async (folderId, targetFolderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `move-folder-${folderId}`,
        () => api.files.moveFolder(folderId, targetFolderId)
      );
      await this.rootStore.fileState.refreshCurrentFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Move folder");
      throw err;
    }
  };

  copyFolder = async (folderId, targetFolderId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `copy-folder-${folderId}`,
        () => api.files.copyFolder(folderId, targetFolderId)
      );
      await this.rootStore.fileState.refreshCurrentFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Copy folder");
      throw err;
    }
  };

  setCurrentFolder = (folder) => {
    this.currentFolder = folder;
    this.addToRecentFolders(folder);
  };

  setFolderPath = (path) => {
    this.folderPath = path;
  };

  setFolderTree = (tree) => {
    this.folderTree = tree;
  };

  addToRecentFolders = (folder) => {
    if (!folder) return;
    
    const index = this.recentFolders.findIndex(f => f.id === folder.id);
    if (index !== -1) {
      this.recentFolders.splice(index, 1);
    }
    
    this.recentFolders.unshift(folder);
    if (this.recentFolders.length > 10) {
      this.recentFolders.pop();
    }
  };

  get parentFolderId() {
    return this.folderPath[this.folderPath.length - 2]?.id;
  }

  get isRootFolder() {
    return this.folderPath.length <= 1;
  }

  clearFolderState = () => {
    this.currentFolder = null;
    this.folderPath = [];
    this.folderTree = null;
    this.recentFolders = [];
  };
}

export default FolderManager;
