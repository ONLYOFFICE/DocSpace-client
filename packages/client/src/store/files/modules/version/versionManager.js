import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class VersionManager {
  versions = new Map();
  versionFilter = {
    startIndex: 0,
    count: 25,
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchVersions = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-versions-${fileId}`,
        () => api.files.getVersions(fileId, this.versionFilter)
      );

      this.setVersions(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch versions");
      throw err;
    }
  };

  fetchMoreVersions = async (fileId) => {
    try {
      this.versionFilter.startIndex += this.versionFilter.count;
      
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-more-versions-${fileId}`,
        () => api.files.getVersions(fileId, this.versionFilter)
      );

      this.appendVersions(fileId, response.data);
      return response.data;
    } catch (err) {
      this.versionFilter.startIndex -= this.versionFilter.count;
      this.rootStore.errorHandler.handleError(err, "Fetch more versions");
      throw err;
    }
  };

  createVersion = async (fileId, versionData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `create-version-${fileId}`,
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
        `delete-version-${fileId}`,
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
        `restore-version-${fileId}`,
        () => api.files.restoreVersion(fileId, versionId)
      );

      // Update current file with restored version
      this.rootStore.fileState.updateFile(fileId, response.data.file);
      
      // Add restoration event to history
      this.rootStore.historyManager.addHistoryEvent({
        type: "version_restore",
        fileId,
        versionId,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Restore version");
      throw err;
    }
  };

  setVersions = (fileId, versions) => {
    this.versions.set(fileId, versions);
  };

  appendVersions = (fileId, versions) => {
    const currentVersions = this.versions.get(fileId) || [];
    this.versions.set(fileId, [...currentVersions, ...versions]);
  };

  addVersion = (fileId, version) => {
    const versions = this.versions.get(fileId) || [];
    this.versions.set(fileId, [version, ...versions]);
  };

  removeVersion = (fileId, versionId) => {
    const versions = this.versions.get(fileId) || [];
    this.versions.set(
      fileId,
      versions.filter(v => v.id !== versionId)
    );
  };

  getVersions = (fileId) => {
    return this.versions.get(fileId) || [];
  };

  getVersion = (fileId, versionId) => {
    const versions = this.versions.get(fileId) || [];
    return versions.find(v => v.id === versionId);
  };

  clearVersions = (fileId) => {
    this.versions.delete(fileId);
  };

  get hasMoreVersions() {
    return this.versions.size >= this.versionFilter.count;
  }

  clearAll = () => {
    this.versions.clear();
    this.versionFilter = {
      startIndex: 0,
      count: 25,
    };
  };
}

export default VersionManager;
