import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { thumbnailStatuses } from "@docspace/client/src/helpers/filesConstants";
import Queue from "queue-promise";

export class ThumbnailManager {
  thumbnailQueue = new Queue({
    concurrent: 3,
    interval: 100
  });
  
  thumbnailCache = new Map();
  maxCacheSize = 500;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
      thumbnailQueue: false,
      thumbnailCache: true
    });
  }

  enqueueThumbnailGeneration = (fileId) => {
    if (this.thumbnailCache.has(fileId)) {
      return;
    }

    this.thumbnailQueue.enqueue(async () => {
      try {
        await this.generateThumbnail(fileId);
      } catch (err) {
        this.rootStore.errorHandler.handleError(err, "Thumbnail generation");
      }
    });
  };

  generateThumbnail = async (fileId) => {
    try {
      const response = await api.files.getThumbnail(fileId);
      this.updateThumbnailCache(fileId, response.data);
      this.updateFileStatus(fileId, thumbnailStatuses.GENERATED);
      return response.data;
    } catch (err) {
      this.updateFileStatus(fileId, thumbnailStatuses.ERROR);
      throw err;
    }
  };

  updateThumbnailCache = (fileId, thumbnailData) => {
    if (this.thumbnailCache.size >= this.maxCacheSize) {
      const firstKey = this.thumbnailCache.keys().next().value;
      this.thumbnailCache.delete(firstKey);
    }

    this.thumbnailCache.set(fileId, {
      data: thumbnailData,
      timestamp: Date.now()
    });
  };

  updateFileStatus = (fileId, status) => {
    const file = this.rootStore.fileState.files.find(f => f.id === fileId);
    if (file) {
      this.rootStore.fileOperations.updateFile(fileId, {
        ...file,
        thumbnailStatus: status
      });
    }
  };

  clearThumbnailCache = () => {
    this.thumbnailCache.clear();
  };

  getThumbnail = (fileId) => {
    return this.thumbnailCache.get(fileId)?.data;
  };

  hasThumbnail = (fileId) => {
    return this.thumbnailCache.has(fileId);
  };

  get cacheSize() {
    return this.thumbnailCache.size;
  }

  get isProcessing() {
    return this.thumbnailQueue.size > 0;
  }
}

export default ThumbnailManager;
