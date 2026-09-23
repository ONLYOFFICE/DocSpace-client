/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { makeAutoObservable, observable, runInAction } from "mobx";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";

import type React from "react";
import type {
  PluginRuntime,
  TCurrentFile,
} from "@onlyoffice/docspace-plugin-sdk/react";
import { Actions } from "@onlyoffice/docspace-plugin-sdk";
import type {
  ButtonGroup,
  IModalDialog,
  TSelector,
  IMediaViewer,
  IFloatingOperationsButton,
} from "@onlyoffice/docspace-plugin-sdk";

import api from "@docspace/shared/api";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TData, toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type {
  TFile,
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";

import type { TTranslation } from "@docspace/shared/types";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import SocketHelper, {
  SocketEvents,
  TChangeWebPluginData,
  SocketCommands,
} from "@onlyoffice/apps-ui-kit/utils/socket";

import defaultConfig from "PUBLIC_DIR/scripts/config.json";

import type {
  IFloatingOperationsButtonClient,
  IContextMenuItem,
  IContextMenuItemClient,
  IContextMenuItemValidation,
  IEventListenerItem,
  IEventListenerItemClient,
  IFileItem,
  IFileItemClient,
  IInfoPanelItem,
  IInfoPanelItemClient,
  IMainButtonItem,
  IMainButtonItemClient,
  IMessage,
  IProfileMenuItem,
  IProfileMenuItemClient,
  IArticleButtonItem,
  IArticleButtonItemClient,
  IArticleNavigationItem,
  IArticleNavigationItemClient,
  IframeWindow,
  TPlugin,
  TPluginError,
  IPostMessageCallbackMessage,
  IMediaViewerClient,
  IModalDialogClient,
  TMessageActionsParams,
} from "SRC_DIR/helpers/plugins/types";

import { getPluginUrl, messageActions } from "../helpers/plugins/utils";
import { PluginLoadError, toPluginError } from "../helpers/plugins/errors";
import { matchesUserRole } from "../helpers/plugins/roles";
import { createPluginApi } from "../helpers/plugins/react/api";
import { toCurrentUser } from "../helpers/plugins/react/utils";
import {
  PluginFileType,
  PluginScopes,
  PluginUserRole,
  PluginStatus,
  type PluginDevices,
} from "../helpers/plugins/enums";

import type SelectedFolderStore from "./SelectedFolderStore";
import type { TSelectorProps } from "SRC_DIR/components/PluginSelector/types";
import { TUser } from "@docspace/shared/api/people/types";

const { api: apiConf, proxy: proxyConf } = defaultConfig;
const { origin: apiOrigin, prefix: apiPrefix } = apiConf;
const { url: proxyURL } = proxyConf;

const origin =
  window.ClientConfig?.api?.origin || apiOrigin || window.location.origin;
const proxy = window.ClientConfig?.proxy?.url || proxyURL;
const prefix = window.ClientConfig?.api?.prefix || apiPrefix;

// One client for every plugin: it holds no per-plugin state, and a plugin that
// lists `api` in a dependency array must not see a new object on every render.
const pluginApi = createPluginApi();

type TDispatchMessage = Pick<
  TMessageActionsParams,
  | "pluginName"
  | "setElementProps"
  | "updateCreateDialogProps"
  | "updatePropsContext"
> & {
  message: IMessage | void;
  currentFile?: TCurrentFile | null;
};

class PluginStore {
  private settingsStore: SettingsStore = {} as SettingsStore;

  private selectedFolderStore: SelectedFolderStore = {} as SelectedFolderStore;

  private userStore: UserStore = {} as UserStore;

  private currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  plugins: TPlugin[] = [];

  contextMenuItems: Map<string, IContextMenuItemClient> = new Map();

  infoPanelItems: Map<string, IInfoPanelItemClient> = new Map();

  mainButtonItems: Map<string, IMainButtonItemClient> = new Map();

  profileMenuItems: Map<string, IProfileMenuItemClient> = new Map();

  eventListenerItems: Map<string, IEventListenerItemClient> = new Map();

  fileItems: Map<string, IFileItemClient> = new Map();

  articleButtonItems: Map<string, IArticleButtonItemClient> = new Map();

  articleNavigationItems: Map<string, IArticleNavigationItemClient> = new Map();

  pluginFrame: HTMLIFrameElement | null = null;

  isInit = false;

  isLoaded = false;

  settingsPluginDialogVisible = false;

  currentSettingsDialogPlugin: null | { pluginName: string } = null;

  pluginDialogVisible = false;

  pluginSelectorVisible = false;

  pluginFloatingOperationsButtons: Map<
    string,
    IFloatingOperationsButtonClient
  > = new Map();

  pluginDialogProps: null | IModalDialogClient = null;

  pluginSelectorProps: null | TSelectorProps = null;

  deletePluginDialogVisible = false;

  deletePluginDialogProps: null | { pluginName: string } = null;

  isEmptyList = false;

  needPageReload = false;

  pluginMediaViewerVisible = false;

  pluginMediaViewerProps: null | IMediaViewerClient = null;

  reactSettingsSaveButtonState: null | {
    pluginName: string;
    button: ButtonGroup;
  } = null;

  reactPluginModalState: null | {
    pluginName: string;
    component: React.ComponentType<object>;
    options?: Omit<Partial<IModalDialog>, "dialogBodyComponent">;
    currentFile: TCurrentFile | null;
  } = null;

  constructor(
    settingsStore: SettingsStore,
    selectedFolderStore: SelectedFolderStore,
    userStore: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
  ) {
    this.settingsStore = settingsStore;
    this.selectedFolderStore = selectedFolderStore;
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;

    makeAutoObservable(this, {
      reactPluginModalState: observable.ref,
      reactSettingsSaveButtonState: observable.ref,
    });

    // Subscribe to plugin state changes via WebSocket
    this.wsChangeWebPlugin();
  }

  wsChangeWebPlugin = () => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "change-web-plugin",
    });

    SocketHelper?.on(
      SocketEvents.ChangeWebPlugin,
      this.handlePluginStateChange,
    );
  };

  handlePluginStateChange = (data: TChangeWebPluginData) => {
    const { webPluginName, enabled } = data;

    const plugin = this.plugins.find((p) => p.name === webPluginName);

    if (!plugin || plugin.enabled === enabled) return;

    return enabled
      ? this.activatePlugin(webPluginName)
      : this.deactivatePlugin(webPluginName);
  };

  dispatchMessage = ({
    message,
    pluginName,
    setElementProps,
    updateCreateDialogProps,
    updatePropsContext,
    currentFile,
  }: TDispatchMessage) => {
    if (!message) return;

    messageActions({
      message,
      pluginName,
      setElementProps,
      setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
      updatePluginStatus: this.updatePluginStatus,
      updatePropsContext: updatePropsContext,
      setPluginDialogVisible: this.setPluginDialogVisible,
      setPluginDialogProps: this.setPluginDialogProps,
      updateContextMenuItems: this.updateContextMenuItems,
      updateInfoPanelItems: this.updateInfoPanelItems,
      updateMainButtonItems: this.updateMainButtonItems,
      updateProfileMenuItems: this.updateProfileMenuItems,
      updateEventListenerItems: this.updateEventListenerItems,
      updateArticleButtonItems: this.updateArticleButtonItems,
      updateArticleNavigationItems: this.updateArticleNavigationItems,
      updateFileItems: this.updateFileItems,
      updateCreateDialogProps: updateCreateDialogProps,
      updatePlugin: this.updatePlugin,
      setPluginSelectorVisible: this.setPluginSelectorVisible,
      setPluginSelectorProps: this.setPluginSelectorProps,
      addPluginFloatingOperations: this.addPluginFloatingOperations,
      removePluginFloatingOperations: this.removePluginFloatingOperations,
      updatePluginFloatingOperations: this.updatePluginFloatingOperations,
      setPluginMediaViewerVisible: this.setPluginMediaViewerVisible,
      setPluginMediaViewerProps: this.setPluginMediaViewerProps,
      setReactPluginModalState: this.setReactPluginModalState,
      reactPluginCurrentFile: currentFile,
    });
  };

  setReactPluginModalState = (
    value: PluginStore["reactPluginModalState"],
  ): void => {
    this.reactPluginModalState = value;
  };

  setReactSettingsSaveButtonState = (
    pluginName: string,
    button: ButtonGroup | null,
  ): void => {
    this.reactSettingsSaveButtonState = button ? { pluginName, button } : null;
  };

  setNeedPageReload = (value: boolean) => {
    this.needPageReload = value;
  };

  setIsEmptyList = (value: boolean) => {
    this.isEmptyList = value;
  };

  setCurrentSettingsDialogPlugin = (value: null | { pluginName: string }) => {
    this.currentSettingsDialogPlugin = value;
    this.reactSettingsSaveButtonState = null;
  };

  setSettingsPluginDialogVisible = (value: boolean) => {
    this.settingsPluginDialogVisible = value;
  };

  setPluginDialogVisible = (value: boolean) => {
    this.pluginDialogVisible = value;
  };

  setPluginSelectorVisible = (value: boolean) => {
    this.pluginSelectorVisible = value;
  };

  setPluginSelectorProps = (value: null | TSelectorProps) => {
    this.pluginSelectorProps = value;
  };

  setPluginDialogProps = (value: null | IModalDialogClient) => {
    this.pluginDialogProps = value;
  };

  setDeletePluginDialogVisible = (value: boolean) => {
    this.deletePluginDialogVisible = value;
  };

  setDeletePluginDialogProps = (value: null | { pluginName: string }) => {
    this.deletePluginDialogProps = value;
  };

  addPluginFloatingOperations = (value: IFloatingOperationsButtonClient) => {
    if (this.pluginFloatingOperationsButtons.has(value.id)) return;
    this.pluginFloatingOperationsButtons.set(value.id, value);
  };

  updatePluginFloatingOperations = (value: IFloatingOperationsButtonClient) => {
    if (!this.pluginFloatingOperationsButtons.has(value.id)) return;
    this.pluginFloatingOperationsButtons.set(value.id, value);
  };

  removePluginFloatingOperations = (id: string) => {
    this.pluginFloatingOperationsButtons.delete(id);
  };

  setPluginMediaViewerVisible = (value: boolean) => {
    this.pluginMediaViewerVisible = value;
  };

  setPluginMediaViewerProps = (value: null | IMediaViewerClient) => {
    this.pluginMediaViewerProps = value;
  };

  get isNotPaidPeriod() {
    return this.currentTariffStatusStore?.isNotPaidPeriod;
  }

  get pluginFloatingOperationsArray(): IFloatingOperationsButtonClient[] {
    return Array.from(this.pluginFloatingOperationsButtons.values());
  }

  updatePluginStatus = (name: string) => {
    const pluginIdx = this.plugins.findIndex((p) => p.name === name);

    if (pluginIdx === -1) return;

    const plugin = this.plugins[pluginIdx];

    // A plugin that reports no status of its own is always shown.
    const newStatus = plugin.getStatus?.() || PluginStatus.active;

    plugin.status = newStatus;

    if (!plugin.enabled) return;

    if (newStatus === PluginStatus.active) {
      this.installPluginCss(plugin);
      this.registerPluginItems(plugin);

      return;
    }

    this.uninstallPluginCss(plugin);
    this.unregisterPluginItems(plugin);
  };

  setPluginFrame = (frame: HTMLIFrameElement) => {
    this.pluginFrame = frame;

    const iWindow = this.pluginFrame?.contentWindow as IframeWindow;

    if (this.pluginFrame && iWindow) iWindow.Plugins = {};
  };

  setIsInit = (isInit: boolean) => {
    this.isInit = isInit;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  initPlugins = async () => {
    if (this.isNotPaidPeriod) {
      this.setIsLoaded(true);
      return;
    }

    const frame = document.createElement("iframe");
    frame.id = "plugin-iframe";
    frame.width = "0px";
    frame.height = "0px";
    frame.style.display = "none";
    // frame.sandbox = "allow-same-origin allow-scripts";

    document.body.appendChild(frame);

    this.setPluginFrame(frame);

    this.updatePlugins(true);

    this.setIsInit(true);
  };

  updatePlugins = async (fromList?: boolean) => {
    if (this.isNotPaidPeriod) {
      this.setIsLoaded(true);
      return;
    }

    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      this.plugins = [];

      const plugins = await api.plugins.getPlugins(
        null,
        abortController.signal,
      );

      this.setIsEmptyList(plugins.length === 0);
      await Promise.allSettled(
        plugins.map((plugin) =>
          plugin.runtime === "module"
            ? this.initModulePlugin(plugin)
            : this.initPlugin(plugin, undefined, fromList),
        ),
      );
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      console.log(e);
    } finally {
      this.setIsLoaded(true);
    }
  };

  checkPluginCompatibility = (minDocSpaceVersion?: string): boolean => {
    if (!minDocSpaceVersion) return false;

    const currentDocspaceVersion = this.settingsStore.buildVersionInfo.docspace;

    const parts1 = minDocSpaceVersion.split(".").map(Number);
    const parts2 = currentDocspaceVersion.split(".").map(Number);

    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
      const num1 = parts1[i] ?? 0;
      const num2 = parts2[i] ?? 0;

      if (num1 < num2) return true;
      if (num1 > num2) return false;
    }

    return true;
  };

  checkPluginCacheWarning = (plugin: TAPIPlugin) => {
    return this.plugins.some(
      (p) => p.name === plugin.name && p.version === plugin.version,
    );
  };

  addPlugin = async (data: FormData) => {
    try {
      const plugin = await api.plugins.addPlugin(data);

      const isPluginCompatible = this.checkPluginCompatibility(
        plugin.minDocSpaceVersion,
      );

      const isPluginInCache = this.checkPluginCacheWarning(plugin);

      this.setNeedPageReload(true);

      let thrownInitError: TPluginError | undefined;

      try {
        if (plugin.runtime === "module") {
          await this.initModulePlugin(plugin);
        } else {
          await this.initPlugin(plugin);
        }
      } catch (e) {
        console.error(
          `[Plugin: ${plugin.name}] Plugin initialization failed:`,
          e,
        );

        thrownInitError = toPluginError(e);
      }

      const storedPlugin = this.plugins.find((p) => p.name === plugin.name);

      return {
        isPluginCompatible,
        isPluginInCache,
        loadError: storedPlugin?.loadError,
        initError: storedPlugin?.initError ?? thrownInitError,
      };
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  uninstallPlugin = async (name: string, t: TTranslation) => {
    const pluginIdx = this.plugins.findIndex((p) => p.name === name);

    try {
      await api.plugins.deletePlugin(name);

      this.deactivatePlugin(name);

      if (pluginIdx !== -1) {
        runInAction(() => {
          this.plugins.splice(pluginIdx, 1);

          if (this.plugins.length === 0) this.setIsEmptyList(true);
        });
      }
      toastr.success(t("PluginDeletedSuccessfully"));
    } catch (e) {
      toastr.error(e as TData);
      console.log(e);
    }
  };

  initLocalePlugin = (plugin: TPlugin) => {
    const culture = this.settingsStore.culture;
    const currentLanguage = (getCookie(LANGUAGE) || culture) as string;
    plugin.setLanguage?.(currentLanguage);

    const language = plugin.getLanguage?.() ?? currentLanguage;

    plugin.nameLocale = plugin.nameLocaleMap?.[language] || plugin.name;

    plugin.descriptionLocale =
      plugin.descriptionLocaleMap?.[language] ||
      plugin.description;
  };

  initPlugin = (
    plugin: TAPIPlugin,
    callback?: (plugin: TPlugin) => void,
    fromList?: boolean,
  ) => {
    if (!plugin.enabled && !fromList) return;

    return new Promise((resolve, reject) => {
      const iWindow = this.pluginFrame?.contentWindow as
        IframeWindow | undefined;
      const scriptUrl = new URL(plugin.url, window.location.href).href;

      let scriptError: unknown;

      const onScriptError = (event: ErrorEvent) => {
        if (event.filename !== scriptUrl) return;

        scriptError =
          event.error instanceof Error ? event.error : new Error(event.message);
      };

      if (iWindow?.Plugins) delete iWindow.Plugins[plugin.pluginName];

      iWindow?.addEventListener?.("error", onScriptError);

      const stopListening = () =>
        iWindow?.removeEventListener?.("error", onScriptError);

      const onLoad = async () => {
        stopListening();

        const registered = iWindow?.Plugins?.[plugin.pluginName];

        if (!registered) {
          const error: TPluginError = scriptError
            ? toPluginError(scriptError)
            : { kind: "unregistered", pluginName: plugin.pluginName };

          console.error(
            `[Plugin: ${plugin.name}] Failed to load plugin:`,
            scriptError ?? error,
          );

          resolve(this.installBrokenPlugin(plugin, error));
          return;
        }

        try {
          const newPlugin: TPlugin = cloneDeep({
            ...plugin,
            nameLocaleMap: plugin.nameLocale,
            descriptionLocaleMap: plugin.descriptionLocale,
            ...registered,
            nameLocale: plugin.name,
            descriptionLocale: plugin.description,
          });

          newPlugin.scopes =
            typeof newPlugin.scopes === "string"
              ? (newPlugin.scopes.split(",") as PluginScopes[])
              : newPlugin.scopes;

          newPlugin.iconUrl = getPluginUrl(newPlugin.url, "");

          newPlugin.compatible = this.checkPluginCompatibility(
            plugin.minDocSpaceVersion,
          );

          const storedPlugin = await this.runPluginInit(
            newPlugin,
            plugin.settings || null,
          );

          callback?.(storedPlugin);
          resolve(storedPlugin);
        } catch (error) {
          console.error(
            `[Plugin: ${plugin.name}] Plugin initialization failed:`,
            error,
          );

          this.setInitError(plugin.name, toPluginError(error));

          reject(error);
        }
      };

      const onError = () => {
        stopListening();

        const error: TPluginError = { kind: "script", url: plugin.url };

        console.error(`[Plugin: ${plugin.name}] Failed to load plugin:`, error);

        resolve(this.installBrokenPlugin(plugin, error));
      };

      const frameDoc = this.pluginFrame?.contentDocument;
      const script = frameDoc?.createElement("script");

      if (script) {
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", `${plugin.name}`);

        script.onload = onLoad.bind(this);
        script.onerror = onError.bind(this);

        script.src = plugin.url;
        script.async = true;

        frameDoc?.body.appendChild(script);
      } else {
        stopListening();

        reject(new Error("Failed to create script element"));
      }
    });
  };

  installPluginCss = async (plugin: TPlugin) => {
    if (!plugin.cssUrl) return;

    const linkId = `plugin-styles-${plugin.pluginName}`;
    const existingLink = document.getElementById(linkId) as HTMLLinkElement;

    if (existingLink) {
      // update existing link
      existingLink.href = plugin.cssUrl;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = plugin.cssUrl;
    link.id = linkId;
    document.head.appendChild(link);
  };

  uninstallPluginCss = (plugin: TPlugin) => {
    const linkId = `plugin-styles-${plugin.pluginName}`;
    const link = document.getElementById(linkId) as HTMLLinkElement;

    if (link) {
      link.remove();
    }
  };

  /** Publishes every item the plugin's scopes provide to the portal. */
  private registerPluginItems = (plugin: TPlugin) => {
    const { name, scopes } = plugin;

    if (scopes.includes(PluginScopes.ContextMenu)) {
      this.updateContextMenuItems(name);
    }

    if (scopes.includes(PluginScopes.InfoPanel)) {
      this.updateInfoPanelItems(name);
    }

    if (scopes.includes(PluginScopes.MainButton)) {
      this.updateMainButtonItems(name);
    }

    if (scopes.includes(PluginScopes.ProfileMenu)) {
      this.updateProfileMenuItems(name);
    }

    if (scopes.includes(PluginScopes.EventListener)) {
      this.updateEventListenerItems(name);
    }

    if (scopes.includes(PluginScopes.File)) {
      this.updateFileItems(name);
    }

    if (scopes.includes(PluginScopes.ArticleButton)) {
      this.updateArticleButtonItems(name);
    }

    if (scopes.includes(PluginScopes.ArticleNavigation)) {
      this.updateArticleNavigationItems(name);
    }
  };

  /** Takes back everything `registerPluginItems` published. */
  private unregisterPluginItems = (plugin: TPlugin) => {
    const { scopes } = plugin;

    if (scopes.includes(PluginScopes.ContextMenu)) {
      this.deactivateContextMenuItems(plugin);
    }

    if (scopes.includes(PluginScopes.InfoPanel)) {
      this.deactivateInfoPanelItems(plugin);
    }

    if (scopes.includes(PluginScopes.ProfileMenu)) {
      this.deactivateProfileMenuItems(plugin);
    }

    if (scopes.includes(PluginScopes.MainButton)) {
      this.deactivateMainButtonItems(plugin);
    }

    if (scopes.includes(PluginScopes.EventListener)) {
      this.deactivateEventListenerItems(plugin);
    }

    if (scopes.includes(PluginScopes.File)) {
      this.deactivateFileItems(plugin);
    }

    if (scopes.includes(PluginScopes.ArticleButton)) {
      this.deactivateArticleButtonItems(plugin);
    }

    if (scopes.includes(PluginScopes.ArticleNavigation)) {
      this.deactivateArticleNavigationItems(plugin);
    }
  };

  private addToPluginList = (plugin: TPlugin) => {
    const idx = this.plugins.findIndex((p) => p.name === plugin.name);

    if (idx === -1) {
      runInAction(() => {
        this.plugins = [plugin, ...this.plugins];
      });

      this.setIsEmptyList(false);

      return this.plugins[0];
    }

    runInAction(() => {
      this.plugins[idx] = plugin;
    });

    return this.plugins[idx];
  };

  private setInitError = (
    name: string,
    initError: TPluginError | undefined,
  ) => {
    const idx = this.plugins.findIndex((p) => p.name === name);

    if (idx === -1) return;

    runInAction(() => {
      this.plugins[idx].initError = initError;
      this.plugins.splice(idx, 1, this.plugins[idx]);
    });
  };

  private installBrokenPlugin = (plugin: TAPIPlugin, error: TPluginError) => {
    const scopes =
      typeof plugin.scopes === "string"
        ? (plugin.scopes.split(",") as PluginScopes[])
        : plugin.scopes;

    const brokenPlugin = {
      ...plugin,
      nameLocaleMap: plugin.nameLocale,
      descriptionLocaleMap: plugin.descriptionLocale,
      scopes,
      iconUrl: getPluginUrl(plugin.url, ""),
      compatible: this.checkPluginCompatibility(plugin.minDocSpaceVersion),
      loadError: error,
    } as unknown as TPlugin;

    const previous = this.plugins.find((p) => p.name === plugin.name);

    if (previous) {
      try {
        this.uninstallPluginCss(previous);
        this.unregisterPluginItems(previous);
      } catch (e) {
        console.error(`[Plugin: ${plugin.name}] Failed to unregister:`, e);
      }
    }

    this.initLocalePlugin(brokenPlugin);

    return this.addToPluginList(brokenPlugin);
  };

  private runPluginInit = async (
    plugin: TPlugin,
    settings: string | null,
    addToList = true,
  ) => {
    const storedPlugin = addToList ? this.addToPluginList(plugin) : plugin;

    this.initLocalePlugin(storedPlugin);

    await this.installPlugin(storedPlugin);

    if (storedPlugin.loadError) return storedPlugin;

    if (storedPlugin.scopes.includes(PluginScopes.Settings)) {
      storedPlugin.setAdminPluginSettingsValue?.(settings);
      this.updatePluginStatus(storedPlugin.name);
    }

    return storedPlugin;
  };

  installPlugin = async (plugin: TPlugin) => {
    if (!plugin || !plugin.enabled || plugin.loadError) return;

    if (plugin.scopes.includes(PluginScopes.API)) {
      plugin.setAPI?.(origin, proxy, prefix);
    }

    const { name } = plugin;

    if (plugin.onLoadCallback) {
      await plugin.onLoadCallback();

      this.updatePluginStatus(name);
    }

    if (plugin.status === PluginStatus.hide) return;

    this.installPluginCss(plugin);

    this.registerPluginItems(plugin);

    if (plugin.scopes.includes(PluginScopes.PostMessage)) {
      this.initPostMessagePlugin(plugin);
    }
  };

  updatePlugin = async (
    name: string,
    status: boolean | null,
    settings?: string | null,
    t?: TTranslation,
  ) => {
    try {
      const oldPlugin = this.pluginList.find((p) => p.name === name);

      const currentSettings = settings ?? oldPlugin?.settings ?? "";

      const currentStatus =
        typeof status === "boolean" ? status : (oldPlugin?.enabled ?? false);

      const plugin = await api.plugins.updatePlugin(
        name,
        currentStatus,
        currentSettings,
      );

      if (oldPlugin)
        runInAction(() => {
          oldPlugin.settings = currentSettings;
        });

      if (typeof status !== "boolean") return plugin;

      if (status) {
        if (t) toastr.success(t("Common:PluginEnabled"));
        this.activatePlugin(name);
      } else {
        if (t) toastr.success(t("Common:PluginDisabled"));
        this.deactivatePlugin(name);
      }

      return plugin;
    } catch (e) {
      toastr.error(e as TData);
      console.log(e);
    }
  };

  activatePlugin = async (name: string) => {
    const idx = this.plugins.findIndex((p) => p.name === name);

    if (idx === -1) return;

    runInAction(() => {
      this.plugins[idx].enabled = true;
      this.plugins.splice(idx, 1, this.plugins[idx]);
    });

    this.setNeedPageReload(true);

    const plugin = this.plugins[idx];

    try {
      await this.runPluginInit(plugin, plugin.settings || null, false);

      this.setInitError(name, undefined);
    } catch (e) {
      console.error(`[Plugin: ${name}] Plugin initialization failed:`, e);

      this.setInitError(name, toPluginError(e));
    }
  };

  deactivatePlugin = async (name: string) => {
    const idx = this.plugins.findIndex((p) => p.name === name);

    if (idx === -1) return;

    runInAction(() => {
      this.plugins[idx].enabled = false;
      this.plugins.splice(idx, 1, this.plugins[idx]);
    });

    const plugin = this.plugins[idx];

    this.uninstallPluginCss(plugin);

    this.unregisterPluginItems(plugin);
  };

  getUserRole = () => {
    const { user } = this.userStore;

    if (!user) return PluginUserRole.guest;

    const { isOwner, isAdmin, isCollaborator, isVisitor } = user;

    const userRole = isOwner
      ? PluginUserRole.owner
      : isAdmin
        ? PluginUserRole.fullAdmin
        : isCollaborator
          ? PluginUserRole.user
          : isVisitor
            ? PluginUserRole.guest
            : PluginUserRole.roomAdmin;

    return userRole;
  };

  getCurrentDevice = () => {
    const currentDeviceType = this.settingsStore.currentDeviceType as unknown;

    return currentDeviceType as PluginDevices;
  };

  getValidContextMenuItemKeys = (
    item: IContextMenuItemClient,
    ctx: IContextMenuItemValidation,
  ) => {
    const keys: string[] = [];
    const { type, fileExst, userRole, device, security, itemSecurity, itemId } =
      ctx;

    if (type && item.fileType && !item.fileType.includes(type)) return;

    if (fileExst && item.fileExt && !item.fileExt.includes(fileExst)) return;

    if (userRole && !matchesUserRole(item.usersTypes, userRole)) return;

    if (device && item.devices && !item.devices.includes(device)) return;

    if (
      security &&
      item.security &&
      !item.security.every((key) => security[key as keyof typeof security])
    )
      return;

    if (
      itemSecurity &&
      item.itemSecurity &&
      !item.itemSecurity.every(
        (key) => itemSecurity[key as keyof typeof itemSecurity],
      )
    )
      return;

    if (itemId !== undefined && item.itemId && !item.itemId.includes(itemId))
      return;

    if (item.items && item.items.length > 0) {
      item.items.forEach((subItem) => {
        const validContextMenuItemKeys = this.getValidContextMenuItemKeys(
          subItem,
          ctx,
        );

        validContextMenuItemKeys &&
          keys.push(item.key, ...validContextMenuItemKeys);
      });
    } else {
      keys.push(item.key);
    }

    return Array.from(new Set(keys));
  };

  getContextMenuKeysByType = (
    type: PluginFileType,
    fileExst?: string | null,
    security?:
      | TRoomSecurity
      | TFolderSecurity
      | Partial<TRoomSecurity & TFolderSecurity>
      | null,
    itemSecurity?:
      | TFileSecurity
      | TRoomSecurity
      | TFolderSecurity
      | Partial<TFileSecurity & TRoomSecurity & TFolderSecurity>,
    itemId?: number | string,
  ) => {
    if (this.contextMenuItems.size === 0) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const items = Array.from(this.contextMenuItems.values());
    const keys: string[] = [];

    switch (type) {
      case PluginFileType.file:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            fileExst,
            userRole,
            device,
            security,
            itemSecurity,
            itemId,
          });

          if (validKeys) keys.push(...validKeys);
        });

        break;
      case PluginFileType.folder:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            itemSecurity,
            itemId,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.room:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            itemSecurity,
            itemId,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.image:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            fileExst,
            security,
            itemSecurity,
            itemId,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.video:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            fileExst,
            itemSecurity,
            itemId,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      default:
    }

    if (keys.length === 0) return null;

    return keys;
  };

  getPluginIconUrl = (pluginName: string, icon: string) => {
    const plugin = this.plugins.find((p) => p.name === pluginName);

    if (!plugin) return;

    return `${plugin.iconUrl}/assets/${icon}?hash=${plugin.version}`;
  };

  /** Drops this plugin's items that the finished `update*Items` pass did not produce. */
  private removeMissingItems = <T extends { pluginName: string }>(
    items: Map<string, T>,
    pluginName: string,
    actualKeys: Set<string>,
  ) => {
    Array.from(items).forEach(([key, value]) => {
      if (value.pluginName === pluginName && !actualKeys.has(key)) {
        items.delete(key);
      }
    });
  };

  updateContextMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IContextMenuItem> | undefined =
      plugin.getContextMenuItems?.();

    if (!items) return;

    const maxDepth = 2;
    let currentDepth = 1;

    // Helper function to recursively process context menu items
    const processContextMenuItem = (
      value: IContextMenuItem,
    ): IContextMenuItemClient => {
      const onClick: IContextMenuItemClient["onClick"] = async (fileId) => {
        // Support both new onItemClick and deprecated onClick for backward compatibility
        const onClickCallback = value.onItemClick || value.onClick;

        if (!onClickCallback || value.items) return;

        let message: IMessage | void;

        if (value.onItemClick) {
          message = await value.onItemClick(fileId);
        } else {
          message = await value.onClick?.(fileId as number);
        }

        this.dispatchMessage({ message, pluginName: plugin.name });
      };

      const onGroupClick: IContextMenuItemClient["onGroupClick"] = async (
        items,
      ) => {
        if (!value.onGroupClick || !value.isGroupAction || value.items) return;

        const message = await value.onGroupClick(items);

        this.dispatchMessage({ message, pluginName: plugin.name });
      };

      const { items, ...rest } = value;

      // Create processed result object
      const processedItem: IContextMenuItemClient = {
        ...rest,
        onClick,
        onGroupClick,
        pluginName: plugin.name,
        icon: `${plugin.iconUrl}/assets/${value.icon}?hash=${plugin.version}`,
      };

      // Recursively process nested items if they exist
      if (items && items.length > 0 && currentDepth < maxDepth) {
        processedItem.items = items.map((nestedItem) => {
          return processContextMenuItem(nestedItem);
        });
        currentDepth += 1;
      }

      return processedItem;
    };

    const actualKeys = new Set<string>();

    // Process all top-level items
    Array.from(items).forEach(([key, value]: [string, IContextMenuItem]) => {
      const contextMenuItem = processContextMenuItem(value);
      this.contextMenuItems.set(key, contextMenuItem);
      actualKeys.add(key);
      currentDepth = 1;
    });

    this.removeMissingItems(this.contextMenuItems, plugin.name, actualKeys);
  };

  deactivateContextMenuItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IContextMenuItem> | undefined =
      plugin.getContextMenuItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]: [string, IContextMenuItem]) => {
      this.contextMenuItems.delete(key);
    });
  };

  updateInfoPanelItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IInfoPanelItem> | undefined =
      plugin.getInfoPanelItems?.();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualKeys = new Set<string>();

    Array.from(items).forEach(([key, value]: [string, IInfoPanelItem]) => {
      const correctUserType = matchesUserRole(value.usersTypes, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const onClick = async (id: number) => {
        if (!value.subMenu?.onClick) return;

        const message = await value.subMenu.onClick(id);

        this.dispatchMessage({ message, pluginName: plugin.name });

        return message;
      };

      this.infoPanelItems.set(key, {
        ...value,
        isHeaderVisible: value.isHeaderVisible ?? true,
        subMenu: { ...value.subMenu, onClick },
        pluginName: plugin.name,
      });
      actualKeys.add(key);
    });

    this.removeMissingItems(this.infoPanelItems, plugin.name, actualKeys);
  };

  deactivateInfoPanelItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IInfoPanelItem> | undefined =
      plugin.getInfoPanelItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.infoPanelItems.delete(key);
    });
  };

  updateMainButtonItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IMainButtonItem> | undefined =
      plugin.getMainButtonItems?.();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualKeys = new Set<string>();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = matchesUserRole(value.usersType, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const newItems: IMainButtonItemClient[] = [];

      const createMainButtonClickHandler = (
        item: IMainButtonItem,
        pluginName: string,
      ) => {
        return async () => {
          const storeId = this.selectedFolderStore.id;
          // Support both new onItemClick and deprecated onClick for backward compatibility
          const onClickCallback = item.onItemClick || item.onClick;

          if (!onClickCallback) return;

          if (!storeId) return;

          let message: IMessage | void;

          if (item.onItemClick) {
            message = await item.onItemClick(storeId);
          } else {
            message = await item.onClick?.(storeId as number);
          }

          this.dispatchMessage({ message, pluginName });
        };
      };

      const storeId = this.selectedFolderStore.id;

      if (value.items && storeId) {
        value.items.forEach((i) => {
          const onClick = createMainButtonClickHandler(i, plugin.name);

          const { items: _, ...rest } = i;

          newItems.push({
            ...rest,
            onClick,
            icon: `${plugin.iconUrl}/assets/${i.icon}?hash=${plugin.version}`,
            pluginName: plugin.name,
          });
        });
      }

      const onClick = createMainButtonClickHandler(value, plugin.name);

      this.mainButtonItems.set(key, {
        ...value,
        onClick,
        pluginName: plugin.name,
        icon: `${plugin.iconUrl}/assets/${value.icon}?hash=${plugin.version}`,
        items: newItems.length > 0 ? newItems : undefined,
      });
      actualKeys.add(key);
    });

    this.removeMissingItems(this.mainButtonItems, plugin.name, actualKeys);
  };

  deactivateMainButtonItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IMainButtonItem> | undefined =
      plugin.getMainButtonItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.mainButtonItems.delete(key);
    });
  };

  updateProfileMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IProfileMenuItem> | undefined =
      plugin.getProfileMenuItems?.();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualKeys = new Set<string>();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = matchesUserRole(value.usersType, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const onClick = async () => {
        if (!value.onClick) return;

        const message = await value.onClick();

        this.dispatchMessage({ message, pluginName: plugin.name });
      };

      this.profileMenuItems.set(key, {
        ...value,
        onClick,
        pluginName: plugin.name,
        icon: `${plugin.iconUrl}/assets/${value.icon}?hash=${plugin.version}`,
      });
      actualKeys.add(key);
    });

    this.removeMissingItems(this.profileMenuItems, plugin.name, actualKeys);
  };

  deactivateProfileMenuItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IProfileMenuItem> | undefined =
      plugin.getProfileMenuItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.profileMenuItems.delete(key);
    });
  };

  updateEventListenerItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IEventListenerItem> | undefined =
      plugin.getEventListenerItems?.();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualKeys = new Set<string>();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = matchesUserRole(value.usersTypes, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;
      const eventHandler = async () => {
        if (!value.eventHandler) return;

        const message = await value.eventHandler();

        this.dispatchMessage({ message, pluginName: plugin.name });
      };

      this.eventListenerItems.set(key, {
        ...value,
        eventHandler,
        pluginName: plugin.name,
      });
      actualKeys.add(key);
    });

    this.removeMissingItems(this.eventListenerItems, plugin.name, actualKeys);
  };

  deactivateEventListenerItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IEventListenerItem> | undefined =
      plugin.getEventListenerItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.eventListenerItems.delete(key);
    });
  };

  updateFileItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IFileItem> | undefined = plugin.getFileItems?.();

    if (!items) return;

    const userRole = this.getUserRole();

    const actualKeys = new Set<string>();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = matchesUserRole(value.usersType, userRole);

      if (!correctUserType) return;

      const fileIcon = value.fileRowIcon
        ? `${plugin.iconUrl}/assets/${value.fileRowIcon}?hash=${plugin.version}`
        : undefined;
      const fileIconTile = value.fileTileIcon
        ? `${plugin.iconUrl}/assets/${value.fileTileIcon}?hash=${plugin.version}`
        : fileIcon;

      const onClick = async (item: TFile) => {
        const device = this.getCurrentDevice();
        const correctDevice = value.devices
          ? value.devices.includes(device)
          : true;

        const { security } = this.selectedFolderStore;

        const correctSecurity = value.security
          ? value.security.every(
              (sKey) => security?.[sKey as keyof typeof security],
            )
          : true;

        const correctFileSecurity = value.fileSecurity
          ? value.fileSecurity.every(
              (sKey) => item.security[sKey as keyof typeof item.security],
            )
          : true;

        if (
          !value.onClick ||
          !correctDevice ||
          !correctSecurity ||
          !correctFileSecurity
        )
          return;

        const message = await value.onClick(item);

        this.dispatchMessage({ message, pluginName: plugin.name });
      };

      this.fileItems.set(key, {
        ...value,
        onClick,
        fileIcon,
        fileIconTile,
        pluginName: plugin.name,
      });
      actualKeys.add(key);
    });

    this.removeMissingItems(this.fileItems, plugin.name, actualKeys);
  };

  deactivateFileItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IFileItem> | undefined = plugin.getFileItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.fileItems.delete(key);
    });
  };

  initPostMessagePlugin = (plugin: TPlugin) => {
    const callback = (message: IPostMessageCallbackMessage) => {
      this.dispatchMessage({ message, pluginName: plugin.name });
    };

    plugin.setPostMessageCallback?.(callback);
  };

  updateArticleButtonItems = async (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IArticleButtonItem> | undefined =
      plugin.getArticleButtonItems && plugin.getArticleButtonItems();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualKeys = new Set<string>();

    for (const [key, value] of Array.from(items)) {
      const correctUserType = matchesUserRole(value.usersTypes, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) continue;

      this.articleButtonItems.set(key, {
        ...value,
        pluginName: plugin.name,
      });
      actualKeys.add(key);
    }

    this.removeMissingItems(this.articleButtonItems, plugin.name, actualKeys);
  };

  updateArticleNavigationItems = async (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IArticleNavigationItem> | undefined =
      plugin.getArticleNavigationItems && plugin.getArticleNavigationItems();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const actualItems = new Map<string, IArticleNavigationItemClient>();

    for (const [key, value] of Array.from(items)) {
      const correctUserType = matchesUserRole(value.usersTypes, userRole);

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) continue;

      const icon = `${plugin.iconUrl}/assets/${value.icon}?hash=${plugin.version}`;

      actualItems.set(key, {
        ...value,
        icon,
        pluginName: plugin.name,
      });
    }

    this.removeMissingItems(
      this.articleNavigationItems,
      plugin.name,
      new Set(actualItems.keys()),
    );

    actualItems.forEach((value, key) => {
      this.articleNavigationItems.set(key, value);
    });
  };

  deactivateArticleNavigationItems = (plugin: TPlugin) => {
    if (!plugin) return;

    Array.from(this.articleNavigationItems).forEach(([key, value]) => {
      if (value.pluginName === plugin.name) {
        this.articleNavigationItems.delete(key);
      }
    });
  };

  deactivateArticleButtonItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IArticleButtonItem> | undefined =
      plugin.getArticleButtonItems && plugin.getArticleButtonItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.articleButtonItems.delete(key);
    });
  };

  get pluginList() {
    return this.plugins;
  }

  get enabledPluginList() {
    return this.plugins.filter((p) => p.enabled);
  }

  get systemPluginList() {
    return this.plugins.filter((p) => p.system);
  }

  get contextMenuItemsList() {
    const items: { key: string; value: IContextMenuItemClient }[] = Array.from(
      this.contextMenuItems,
      ([key, value]) => {
        return { key, value: { ...value } };
      },
    );

    if (items.length > 0) {
      // items.sort((a, b) => a.value.position < b.value.position);

      return items;
    }

    return null;
  }

  get infoPanelItemsList() {
    const items = Array.from(this.infoPanelItems, ([key, value]) => {
      return { key, value: { ...value } };
    });

    return items;
  }

  get profileMenuItemsList() {
    const items = Array.from(this.profileMenuItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      // items.sort((a, b) => a.value.position < b.value.position);

      return items;
    }

    return null;
  }

  get mainButtonItemsList() {
    const items = Array.from(this.mainButtonItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      // items.sort((a, b) => a.value.position < b.value.position);

      return items;
    }

    return null;
  }

  get eventListenerItemsList() {
    const items = Array.from(this.eventListenerItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      return items;
    }

    return null;
  }

  get fileItemsList() {
    const items = Array.from(this.fileItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      return items;
    }

    return null;
  }

  get articleButtonItemsList() {
    const items = Array.from(this.articleButtonItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      return items;
    }

    return null;
  }

  closeReactPluginModal = (): void => {
    this.reactPluginModalState = null;
  };

  buildReactPluginRuntime = (
    pluginName: string,
    currentFile: TCurrentFile | null,
    user: TUser | null,
  ): PluginRuntime => {
    // Bare redraw requests: the plugin has already mutated its own item, and the
    // message only tells the portal to re-read the collection.
    const redraw = (action: Actions) => () =>
      this.dispatchMessage({ message: { actions: [action] }, pluginName });

    return {
      currentFile,
      currentUser: user ? toCurrentUser(user) : null,
      actions: {
        showToast: (props) =>
          this.dispatchMessage({
            message: { actions: [Actions.showToast], toastProps: [props] },
            pluginName,
          }),
        showModal: (props) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.showModal],
              modalDialogProps: props,
            },
            pluginName,
            currentFile,
          }),
        closeModal: () =>
          this.dispatchMessage({
            message: { actions: [Actions.closeModal] },
            pluginName,
          }),
        showSelector: (props: TSelector) =>
          this.dispatchMessage({
            message: { actions: [Actions.showSelector], selectorProps: props },
            pluginName,
          }),
        updateSelector: (props: TSelector) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.updateSelector],
              selectorProps: props,
            },
            pluginName,
          }),
        closeSelector: () =>
          this.dispatchMessage({
            message: { actions: [Actions.closeSelector] },
            pluginName,
          }),
        navigate: (path: string) =>
          this.dispatchMessage({
            message: { actions: [Actions.navigate], navigatePath: path },
            pluginName,
          }),
        openInfoPanel: (tab) =>
          this.dispatchMessage({
            message: { actions: [Actions.openInfoPanel], infoPanelTab: tab },
            pluginName,
          }),
        showCreateDialog: (props) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.showCreateDialogModal],
              createDialogProps: props,
            },
            pluginName,
          }),
        showMediaViewer: (props: IMediaViewer) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.showMediaViewer],
              mediaViewerProps: props,
            },
            pluginName,
          }),
        closeMediaViewer: () =>
          this.dispatchMessage({
            message: { actions: [Actions.closeMediaViewer] },
            pluginName,
          }),
        updateMediaViewer: (props: IMediaViewer) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.updateMediaViewer],
              mediaViewerProps: props,
            },
            pluginName,
          }),
        addFloatingOperationsButton: (props: IFloatingOperationsButton) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.addFloatingOperationsButton],
              floatingOperationsButtonProps: props,
            },
            pluginName,
          }),
        removeFloatingOperationsButton: (id: string) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.removeFloatingOperationsButton],
              floatingOperationsButtonPropsId: id,
            },
            pluginName,
          }),
        updateFloatingOperationsButton: (props: IFloatingOperationsButton) =>
          this.dispatchMessage({
            message: {
              actions: [Actions.updateFloatingOperationsButton],
              floatingOperationsButtonProps: props,
            },
            pluginName,
          }),
        updateContextMenuItems: redraw(Actions.updateContextMenuItems),
        updateInfoPanelItems: redraw(Actions.updateInfoPanelItems),
        updateMainButtonItems: redraw(Actions.updateMainButtonItems),
        updateProfileMenuItems: redraw(Actions.updateProfileMenuItems),
        updateFileItems: redraw(Actions.updateFileItems),
        updateEventListenerItems: redraw(Actions.updateEventListenerItems),
        updateArticleButtonItems: redraw(Actions.updateArticleButtonItems),
        updateArticleNavigationItems: redraw(
          Actions.updateArticleNavigationItems,
        ),
      },
      api: pluginApi,
      settings: {
        load: () => {
          const entry = this.plugins.find((p) => p.name === pluginName);
          if (!entry?.settings) return null;
          try {
            return JSON.parse(entry.settings);
          } catch {
            return null;
          }
        },
        save: async (data: Record<string, unknown>) => {
          const entry = this.plugins.find((p) => p.name === pluginName);
          if (!entry) return;
          const settingsStr = JSON.stringify(data);
          await api.plugins.updatePlugin(
            pluginName,
            entry.enabled,
            settingsStr,
          );
          runInAction(() => {
            entry.settings = settingsStr;
          });
          entry.setAdminPluginSettingsValue?.(settingsStr);

          this.updatePluginStatus(pluginName);
        },
        setSaveButton: (props: ButtonGroup) => {
          this.setReactSettingsSaveButtonState(pluginName, props);
        },
      },
    };
  };

  private loadModulePlugin = async (
    plugin: TAPIPlugin,
  ): Promise<Partial<TPlugin>> => {
    const res = await fetch(plugin.url);
    if (!res.ok) {
      throw new PluginLoadError({
        kind: "http",
        status: res.status,
        url: plugin.url,
      });
    }

    const rawCode = await res.text();

    const { rewritePluginImports } =
      await import("../helpers/plugins/react/shim");

    const code = rewritePluginImports(rawCode);
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    let mod: { default?: Partial<TPlugin> };
    try {
      mod = await import(/* @vite-ignore */ blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }

    const exported = mod?.default;
    if (!exported) throw new PluginLoadError({ kind: "no-default-export" });

    return exported;
  };

  initLoadedModulePlugin = async (
    plugin: TAPIPlugin,
    exported: Partial<TPlugin>,
    callback?: (plugin: TPlugin) => void,
  ): Promise<TPlugin> => {
    const scopes =
      typeof plugin.scopes === "string"
        ? (plugin.scopes.split(",") as PluginScopes[])
        : plugin.scopes;

    const newPlugin = Object.assign(exported as TPlugin, {
      ...plugin,
      nameLocaleMap: plugin.nameLocale,
      descriptionLocaleMap: plugin.descriptionLocale,
      nameLocale: plugin.name,
      descriptionLocale: plugin.description,
      scopes,
      iconUrl: getPluginUrl(plugin.url, ""),
      compatible: this.checkPluginCompatibility(plugin.minDocSpaceVersion),
    });

    try {
      const storedPlugin = await this.runPluginInit(
        newPlugin,
        plugin.settings || null,
      );

      callback?.(storedPlugin);

      return storedPlugin;
    } catch (e) {
      console.error(
        `[Plugin: ${plugin.name}] Plugin initialization failed:`,
        e,
      );

      this.setInitError(plugin.name, toPluginError(e));

      throw e;
    }
  };

  initModulePlugin = async (
    plugin: TAPIPlugin,
    callback?: (plugin: TPlugin) => void,
  ): Promise<void> => {
    let exported: Partial<TPlugin>;

    try {
      exported = await this.loadModulePlugin(plugin);
    } catch (e) {
      console.error(
        `[Plugin: ${plugin.name}] Failed to load module plugin:`,
        e,
      );

      this.installBrokenPlugin(plugin, toPluginError(e));
      return;
    }

    await this.initLoadedModulePlugin(plugin, exported, callback);
  };

  get articleNavigationItemsList() {
    const items = Array.from(this.articleNavigationItems, ([key, value]) => {
      return {
        key,
        value: {
          ...value,
        },
      };
    });

    if (items.length > 0) {
      return items;
    }

    return null;
  }
}

export default PluginStore;
