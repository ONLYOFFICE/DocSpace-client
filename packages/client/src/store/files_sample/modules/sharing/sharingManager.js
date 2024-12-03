import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";
import { SHARE_ACCESS_RIGHTS } from "@docspace/shared/constants";

export class SharingManager {
  shareLinks = new Map();
  sharedWith = new Map();
  externalLinks = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchSharing = async (fileId) => {
    try {
      const [shareResponse, externalResponse] = await Promise.all([
        this.rootStore.loadingManager.withLoading(
          `fetch-sharing-${fileId}`,
          () => api.files.getSharing(fileId)
        ),
        this.rootStore.loadingManager.withLoading(
          `fetch-external-links-${fileId}`,
          () => api.files.getExternalLinks(fileId)
        )
      ]);

      this.setSharing(fileId, shareResponse.data);
      this.setExternalLinks(fileId, externalResponse.data);
      
      return {
        sharing: shareResponse.data,
        externalLinks: externalResponse.data
      };
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch sharing");
      throw err;
    }
  };

  shareWithUsers = async (fileId, users, accessRights = SHARE_ACCESS_RIGHTS.Read) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `share-with-users-${fileId}`,
        () => api.files.shareWithUsers(fileId, users, accessRights)
      );

      this.setSharing(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Share with users");
      throw err;
    }
  };

  removeUserAccess = async (fileId, userId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `remove-user-access-${fileId}`,
        () => api.files.removeUserAccess(fileId, userId)
      );

      this.setSharing(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove user access");
      throw err;
    }
  };

  updateUserAccess = async (fileId, userId, accessRights) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `update-user-access-${fileId}`,
        () => api.files.updateUserAccess(fileId, userId, accessRights)
      );

      this.setSharing(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update user access");
      throw err;
    }
  };

  createExternalLink = async (fileId, params) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `create-external-link-${fileId}`,
        () => api.files.createExternalLink(fileId, params)
      );

      this.addExternalLink(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create external link");
      throw err;
    }
  };

  removeExternalLink = async (fileId, linkId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        `remove-external-link-${fileId}`,
        () => api.files.removeExternalLink(fileId, linkId)
      );

      this.deleteExternalLink(fileId, linkId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove external link");
      throw err;
    }
  };

  updateExternalLink = async (fileId, linkId, params) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `update-external-link-${fileId}`,
        () => api.files.updateExternalLink(fileId, linkId, params)
      );

      this.updateExternalLinkData(fileId, linkId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update external link");
      throw err;
    }
  };

  setSharing = (fileId, sharing) => {
    this.shareLinks.set(fileId, sharing.shareLink);
    this.sharedWith.set(fileId, sharing.users);
  };

  setExternalLinks = (fileId, links) => {
    this.externalLinks.set(fileId, links);
  };

  addExternalLink = (fileId, link) => {
    const links = this.externalLinks.get(fileId) || [];
    this.externalLinks.set(fileId, [...links, link]);
  };

  deleteExternalLink = (fileId, linkId) => {
    const links = this.externalLinks.get(fileId) || [];
    this.externalLinks.set(
      fileId,
      links.filter(link => link.id !== linkId)
    );
  };

  updateExternalLinkData = (fileId, linkId, updatedLink) => {
    const links = this.externalLinks.get(fileId) || [];
    this.externalLinks.set(
      fileId,
      links.map(link => link.id === linkId ? updatedLink : link)
    );
  };

  getSharing = (fileId) => {
    return {
      shareLink: this.shareLinks.get(fileId),
      users: this.sharedWith.get(fileId) || []
    };
  };

  getExternalLinks = (fileId) => {
    return this.externalLinks.get(fileId) || [];
  };

  clearSharing = (fileId) => {
    this.shareLinks.delete(fileId);
    this.sharedWith.delete(fileId);
    this.externalLinks.delete(fileId);
  };

  clearAll = () => {
    this.shareLinks.clear();
    this.sharedWith.clear();
    this.externalLinks.clear();
  };
}

export default SharingManager;
