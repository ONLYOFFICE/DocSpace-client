import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class SecurityManager {
  permissions = new Map();
  accessRights = new Map();
  securityGroups = new Map();
  encryptionKeys = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Permission Management
  fetchPermissions = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-permissions",
        () => api.security.getPermissions(entityId)
      );
      this.setPermissions(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch permissions");
      throw err;
    }
  };

  updatePermissions = async (entityId, permissions) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-permissions",
        () => api.security.updatePermissions(entityId, permissions)
      );
      this.setPermissions(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update permissions");
      throw err;
    }
  };

  // Access Rights Management
  fetchAccessRights = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-access-rights",
        () => api.security.getAccessRights(entityId)
      );
      this.setAccessRights(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch access rights");
      throw err;
    }
  };

  updateAccessRights = async (entityId, rights) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-access-rights",
        () => api.security.updateAccessRights(entityId, rights)
      );
      this.setAccessRights(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update access rights");
      throw err;
    }
  };

  // Security Groups Management
  fetchSecurityGroups = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-security-groups",
        () => api.security.getSecurityGroups()
      );
      this.setSecurityGroups(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch security groups");
      throw err;
    }
  };

  createSecurityGroup = async (groupData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-security-group",
        () => api.security.createSecurityGroup(groupData)
      );
      this.addSecurityGroup(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create security group");
      throw err;
    }
  };

  updateSecurityGroup = async (groupId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-security-group",
        () => api.security.updateSecurityGroup(groupId, updates)
      );
      this.updateSecurityGroupInStore(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update security group");
      throw err;
    }
  };

  deleteSecurityGroup = async (groupId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-security-group",
        () => api.security.deleteSecurityGroup(groupId)
      );
      this.removeSecurityGroup(groupId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete security group");
      throw err;
    }
  };

  // Encryption Management
  fetchEncryptionKey = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-encryption-key",
        () => api.security.getEncryptionKey(entityId)
      );
      this.setEncryptionKey(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch encryption key");
      throw err;
    }
  };

  updateEncryptionKey = async (entityId, keyData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-encryption-key",
        () => api.security.updateEncryptionKey(entityId, keyData)
      );
      this.setEncryptionKey(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update encryption key");
      throw err;
    }
  };

  // Local state management
  setPermissions = (entityId, permissions) => {
    this.permissions.set(entityId, permissions);
  };

  setAccessRights = (entityId, rights) => {
    this.accessRights.set(entityId, rights);
  };

  setSecurityGroups = (groups) => {
    this.securityGroups.clear();
    groups.forEach(group => {
      this.securityGroups.set(group.id, group);
    });
  };

  addSecurityGroup = (group) => {
    this.securityGroups.set(group.id, group);
  };

  updateSecurityGroupInStore = (group) => {
    this.securityGroups.set(group.id, group);
  };

  removeSecurityGroup = (groupId) => {
    this.securityGroups.delete(groupId);
  };

  setEncryptionKey = (entityId, key) => {
    this.encryptionKeys.set(entityId, key);
  };

  // Access checks
  hasPermission = (entityId, permission) => {
    const entityPermissions = this.permissions.get(entityId);
    return entityPermissions?.includes(permission) || false;
  };

  hasAccessRight = (entityId, right) => {
    const entityRights = this.accessRights.get(entityId);
    return entityRights?.includes(right) || false;
  };

  // Computed values
  get securityGroupList() {
    return Array.from(this.securityGroups.values());
  }

  getEntityPermissions = (entityId) => {
    return this.permissions.get(entityId) || [];
  };

  getEntityAccessRights = (entityId) => {
    return this.accessRights.get(entityId) || [];
  };

  getSecurityGroup = (groupId) => {
    return this.securityGroups.get(groupId);
  };

  getEncryptionKey = (entityId) => {
    return this.encryptionKeys.get(entityId);
  };

  clearAll = () => {
    this.permissions.clear();
    this.accessRights.clear();
    this.securityGroups.clear();
    this.encryptionKeys.clear();
  };
}

export default SecurityManager;
