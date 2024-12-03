import { makeAutoObservable } from "mobx";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

export class LoadingManager {
  loadingStates = new Map();
  loadingTimeouts = new Map();
  isUpdatingRowItem = false;
  isFetchingRooms = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
      loadingTimeouts: false
    });
  }

  startLoading = (operationId, showLoaderAfterDelay = true) => {
    this.loadingStates.set(operationId, true);

    if (showLoaderAfterDelay) {
      const timeoutId = setTimeout(() => {
        if (this.loadingStates.get(operationId)) {
          this.rootStore.clientLoadingStore?.setIsFolderLoading(true);
        }
      }, LOADER_TIMEOUT);

      this.loadingTimeouts.set(operationId, timeoutId);
    } else {
      this.rootStore.clientLoadingStore?.setIsFolderLoading(true);
    }
  };

  stopLoading = (operationId) => {
    this.loadingStates.set(operationId, false);
    
    const timeoutId = this.loadingTimeouts.get(operationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.loadingTimeouts.delete(operationId);
    }

    // Only stop loading if all operations are complete
    if (![...this.loadingStates.values()].some(state => state)) {
      this.rootStore.clientLoadingStore?.setIsFolderLoading(false);
    }
  };

  setUpdatingRowItem = (isUpdating) => {
    this.isUpdatingRowItem = isUpdating;
  };

  setFetchingRooms = (isFetching) => {
    this.isFetchingRooms = isFetching;
  };

  withLoading = async (operationId, operation, showLoaderAfterDelay = true) => {
    this.startLoading(operationId, showLoaderAfterDelay);
    try {
      return await operation();
    } finally {
      this.stopLoading(operationId);
    }
  };

  get isLoading() {
    return [...this.loadingStates.values()].some(state => state);
  }

  get loadingOperations() {
    return [...this.loadingStates.entries()]
      .filter(([_, state]) => state)
      .map(([id]) => id);
  }

  clearAllLoadingStates = () => {
    this.loadingStates.clear();
    this.loadingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.loadingTimeouts.clear();
    this.rootStore.clientLoadingStore?.setIsFolderLoading(false);
  };
}

export default LoadingManager;
