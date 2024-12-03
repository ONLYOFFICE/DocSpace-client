import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class IndexingManager {
  indexingQueue = new Map();
  indexingStatus = new Map();
  indexingErrors = new Map();
  indexingStats = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Queue Management
  queueForIndexing = async (documentId, priority = "normal") => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `queue-indexing-${documentId}`,
        () => api.indexing.queueDocument(documentId, priority)
      );
      
      this.addToQueue(documentId, {
        priority,
        queuedAt: new Date(),
        status: "queued",
        ...response.data
      });
      
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Queue document for indexing");
      throw err;
    }
  };

  cancelIndexing = async (documentId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `cancel-indexing-${documentId}`,
        () => api.indexing.cancelIndexing(documentId)
      );
      
      this.removeFromQueue(documentId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Cancel document indexing");
      throw err;
    }
  };

  // Status Management
  checkIndexingStatus = async (documentId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `check-indexing-${documentId}`,
        () => api.indexing.getStatus(documentId)
      );
      
      this.updateIndexingStatus(documentId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Check indexing status");
      throw err;
    }
  };

  // Batch Operations
  queueBatchForIndexing = async (documentIds, priority = "normal") => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "queue-batch-indexing",
        () => api.indexing.queueBatch(documentIds, priority)
      );
      
      response.data.forEach(item => {
        this.addToQueue(item.documentId, {
          priority,
          queuedAt: new Date(),
          status: "queued",
          ...item
        });
      });
      
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Queue batch for indexing");
      throw err;
    }
  };

  // Search Operations
  searchInDocument = async (documentId, query, options = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `search-document-${documentId}`,
        () => api.indexing.searchDocument(documentId, query, options)
      );
      
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Search in document");
      throw err;
    }
  };

  // Statistics
  getIndexingStats = async (documentId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `indexing-stats-${documentId}`,
        () => api.indexing.getStats(documentId)
      );
      
      this.updateIndexingStats(documentId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get indexing statistics");
      throw err;
    }
  };

  // Local State Management
  addToQueue = (documentId, data) => {
    this.indexingQueue.set(documentId, {
      ...data,
      updatedAt: new Date()
    });
  };

  removeFromQueue = (documentId) => {
    this.indexingQueue.delete(documentId);
  };

  updateIndexingStatus = (documentId, status) => {
    this.indexingStatus.set(documentId, {
      ...status,
      updatedAt: new Date()
    });

    if (status.error) {
      this.indexingErrors.set(documentId, {
        error: status.error,
        timestamp: new Date()
      });
    } else {
      this.indexingErrors.delete(documentId);
    }
  };

  updateIndexingStats = (documentId, stats) => {
    this.indexingStats.set(documentId, {
      ...stats,
      updatedAt: new Date()
    });
  };

  // Computed Values
  getQueuedDocuments = () => {
    return Array.from(this.indexingQueue.entries()).map(([documentId, data]) => ({
      documentId,
      ...data
    }));
  };

  getDocumentStatus = (documentId) => {
    return this.indexingStatus.get(documentId) || null;
  };

  getDocumentError = (documentId) => {
    return this.indexingErrors.get(documentId) || null;
  };

  getDocumentStats = (documentId) => {
    return this.indexingStats.get(documentId) || null;
  };

  isDocumentQueued = (documentId) => {
    return this.indexingQueue.has(documentId);
  };

  isDocumentIndexed = (documentId) => {
    const status = this.indexingStatus.get(documentId);
    return status && status.status === "completed";
  };

  // Cleanup
  clearAll = () => {
    this.indexingQueue.clear();
    this.indexingStatus.clear();
    this.indexingErrors.clear();
    this.indexingStats.clear();
  };
}

export default IndexingManager;
