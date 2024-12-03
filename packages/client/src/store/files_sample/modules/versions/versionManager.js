import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class VersionManager {
  versions = new Map();
  selectedVersion = null;
  versionHistory = new Map();
  
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchVersions = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-versions",
        () => api.files.getFileVersions(fileId)
      );
      this.setVersions(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch versions");
      throw err;
    }
  };

  createVersion = async (fileId, versionData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-version",
        () => api.files.createVersion(fileId, versionData)
      );
      this.addVersion(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create version");
      throw err;
    }
  };

  deleteVersion = async (fileId, versionId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-version",
        () => api.files.deleteVersion(fileId, versionId)
      );
      this.removeVersion(fileId, versionId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete version");
      throw err;
    }
  };

  restoreVersion = async (fileId, versionId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "restore-version",
        () => api.files.restoreVersion(fileId, versionId)
      );
      await this.fetchVersions(fileId);
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Restore version");
      throw err;
    }
  };

  compareVersions = async (fileId, versionId1, versionId2) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "compare-versions",
        () => api.files.compareVersions(fileId, versionId1, versionId2)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Compare versions");
      throw err;
    }
  };

  downloadVersion = async (fileId, versionId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "download-version",
        () => api.files.downloadVersion(fileId, versionId)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Download version");
      throw err;
    }
  };

  // Local state management
  setVersions = (fileId, versions) => {
    const fileVersions = new Map();
    versions.forEach(version => {
      fileVersions.set(version.id, {
        ...version,
        created: new Date(version.created),
        modified: new Date(version.modified)
      });
    });
    this.versions.set(fileId, fileVersions);
    this.updateVersionHistory(fileId, versions);
  };

  addVersion = (fileId, version) => {
    const fileVersions = this.versions.get(fileId) || new Map();
    fileVersions.set(version.id, {
      ...version,
      created: new Date(version.created),
      modified: new Date(version.modified)
    });
    this.versions.set(fileId, fileVersions);
    this.addToVersionHistory(fileId, version);
  };

  removeVersion = (fileId, versionId) => {
    const fileVersions = this.versions.get(fileId);
    if (fileVersions) {
      fileVersions.delete(versionId);
      if (fileVersions.size === 0) {
        this.versions.delete(fileId);
      }
    }
    this.removeFromVersionHistory(fileId, versionId);
  };

  selectVersion = (versionId) => {
    this.selectedVersion = versionId;
  };

  updateVersionHistory = (fileId, versions) => {
    const history = versions.map(version => ({
      id: version.id,
      version: version.version,
      created: new Date(version.created),
      modified: new Date(version.modified),
      author: version.author,
      comment: version.comment
    }));
    this.versionHistory.set(fileId, history);
  };

  addToVersionHistory = (fileId, version) => {
    const history = this.versionHistory.get(fileId) || [];
    history.push({
      id: version.id,
      version: version.version,
      created: new Date(version.created),
      modified: new Date(version.modified),
      author: version.author,
      comment: version.comment
    });
    this.versionHistory.set(fileId, history);
  };

  removeFromVersionHistory = (fileId, versionId) => {
    const history = this.versionHistory.get(fileId);
    if (history) {
      const updatedHistory = history.filter(v => v.id !== versionId);
      if (updatedHistory.length === 0) {
        this.versionHistory.delete(fileId);
      } else {
        this.versionHistory.set(fileId, updatedHistory);
      }
    }
  };

  // Computed values
  getFileVersions = (fileId) => {
    return Array.from((this.versions.get(fileId) || new Map()).values());
  };

  getVersion = (fileId, versionId) => {
    return this.versions.get(fileId)?.get(versionId);
  };

  getVersionHistory = (fileId) => {
    return this.versionHistory.get(fileId) || [];
  };

  get currentVersion() {
    return this.selectedVersion;
  }

  clearAll = () => {
    this.versions.clear();
    this.selectedVersion = null;
    this.versionHistory.clear();
  };
}

export default VersionManager;
