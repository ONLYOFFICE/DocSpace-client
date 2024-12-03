import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { NOTIFICATION_TYPE } from "@docspace/shared/constants";

export class NotificationManager {
  notifications = new Map();
  subscriptions = new Map();
  notificationFilter = {
    startIndex: 0,
    count: 25,
    unreadOnly: false
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchNotifications = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-notifications-${fileId}`,
        () => api.files.getNotifications(fileId, this.notificationFilter)
      );

      this.setNotifications(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch notifications");
      throw err;
    }
  };

  fetchMoreNotifications = async (fileId) => {
    try {
      this.notificationFilter.startIndex += this.notificationFilter.count;
      
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-more-notifications-${fileId}`,
        () => api.files.getNotifications(fileId, this.notificationFilter)
      );

      this.appendNotifications(fileId, response.data);
      return response.data;
    } catch (err) {
      this.notificationFilter.startIndex -= this.notificationFilter.count;
      this.rootStore.errorHandler.handleError(err, "Fetch more notifications");
      throw err;
    }
  };

  subscribeToNotifications = async (fileId, notificationTypes = []) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `subscribe-notifications-${fileId}`,
        () => api.files.subscribeToNotifications(fileId, notificationTypes)
      );

      this.setSubscription(fileId, {
        subscribed: true,
        types: notificationTypes
      });

      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Subscribe to notifications");
      throw err;
    }
  };

  unsubscribeFromNotifications = async (fileId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `unsubscribe-notifications-${fileId}`,
        () => api.files.unsubscribeFromNotifications(fileId)
      );

      this.setSubscription(fileId, {
        subscribed: false,
        types: []
      });
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Unsubscribe from notifications");
      throw err;
    }
  };

  markAsRead = async (fileId, notificationIds) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `mark-notifications-read-${fileId}`,
        () => api.files.markNotificationsAsRead(fileId, notificationIds)
      );

      this.updateNotificationsReadStatus(fileId, notificationIds, true);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Mark notifications as read");
      throw err;
    }
  };

  markAllAsRead = async (fileId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `mark-all-notifications-read-${fileId}`,
        () => api.files.markAllNotificationsAsRead(fileId)
      );

      const notifications = this.notifications.get(fileId) || [];
      const notificationIds = notifications.map(n => n.id);
      this.updateNotificationsReadStatus(fileId, notificationIds, true);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Mark all notifications as read");
      throw err;
    }
  };

  deleteNotifications = async (fileId, notificationIds) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `delete-notifications-${fileId}`,
        () => api.files.deleteNotifications(fileId, notificationIds)
      );

      this.removeNotifications(fileId, notificationIds);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete notifications");
      throw err;
    }
  };

  setNotifications = (fileId, notifications) => {
    this.notifications.set(fileId, notifications);
  };

  appendNotifications = (fileId, notifications) => {
    const currentNotifications = this.notifications.get(fileId) || [];
    this.notifications.set(fileId, [...currentNotifications, ...notifications]);
  };

  removeNotifications = (fileId, notificationIds) => {
    const notifications = this.notifications.get(fileId) || [];
    this.notifications.set(
      fileId,
      notifications.filter(n => !notificationIds.includes(n.id))
    );
  };

  updateNotificationsReadStatus = (fileId, notificationIds, isRead) => {
    const notifications = this.notifications.get(fileId) || [];
    this.notifications.set(
      fileId,
      notifications.map(n => 
        notificationIds.includes(n.id) ? { ...n, isRead } : n
      )
    );
  };

  setSubscription = (fileId, subscription) => {
    this.subscriptions.set(fileId, subscription);
  };

  getNotifications = (fileId) => {
    return this.notifications.get(fileId) || [];
  };

  getSubscription = (fileId) => {
    return this.subscriptions.get(fileId) || { subscribed: false, types: [] };
  };

  isSubscribed = (fileId) => {
    const subscription = this.subscriptions.get(fileId);
    return subscription?.subscribed || false;
  };

  get hasUnreadNotifications() {
    return Array.from(this.notifications.values()).some(
      notifications => notifications.some(n => !n.isRead)
    );
  }

  get unreadNotificationsCount() {
    return Array.from(this.notifications.values()).reduce(
      (count, notifications) => 
        count + notifications.filter(n => !n.isRead).length,
      0
    );
  }

  clearNotifications = (fileId) => {
    this.notifications.delete(fileId);
    this.subscriptions.delete(fileId);
  };

  clearAll = () => {
    this.notifications.clear();
    this.subscriptions.clear();
    this.notificationFilter = {
      startIndex: 0,
      count: 25,
      unreadOnly: false
    };
  };
}

export default NotificationManager;
