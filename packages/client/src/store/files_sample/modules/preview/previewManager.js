import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class PreviewManager {
  previewCache = new Map();
  previewQueue = new Set();
  activePreview = null;
  previewSettings = {
    quality: "high",
    pageSize: "fit",
    zoom: 100,
    rotation: 0
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Preview Generation and Fetching
  generatePreview = async (fileId, options = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `generate-preview-${fileId}`,
        () => api.previews.generatePreview(fileId, options)
      );
      this.setPreviewData(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Generate preview");
      throw err;
    }
  };

  fetchPreview = async (fileId) => {
    try {
      if (this.previewCache.has(fileId)) {
        return this.previewCache.get(fileId);
      }

      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-preview-${fileId}`,
        () => api.previews.getPreview(fileId)
      );
      this.setPreviewData(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch preview");
      throw err;
    }
  };

  // Preview Queue Management
  enqueuePreview = (fileId) => {
    this.previewQueue.add(fileId);
    this.processPreviewQueue();
  };

  dequeuePreview = (fileId) => {
    this.previewQueue.delete(fileId);
  };

  processPreviewQueue = async () => {
    if (this.previewQueue.size === 0) return;

    const [nextFileId] = this.previewQueue;
    this.dequeuePreview(nextFileId);

    try {
      await this.generatePreview(nextFileId);
    } catch (err) {
      console.error("Failed to process preview:", err);
    }

    this.processPreviewQueue();
  };

  // Preview Settings Management
  updatePreviewSettings = (settings) => {
    this.previewSettings = {
      ...this.previewSettings,
      ...settings
    };

    if (this.activePreview) {
      this.refreshActivePreview();
    }
  };

  setQuality = (quality) => {
    if (["low", "medium", "high"].includes(quality)) {
      this.updatePreviewSettings({ quality });
    }
  };

  setPageSize = (pageSize) => {
    if (["fit", "width", "height"].includes(pageSize)) {
      this.updatePreviewSettings({ pageSize });
    }
  };

  setZoom = (zoom) => {
    const newZoom = Math.min(Math.max(25, zoom), 400);
    this.updatePreviewSettings({ zoom: newZoom });
  };

  setRotation = (rotation) => {
    const newRotation = rotation % 360;
    this.updatePreviewSettings({ rotation: newRotation });
  };

  // Active Preview Management
  setActivePreview = async (fileId) => {
    if (fileId === this.activePreview) return;

    this.activePreview = fileId;
    if (fileId) {
      await this.fetchPreview(fileId);
    }
  };

  refreshActivePreview = async () => {
    if (this.activePreview) {
      await this.generatePreview(this.activePreview, this.previewSettings);
    }
  };

  clearActivePreview = () => {
    this.activePreview = null;
  };

  // Preview Cache Management
  setPreviewData = (fileId, data) => {
    this.previewCache.set(fileId, {
      ...data,
      timestamp: new Date()
    });
  };

  invalidatePreview = (fileId) => {
    this.previewCache.delete(fileId);
    if (fileId === this.activePreview) {
      this.refreshActivePreview();
    }
  };

  clearPreviewCache = () => {
    this.previewCache.clear();
    this.previewQueue.clear();
    this.activePreview = null;
  };

  // Preview Information
  getPreviewInfo = (fileId) => {
    return this.previewCache.get(fileId);
  };

  isPreviewAvailable = (fileId) => {
    return this.previewCache.has(fileId);
  };

  isPreviewQueued = (fileId) => {
    return this.previewQueue.has(fileId);
  };

  // Computed Values
  get currentPreview() {
    return this.activePreview ? this.getPreviewInfo(this.activePreview) : null;
  }

  get currentPreviewSettings() {
    return { ...this.previewSettings };
  }

  get queueLength() {
    return this.previewQueue.size;
  }

  // Cleanup
  clearAll = () => {
    this.clearPreviewCache();
    this.previewSettings = {
      quality: "high",
      pageSize: "fit",
      zoom: 100,
      rotation: 0
    };
  };
}

export default PreviewManager;
