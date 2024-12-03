import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { BATCH_OPERATION_TYPE } from "@docspace/shared/constants";

export class BatchManager {
  operations = new Map();
  operationProgress = new Map();
  operationStatus = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  startBatchOperation = async (operationType, items, targetFolderId = null) => {
    try {
      const operationId = `${operationType}-${Date.now()}`;
      
      const response = await this.rootStore.loadingManager.withLoading(
        `start-batch-${operationId}`,
        () => api.files.startBatchOperation({
          type: operationType,
          items,
          targetFolderId
        })
      );

      this.setOperation(operationId, {
        type: operationType,
        items,
        targetFolderId,
        status: "running",
        progress: 0,
        startTime: new Date(),
        ...response.data
      });

      // Start polling for progress
      this.pollOperationProgress(operationId);

      return operationId;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Start batch operation");
      throw err;
    }
  };

  cancelBatchOperation = async (operationId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `cancel-batch-${operationId}`,
        () => api.files.cancelBatchOperation(operationId)
      );

      this.updateOperationStatus(operationId, "cancelled");
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Cancel batch operation");
      throw err;
    }
  };

  pollOperationProgress = async (operationId) => {
    const operation = this.operations.get(operationId);
    if (!operation || operation.status !== "running") return;

    try {
      const response = await api.files.getBatchOperationProgress(operationId);
      
      this.updateOperationProgress(operationId, response.data.progress);
      
      if (response.data.status === "completed") {
        this.updateOperationStatus(operationId, "completed");
        await this.handleOperationCompletion(operationId);
      } else if (response.data.status === "failed") {
        this.updateOperationStatus(operationId, "failed");
        this.rootStore.errorHandler.handleError(
          new Error(response.data.error),
          "Batch operation failed"
        );
      } else {
        // Continue polling if operation is still running
        setTimeout(() => this.pollOperationProgress(operationId), 1000);
      }
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Poll batch operation progress");
      this.updateOperationStatus(operationId, "failed");
    }
  };

  handleOperationCompletion = async (operationId) => {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    try {
      switch (operation.type) {
        case BATCH_OPERATION_TYPE.Move:
          await this.rootStore.fileState.refreshFolder(operation.targetFolderId);
          break;
        case BATCH_OPERATION_TYPE.Copy:
          await this.rootStore.fileState.refreshFolder(operation.targetFolderId);
          break;
        case BATCH_OPERATION_TYPE.Delete:
          await this.rootStore.fileState.removeItems(operation.items);
          break;
        case BATCH_OPERATION_TYPE.Share:
          await Promise.all(
            operation.items.map(item => 
              this.rootStore.sharingManager.fetchSharing(item.id)
            )
          );
          break;
        default:
          await this.rootStore.fileState.refreshCurrentFolder();
      }
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Handle batch operation completion");
    }
  };

  setOperation = (operationId, operation) => {
    this.operations.set(operationId, operation);
    this.operationProgress.set(operationId, 0);
    this.operationStatus.set(operationId, "running");
  };

  updateOperationProgress = (operationId, progress) => {
    this.operationProgress.set(operationId, progress);
  };

  updateOperationStatus = (operationId, status) => {
    this.operationStatus.set(operationId, status);
    
    const operation = this.operations.get(operationId);
    if (operation) {
      this.operations.set(operationId, { ...operation, status });
    }
  };

  getOperation = (operationId) => {
    return this.operations.get(operationId);
  };

  getOperationProgress = (operationId) => {
    return this.operationProgress.get(operationId) || 0;
  };

  getOperationStatus = (operationId) => {
    return this.operationStatus.get(operationId);
  };

  get activeOperations() {
    return Array.from(this.operations.entries())
      .filter(([_, operation]) => operation.status === "running")
      .map(([id, operation]) => ({
        id,
        ...operation,
        progress: this.getOperationProgress(id)
      }));
  }

  get completedOperations() {
    return Array.from(this.operations.entries())
      .filter(([_, operation]) => operation.status === "completed")
      .map(([id, operation]) => ({
        id,
        ...operation,
        progress: 100
      }));
  }

  clearOperation = (operationId) => {
    this.operations.delete(operationId);
    this.operationProgress.delete(operationId);
    this.operationStatus.delete(operationId);
  };

  clearCompletedOperations = () => {
    Array.from(this.operations.entries())
      .filter(([_, operation]) => 
        ["completed", "cancelled", "failed"].includes(operation.status)
      )
      .forEach(([id]) => this.clearOperation(id));
  };

  clearAll = () => {
    this.operations.clear();
    this.operationProgress.clear();
    this.operationStatus.clear();
  };
}

export default BatchManager;
