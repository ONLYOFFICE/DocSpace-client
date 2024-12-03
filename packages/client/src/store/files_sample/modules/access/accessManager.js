import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { ShareAccessRights } from "@docspace/shared/enums";
// import { toastr } from "@docspace/shared/components/toast";

export class AccessManager {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
    });
  }

  setFileAccess = async (fileId, access) => {
    try {
      const response = await api.files.setAccess(fileId, access);
      const updatedFile = response.data;
      this.rootStore.fileState.updateFile(fileId, updatedFile);
      return updatedFile;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Set file access");
      throw err;
    }
  };

  setFolderAccess = async (folderId, access) => {
    try {
      const response = await api.folders.setAccess(folderId, access);
      const updatedFolder = response.data;
      this.rootStore.fileState.updateFolder(folderId, updatedFolder);
      return updatedFolder;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Set folder access");
      throw err;
    }
  };

  getFileSecurityInfo = async (fileId) => {
    try {
      const response = await api.files.getSecurityInfo(fileId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get file security info");
      throw err;
    }
  };

  getFolderSecurityInfo = async (folderId) => {
    try {
      const response = await api.folders.getSecurityInfo(folderId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get folder security info");
      throw err;
    }
  };

  hasFileAccess = (file, requiredAccess) => {
    if (!file || !file.security) return false;
    return this.checkAccess(file.security.access, requiredAccess);
  };

  hasFolderAccess = (folder, requiredAccess) => {
    if (!folder || !folder.security) return false;
    return this.checkAccess(folder.security.access, requiredAccess);
  };

  checkAccess = (currentAccess, requiredAccess) => {
    const accessLevels = {
      [ShareAccessRights.None]: 0,
      [ShareAccessRights.Read]: 1,
      [ShareAccessRights.Comment]: 2,
      [ShareAccessRights.ReadWrite]: 3,
      [ShareAccessRights.CustomFilter]: 4,
      [ShareAccessRights.Full]: 5,
    };

    return accessLevels[currentAccess] >= accessLevels[requiredAccess];
  };

  canRead = (item) => {
    return this.hasFileAccess(item, ShareAccessRights.Read);
  };

  canWrite = (item) => {
    return this.hasFileAccess(item, ShareAccessRights.ReadWrite);
  };

  canDelete = (item) => {
    return this.hasFileAccess(item, ShareAccessRights.Full);
  };

  canShare = (item) => {
    return this.hasFileAccess(item, ShareAccessRights.Full);
  };

  canComment = (item) => {
    return this.hasFileAccess(item, ShareAccessRights.Comment);
  };
}

export default AccessManager;
