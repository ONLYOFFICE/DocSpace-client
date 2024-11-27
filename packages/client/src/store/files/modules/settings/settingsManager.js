import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class SettingsManager {
  settings = null;
  defaultSettings = {
    thumbnailSize: "medium",
    showHiddenFiles: false,
    sortBy: "name",
    sortOrder: "asc",
    itemsPerPage: 25,
    viewAs: "tile"
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchSettings = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-settings",
        () => api.files.getSettings()
      );
      this.setSettings(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch file settings");
      throw err;
    }
  };

  updateSettings = async (updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-settings",
        () => api.files.updateSettings(updates)
      );
      this.setSettings({ ...this.settings, ...response.data });
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update file settings");
      throw err;
    }
  };

  setSettings = (settings) => {
    this.settings = {
      ...this.defaultSettings,
      ...settings
    };
  };

  // Thumbnail settings
  get thumbnailSize() {
    return this.settings?.thumbnailSize || this.defaultSettings.thumbnailSize;
  }

  setThumbnailSize = async (size) => {
    await this.updateSettings({ thumbnailSize: size });
  };

  // Hidden files settings
  get showHiddenFiles() {
    return this.settings?.showHiddenFiles || this.defaultSettings.showHiddenFiles;
  }

  setShowHiddenFiles = async (show) => {
    await this.updateSettings({ showHiddenFiles: show });
  };

  // Sort settings
  get sortBy() {
    return this.settings?.sortBy || this.defaultSettings.sortBy;
  }

  get sortOrder() {
    return this.settings?.sortOrder || this.defaultSettings.sortOrder;
  }

  setSorting = async (by, order) => {
    await this.updateSettings({ sortBy: by, sortOrder: order });
  };

  // Pagination settings
  get itemsPerPage() {
    return this.settings?.itemsPerPage || this.defaultSettings.itemsPerPage;
  }

  setItemsPerPage = async (count) => {
    await this.updateSettings({ itemsPerPage: count });
  };

  // View settings
  get viewAs() {
    return this.settings?.viewAs || this.defaultSettings.viewAs;
  }

  setViewAs = async (view) => {
    await this.updateSettings({ viewAs: view });
  };

  resetToDefaults = async () => {
    await this.updateSettings(this.defaultSettings);
  };

  clearSettings = () => {
    this.settings = null;
  };
}

export default SettingsManager;
