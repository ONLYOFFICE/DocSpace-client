import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class AuthManager {
  currentUser = null;
  isAuthenticated = false;
  authToken = null;
  permissions = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  initialize = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "init-auth",
        () => api.auth.getCurrentUser()
      );
      this.setCurrentUser(response.data);
      await this.fetchUserPermissions();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Initialize auth");
      throw err;
    }
  };

  login = async (credentials) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "login",
        () => api.auth.login(credentials)
      );
      this.setAuthToken(response.data.token);
      await this.initialize();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Login");
      throw err;
    }
  };

  logout = async () => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "logout",
        () => api.auth.logout()
      );
      this.clearAuth();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Logout");
      throw err;
    }
  };

  refreshToken = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "refresh-token",
        () => api.auth.refreshToken()
      );
      this.setAuthToken(response.data.token);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Refresh token");
      throw err;
    }
  };

  fetchUserPermissions = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-permissions",
        () => api.auth.getUserPermissions()
      );
      this.setPermissions(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch user permissions");
      throw err;
    }
  };

  setCurrentUser = (user) => {
    this.currentUser = user;
    this.isAuthenticated = !!user;
  };

  setAuthToken = (token) => {
    this.authToken = token;
    if (token) {
      api.setAuthToken(token);
    }
  };

  setPermissions = (permissions) => {
    this.permissions.clear();
    Object.entries(permissions).forEach(([key, value]) => {
      this.permissions.set(key, value);
    });
  };

  hasPermission = (permission) => {
    return this.permissions.get(permission) || false;
  };

  get userId() {
    return this.currentUser?.id;
  }

  get userEmail() {
    return this.currentUser?.email;
  }

  get userName() {
    return this.currentUser?.name;
  }

  get userRole() {
    return this.currentUser?.role;
  }

  clearAuth = () => {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.authToken = null;
    this.permissions.clear();
    api.clearAuthToken();
  };
}

export default AuthManager;
