import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class TrashManager {
  trashedItems = new Map();
  trashInfo = {
    totalItems: 0,
    totalSize: 0
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchTrashItems = async (params = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-trash",
        () => api.files.getTrashItems(params)
      );
      this.setTrashedItems(response.data.items);
      this.setTrashInfo({
        totalItems: response.data.total,
        totalSize: response.data.totalSize
      });
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch trash items");
      throw err;
    }
  };

  restoreItems = async (itemIds) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "restore-items",
        () => api.files.restoreFromTrash(itemIds)
      );
      this.removeTrashedItems(itemIds);
      await this.updateTrashInfo();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Restore items from trash");
      throw err;
    }
  };

  emptyTrash = async () => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "empty-trash",
        () => api.files.emptyTrash()
      );
      this.clearTrash();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Empty trash");
      throw err;
    }
  };

  deleteItemsPermanently = async (itemIds) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-permanently",
        () => api.files.deletePermanently(itemIds)
      );
      this.removeTrashedItems(itemIds);
      await this.updateTrashInfo();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete items permanently");
      throw err;
    }
  };

  updateTrashInfo = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-trash-info",
        () => api.files.getTrashInfo()
      );
      this.setTrashInfo(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update trash info");
      throw err;
    }
  };

  setTrashedItems = (items) => {
    this.trashedItems.clear();
    items.forEach(item => {
      this.trashedItems.set(item.id, {
        ...item,
        deletedAt: new Date(item.deletedAt)
      });
    });
  };

  removeTrashedItems = (itemIds) => {
    itemIds.forEach(id => this.trashedItems.delete(id));
  };

  setTrashInfo = (info) => {
    this.trashInfo = info;
  };

  get isEmpty() {
    return this.trashedItems.size === 0;
  }

  get totalItems() {
    return this.trashInfo.totalItems;
  }

  get totalSize() {
    return this.trashInfo.totalSize;
  }

  getTrashedItem = (itemId) => {
    return this.trashedItems.get(itemId);
  };

  clearTrash = () => {
    this.trashedItems.clear();
    this.trashInfo = {
      totalItems: 0,
      totalSize: 0
    };
  };
}

export default TrashManager;
