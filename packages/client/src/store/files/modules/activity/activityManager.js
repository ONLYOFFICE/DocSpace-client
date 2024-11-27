import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class ActivityManager {
  activities = new Map();
  documentHistory = new Map();
  userActivities = new Map();
  activityStats = new Map();
  activityFilters = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Activity Tracking
  logActivity = async (activity) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `log-activity-${activity.type}`,
        () => api.activity.logActivity(activity)
      );
      
      this.addActivity(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Log activity");
      throw err;
    }
  };

  getActivities = async (filters = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "get-activities",
        () => api.activity.getActivities(filters)
      );
      
      this.updateActivities(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get activities");
      throw err;
    }
  };

  // Document History
  getDocumentHistory = async (documentId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `get-document-history-${documentId}`,
        () => api.activity.getDocumentHistory(documentId)
      );
      
      this.updateDocumentHistory(documentId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get document history");
      throw err;
    }
  };

  // User Activity
  getUserActivity = async (userId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `get-user-activity-${userId}`,
        () => api.activity.getUserActivity(userId)
      );
      
      this.updateUserActivity(userId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get user activity");
      throw err;
    }
  };

  // Activity Statistics
  getActivityStats = async (filters = {}) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "get-activity-stats",
        () => api.activity.getActivityStats(filters)
      );
      
      this.updateActivityStats(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get activity statistics");
      throw err;
    }
  };

  // Filter Management
  saveActivityFilter = async (filter) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "save-activity-filter",
        () => api.activity.saveFilter(filter)
      );
      
      this.addActivityFilter(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Save activity filter");
      throw err;
    }
  };

  deleteActivityFilter = async (filterId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `delete-activity-filter-${filterId}`,
        () => api.activity.deleteFilter(filterId)
      );
      
      this.removeActivityFilter(filterId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete activity filter");
      throw err;
    }
  };

  // Local State Management
  addActivity = (activity) => {
    this.activities.set(activity.id, {
      ...activity,
      timestamp: new Date(activity.timestamp)
    });
  };

  updateActivities = (activities) => {
    activities.forEach(activity => {
      this.addActivity(activity);
    });
  };

  updateDocumentHistory = (documentId, history) => {
    this.documentHistory.set(documentId, history.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })));
  };

  updateUserActivity = (userId, activities) => {
    this.userActivities.set(userId, activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    })));
  };

  updateActivityStats = (stats) => {
    Object.entries(stats).forEach(([key, value]) => {
      this.activityStats.set(key, {
        ...value,
        updatedAt: new Date()
      });
    });
  };

  addActivityFilter = (filter) => {
    this.activityFilters.set(filter.id, {
      ...filter,
      updatedAt: new Date()
    });
  };

  removeActivityFilter = (filterId) => {
    this.activityFilters.delete(filterId);
  };

  // Computed Values
  getRecentActivities = (limit = 10) => {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  getDocumentHistoryEntries = (documentId) => {
    return this.documentHistory.get(documentId) || [];
  };

  getUserActivityEntries = (userId) => {
    return this.userActivities.get(userId) || [];
  };

  getActivityStatistics = () => {
    return Object.fromEntries(this.activityStats);
  };

  getSavedFilters = () => {
    return Array.from(this.activityFilters.values());
  };

  // Activity Analysis
  getMostActiveUsers = (limit = 5) => {
    const userStats = new Map();
    
    for (const activity of this.activities.values()) {
      const count = userStats.get(activity.userId) || 0;
      userStats.set(activity.userId, count + 1);
    }
    
    return Array.from(userStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId, count]) => ({ userId, count }));
  };

  getMostAccessedDocuments = (limit = 5) => {
    const documentStats = new Map();
    
    for (const activity of this.activities.values()) {
      if (activity.documentId) {
        const count = documentStats.get(activity.documentId) || 0;
        documentStats.set(activity.documentId, count + 1);
      }
    }
    
    return Array.from(documentStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([documentId, count]) => ({ documentId, count }));
  };

  // Cleanup
  clearAll = () => {
    this.activities.clear();
    this.documentHistory.clear();
    this.userActivities.clear();
    this.activityStats.clear();
    this.activityFilters.clear();
  };
}

export default ActivityManager;
