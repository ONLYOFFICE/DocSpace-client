import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class PluginManager {
  plugins = new Map();
  activePlugins = new Set();
  pluginConfigs = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  registerPlugin = (pluginId, plugin) => {
    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already registered`);
    }

    this.plugins.set(pluginId, plugin);
    this.pluginConfigs.set(pluginId, plugin.defaultConfig || {});
  };

  unregisterPlugin = (pluginId) => {
    if (this.activePlugins.has(pluginId)) {
      this.deactivatePlugin(pluginId);
    }

    this.plugins.delete(pluginId);
    this.pluginConfigs.delete(pluginId);
  };

  activatePlugin = async (pluginId) => {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    try {
      await this.rootStore.loadingManager.withLoading(
        `activate-plugin-${pluginId}`,
        async () => {
          await plugin.activate?.(this.pluginConfigs.get(pluginId));
          this.activePlugins.add(pluginId);
        }
      );
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, `Activate plugin ${pluginId}`);
      throw err;
    }
  };

  deactivatePlugin = async (pluginId) => {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    try {
      await this.rootStore.loadingManager.withLoading(
        `deactivate-plugin-${pluginId}`,
        async () => {
          await plugin.deactivate?.();
          this.activePlugins.delete(pluginId);
        }
      );
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, `Deactivate plugin ${pluginId}`);
      throw err;
    }
  };

  updatePluginConfig = async (pluginId, config) => {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    try {
      await this.rootStore.loadingManager.withLoading(
        `update-plugin-config-${pluginId}`,
        async () => {
          const newConfig = { ...this.pluginConfigs.get(pluginId), ...config };
          await plugin.onConfigUpdate?.(newConfig);
          this.pluginConfigs.set(pluginId, newConfig);
        }
      );
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, `Update plugin config ${pluginId}`);
      throw err;
    }
  };

  getPlugin = (pluginId) => {
    return this.plugins.get(pluginId);
  };

  getPluginConfig = (pluginId) => {
    return this.pluginConfigs.get(pluginId);
  };

  isPluginActive = (pluginId) => {
    return this.activePlugins.has(pluginId);
  };

  get registeredPlugins() {
    return Array.from(this.plugins.keys());
  }

  get activePluginsList() {
    return Array.from(this.activePlugins);
  }

  clearPlugins = () => {
    this.activePlugins.forEach(pluginId => this.deactivatePlugin(pluginId));
    this.plugins.clear();
    this.activePlugins.clear();
    this.pluginConfigs.clear();
  };
}

export default PluginManager;
