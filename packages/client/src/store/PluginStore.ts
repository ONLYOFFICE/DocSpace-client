// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";

import api from "@docspace/shared/api";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { toastr } from "@docspace/shared/components/toast";
import {
  TFile,
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import { ModalDialogProps } from "@docspace/shared/components/modal-dialog/ModalDialog.types";
import { TTranslation } from "@docspace/shared/types";

import defaultConfig from "PUBLIC_DIR/scripts/config.json";

import {
  IContextMenuItem,
  IContextMenuItemValidation,
  IEventListenerItem,
  IFileItem,
  IInfoPanelItem,
  IMainButtonItem,
  IProfileMenuItem,
  IframeWindow,
  TPlugin,
} from "SRC_DIR/helpers/plugins/types";

import { getPluginUrl, messageActions } from "../helpers/plugins/utils";
import {
  PluginFileType,
  PluginScopes,
  PluginUsersType,
  PluginStatus,
  PluginDevices,
} from "../helpers/plugins/enums";

import SelectedFolderStore from "./SelectedFolderStore";

const { api: apiConf, proxy: proxyConf } = defaultConfig;
const { origin: apiOrigin, prefix: apiPrefix } = apiConf;
const { url: proxyURL } = proxyConf;

const origin =
  window.ClientConfig?.api?.origin || apiOrigin || window.location.origin;
const proxy = window.ClientConfig?.proxy?.url || proxyURL;
const prefix = window.ClientConfig?.api?.prefix || apiPrefix;

class PluginStore {
  private settingsStore: SettingsStore = {} as SettingsStore;

  private selectedFolderStore: SelectedFolderStore = {} as SelectedFolderStore;

  private userStore: UserStore = {} as UserStore;

  plugins: TPlugin[] = [];

  contextMenuItems: Map<string, IContextMenuItem> = new Map();

  infoPanelItems: Map<string, IInfoPanelItem> = new Map();

  mainButtonItems: Map<string, IMainButtonItem> = new Map();

  profileMenuItems: Map<string, IProfileMenuItem> = new Map();

  eventListenerItems: Map<string, IEventListenerItem> = new Map();

  fileItems: Map<string, IFileItem> = new Map();

  pluginFrame: HTMLIFrameElement | null = null;

  isInit = false;

  settingsPluginDialogVisible = false;

  currentSettingsDialogPlugin: null | { pluginName: string } = null;

  pluginDialogVisible = false;

  pluginDialogProps: null | ModalDialogProps = null;

  deletePluginDialogVisible = false;

  deletePluginDialogProps: null | { pluginName: string } = null;

  isEmptyList = false;

  needPageReload = false;

  constructor(
    settingsStore: SettingsStore,
    selectedFolderStore: SelectedFolderStore,
    userStore: UserStore,
  ) {
    this.settingsStore = settingsStore;
    this.selectedFolderStore = selectedFolderStore;
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  setNeedPageReload = (value: boolean) => {
    this.needPageReload = value;
  };

  setIsEmptyList = (value: boolean) => {
    this.isEmptyList = value;
  };

  setCurrentSettingsDialogPlugin = (value: null | { pluginName: string }) => {
    this.currentSettingsDialogPlugin = value;
  };

  setSettingsPluginDialogVisible = (value: boolean) => {
    this.settingsPluginDialogVisible = value;
  };

  setPluginDialogVisible = (value: boolean) => {
    this.pluginDialogVisible = value;
  };

  setPluginDialogProps = (value: null | ModalDialogProps) => {
    this.pluginDialogProps = value;
  };

  setDeletePluginDialogVisible = (value: boolean) => {
    this.deletePluginDialogVisible = value;
  };

  setDeletePluginDialogProps = (value: null | { pluginName: string }) => {
    this.deletePluginDialogProps = value;
  };

  updatePluginStatus = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    const newStatus = plugin?.getStatus?.();

    const pluginIdx = this.plugins.findIndex((p) => p.name === name);

    if (pluginIdx !== -1) {
      if (this.plugins[pluginIdx].status === newStatus) return;

      this.plugins[pluginIdx].status = newStatus || PluginStatus.active;

      if (
        newStatus === PluginStatus.active &&
        this.plugins[pluginIdx].enabled
      ) {
        if (this.plugins[pluginIdx].scopes.includes(PluginScopes.ContextMenu)) {
          this.updateContextMenuItems(name);
        }

        if (this.plugins[pluginIdx].scopes.includes(PluginScopes.InfoPanel)) {
          this.updateInfoPanelItems(name);
        }

        if (this.plugins[pluginIdx].scopes.includes(PluginScopes.MainButton)) {
          this.updateMainButtonItems(name);
        }

        if (this.plugins[pluginIdx].scopes.includes(PluginScopes.ProfileMenu)) {
          this.updateProfileMenuItems(name);
        }

        if (
          this.plugins[pluginIdx].scopes.includes(PluginScopes.EventListener)
        ) {
          this.updateEventListenerItems(name);
        }

        if (this.plugins[pluginIdx].scopes.includes(PluginScopes.File)) {
          this.updateFileItems(name);
        }
      }
    }
  };

  setPluginFrame = (frame: HTMLIFrameElement) => {
    this.pluginFrame = frame;

    const iWindow = this.pluginFrame?.contentWindow as IframeWindow;

    if (this.pluginFrame && iWindow) iWindow.Plugins = {};
  };

  setIsInit = (isInit: boolean) => {
    this.isInit = isInit;
  };

  initPlugins = async () => {
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
    if (!this.userStore || !this.userStore.user) return;

    const { isAdmin, isOwner } = this.userStore.user;

    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    try {
      this.plugins = [];

      const plugins = await api.plugins.getPlugins(
        !isAdmin && !isOwner ? true : null,
        abortController.signal,
      );

      this.setIsEmptyList(plugins.length === 0);
      await Promise.allSettled(
        plugins.map((plugin) => this.initPlugin(plugin, undefined, fromList)),
      );
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      console.log(e);
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

  addPlugin = async (data: FormData, t: TTranslation) => {
    try {
      const plugin = await api.plugins.addPlugin(data);

      const isPluginCompatible = this.checkPluginCompatibility(
        plugin.minDocSpaceVersion,
      );

      if (!isPluginCompatible) {
        toastr.error(
          t("PluginIsNotCompatible", {
            productName: t("Common:ProductName"),
          }),
        );
      } else {
        toastr.success(t("PluginLoadedSuccessfully"));
      }

      this.setNeedPageReload(true);

      this.initPlugin(plugin);
    } catch (e) {
      const err = e as { response: { data: { error: { message: string } } } };

      toastr.error(err.response.data.error.message as string);
    }
  };

  uninstallPlugin = async (name: string) => {
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
    } catch (e) {
      console.log(e);
    }
  };

  initPlugin = (
    plugin: TAPIPlugin,
    callback?: (plugin: TPlugin) => void,
    fromList?: boolean,
  ) => {
    if (!plugin.enabled && !fromList) return;

    return new Promise((resolve, reject) => {
      const onLoad = async () => {
        try {
          const iWindow = this.pluginFrame?.contentWindow as IframeWindow;

          const newPlugin = cloneDeep({
            ...plugin,
            ...iWindow?.Plugins?.[plugin.pluginName],
          });

          newPlugin.scopes =
            typeof newPlugin.scopes === "string"
              ? (newPlugin.scopes.split(",") as PluginScopes[])
              : newPlugin.scopes;

          newPlugin.iconUrl = getPluginUrl(newPlugin.url, "");

          const isPluginCompatible = this.checkPluginCompatibility(
            plugin.minDocSpaceVersion,
          );

          newPlugin.compatible = isPluginCompatible;

          this.installPlugin(newPlugin);

          if (newPlugin.scopes.includes(PluginScopes.Settings)) {
            newPlugin.setAdminPluginSettingsValue?.(plugin.settings || null);
          }

          callback?.(newPlugin);
          resolve(newPlugin);
        } catch (error) {
          reject(error);
        }
      };

      const onError = () => {};

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
        reject(new Error("Failed to create script element"));
      }
    });
  };

  installPlugin = async (plugin: TPlugin, addToList = true) => {
    if (addToList) {
      const idx = this.plugins.findIndex((p) => p.name === plugin.name);

      if (idx === -1) {
        runInAction(() => {
          this.plugins = [{ ...plugin }, ...this.plugins];
        });

        this.setIsEmptyList(false);
      } else {
        this.plugins[idx] = plugin;
      }
    }

    if (!plugin || !plugin.enabled) return;

    if (plugin.scopes.includes(PluginScopes.API)) {
      plugin.setAPI?.(origin, proxy, prefix);
    }

    const { name } = plugin;

    if (plugin.onLoadCallback) {
      await plugin.onLoadCallback();

      this.updatePluginStatus(name);
    }

    if (plugin.status === PluginStatus.hide) return;

    if (plugin.scopes.includes(PluginScopes.ContextMenu)) {
      this.updateContextMenuItems(name);
    }

    if (plugin.scopes.includes(PluginScopes.InfoPanel)) {
      this.updateInfoPanelItems(name);
    }

    if (plugin.scopes.includes(PluginScopes.MainButton)) {
      this.updateMainButtonItems(name);
    }

    if (plugin.scopes.includes(PluginScopes.ProfileMenu)) {
      this.updateProfileMenuItems(name);
    }

    if (plugin.scopes.includes(PluginScopes.EventListener)) {
      this.updateEventListenerItems(name);
    }

    if (plugin.scopes.includes(PluginScopes.File)) {
      this.updateFileItems(name);
    }
  };

  updatePlugin = async (
    name: string,
    status: boolean,
    settings: string,
    t?: TTranslation,
  ) => {
    try {
      let currentSettings = settings;
      let currentStatus = status;

      const oldPlugin = this.pluginList.find((p) => p.name === name);

      if (!currentSettings) currentSettings = oldPlugin?.settings || "";

      if (typeof status !== "boolean")
        currentStatus = oldPlugin?.enabled || false;

      currentSettings = currentStatus ? settings : "";

      const plugin = await api.plugins.updatePlugin(
        name,
        currentStatus,
        currentSettings,
      );

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
      console.log(e);
    }
  };

  activatePlugin = async (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin) return;

    plugin.enabled = true;

    this.setNeedPageReload(true);

    this.installPlugin(plugin, false);
  };

  deactivatePlugin = async (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin) return;

    plugin.enabled = false;
    plugin.settings = "";

    if (plugin.scopes.includes(PluginScopes.ContextMenu)) {
      this.deactivateContextMenuItems(plugin);
    }

    if (plugin.scopes.includes(PluginScopes.InfoPanel)) {
      this.deactivateInfoPanelItems(plugin);
    }

    if (plugin.scopes.includes(PluginScopes.ProfileMenu)) {
      this.deactivateProfileMenuItems(plugin);
    }

    if (plugin.scopes.includes(PluginScopes.MainButton)) {
      this.deactivateMainButtonItems(plugin);
    }

    if (plugin.scopes.includes(PluginScopes.EventListener)) {
      this.deactivateEventListenerItems(plugin);
    }

    if (plugin.scopes.includes(PluginScopes.File)) {
      this.deactivateFileItems(plugin);
    }
  };

  getUserRole = () => {
    const { user } = this.userStore;

    if (!user) return PluginUsersType.user;

    const { isOwner, isAdmin, isCollaborator, isVisitor } = user;

    const userRole = isOwner
      ? PluginUsersType.owner
      : isAdmin
        ? PluginUsersType.docSpaceAdmin
        : isCollaborator
          ? PluginUsersType.collaborator
          : isVisitor
            ? PluginUsersType.user
            : PluginUsersType.roomAdmin;

    return userRole;
  };

  getCurrentDevice = () => {
    const currentDeviceType = this.settingsStore.currentDeviceType as unknown;

    return currentDeviceType as PluginDevices;
  };

  getValidContextMenuItemKeys = (
    item: IContextMenuItem,
    ctx: IContextMenuItemValidation,
  ) => {
    const keys: string[] = [];
    const { type, fileExst, userRole, device, security, itemSecurity } = ctx;

    if (type && item.fileType && !item.fileType.includes(type)) return;

    if (fileExst && item.fileExt && !item.fileExt.includes(fileExst)) return;

    if (userRole && item.usersTypes && !item.usersTypes.includes(userRole))
      return;

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
    fileExst: string,
    security: TRoomSecurity | TFolderSecurity,
    itemSecurity: TFileSecurity | TRoomSecurity | TFolderSecurity,
  ) => {
    if (this.contextMenuItems.size === 0) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const items = Array.from(this.contextMenuItems.values());
    const keys: string[] = [];

    switch (type) {
      case PluginFileType.Files:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            fileExst,
            userRole,
            device,
            security,
            itemSecurity,
          });

          if (validKeys) keys.push(...validKeys);
        });

        break;
      case PluginFileType.Folders:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            itemSecurity,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.Rooms:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            itemSecurity,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.Image:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            fileExst,
            security,
            itemSecurity,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      case PluginFileType.Video:
        items.forEach((item) => {
          const validKeys = this.getValidContextMenuItemKeys(item, {
            type,
            userRole,
            device,
            security,
            itemSecurity,
          });

          if (validKeys) keys.push(...validKeys);
        });
        break;
      default:
    }

    if (keys.length === 0) return null;

    return keys;
  };

  updateContextMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IContextMenuItem> =
      plugin.getContextMenuItems && plugin.getContextMenuItems();

    if (!items) return;

    // Helper function to recursively process context menu items
    const processContextMenuItem = (value: IContextMenuItem) => {
      const onClick = async (fileId: number) => {
        if (!value.onClick || value.items) return;

        const message = await value.onClick(fileId);

        messageActions({
          message,
          setElementProps: null,
          pluginName: plugin.name,
          setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
          setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
          updatePluginStatus: this.updatePluginStatus,
          updatePropsContext: null,
          setPluginDialogVisible: this.setPluginDialogVisible,
          setPluginDialogProps: this.setPluginDialogProps,
          updateContextMenuItems: this.updateContextMenuItems,
          updateInfoPanelItems: this.updateInfoPanelItems,
          updateMainButtonItems: this.updateMainButtonItems,
          updateProfileMenuItems: this.updateProfileMenuItems,
          updateEventListenerItems: this.updateEventListenerItems,
          updateFileItems: this.updateFileItems,
          updateCreateDialogProps: null,
          updatePlugin: null,
        });
      };

      // Create processed result object
      const processedItem: IContextMenuItem = {
        ...value,
        onClick,
        pluginName: plugin.name,
        icon: `${plugin.iconUrl}/assets/${value.icon}`,
      };

      // Recursively process nested items if they exist
      if (value.items && value.items.length > 0) {
        processedItem.items = value.items.map((nestedItem) => {
          return processContextMenuItem(nestedItem);
        });
      }

      return processedItem;
    };

    // Process all top-level items
    Array.from(items).forEach(([key, value]: [string, IContextMenuItem]) => {
      const contextMenuItem = processContextMenuItem(value);
      this.contextMenuItems.set(key, contextMenuItem);
    });
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
      plugin.getInfoPanelItems && plugin.getInfoPanelItems();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    Array.from(items).forEach(([key, value]: [string, IInfoPanelItem]) => {
      const correctUserType = value.usersTypes
        ? value.usersTypes.includes(userRole)
        : true;

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const submenu = { ...value.subMenu };

      if (value.subMenu.onClick) {
        const onClick = async (id: number) => {
          const message = await value?.subMenu?.onClick?.(id);

          messageActions({
            message,
            setElementProps: null,
            pluginName: plugin.name,
            setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
            setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
            updatePluginStatus: this.updatePluginStatus,
            updatePropsContext: null,
            setPluginDialogVisible: this.setPluginDialogVisible,
            setPluginDialogProps: this.setPluginDialogProps,
            updateContextMenuItems: this.updateContextMenuItems,
            updateInfoPanelItems: this.updateInfoPanelItems,
            updateMainButtonItems: this.updateMainButtonItems,
            updateProfileMenuItems: this.updateProfileMenuItems,
            updateEventListenerItems: this.updateEventListenerItems,
            updateFileItems: this.updateFileItems,
            updateCreateDialogProps: null,
            updatePlugin: null,
          });
        };

        submenu.onClick = onClick;
      }

      this.infoPanelItems.set(key, {
        ...value,
        subMenu: submenu,

        pluginName: plugin.name,
      });
    });
  };

  deactivateInfoPanelItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IInfoPanelItem> | undefined =
      plugin.getInfoPanelItems && plugin.getInfoPanelItems();

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
    const storeId = this.selectedFolderStore.id;

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = value.usersType
        ? value.usersType.includes(userRole)
        : true;

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const newItems: IMainButtonItem[] = [];

      if (value.items && storeId) {
        value.items.forEach((i) => {
          const onClick = async () => {
            const message = await i?.onClick?.(storeId);

            messageActions({
              message,
              setElementProps: null,
              pluginName: plugin.name,
              setSettingsPluginDialogVisible:
                this.setSettingsPluginDialogVisible,
              setCurrentSettingsDialogPlugin:
                this.setCurrentSettingsDialogPlugin,
              updatePluginStatus: this.updatePluginStatus,
              updatePropsContext: null,
              setPluginDialogVisible: this.setPluginDialogVisible,
              setPluginDialogProps: this.setPluginDialogProps,
              updateContextMenuItems: this.updateContextMenuItems,
              updateInfoPanelItems: this.updateInfoPanelItems,
              updateMainButtonItems: this.updateMainButtonItems,
              updateProfileMenuItems: this.updateProfileMenuItems,
              updateEventListenerItems: this.updateEventListenerItems,
              updateFileItems: this.updateFileItems,
              updateCreateDialogProps: null,
              updatePlugin: null,
            });
          };

          newItems.push({
            ...i,
            onClick,
            icon: `${plugin.iconUrl}/assets/${i.icon}`,
          });
        });
      }

      const onClick = async () => {
        if (!value.onClick) return;
        const currStoreId = this.selectedFolderStore.id;
        if (!currStoreId) return;

        const message = await value.onClick(currStoreId);

        messageActions({
          message,
          setElementProps: null,
          pluginName: plugin.name,
          setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
          setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
          updatePluginStatus: this.updatePluginStatus,
          updatePropsContext: null,
          setPluginDialogVisible: this.setPluginDialogVisible,
          setPluginDialogProps: this.setPluginDialogProps,
          updateContextMenuItems: this.updateContextMenuItems,
          updateInfoPanelItems: this.updateInfoPanelItems,
          updateMainButtonItems: this.updateMainButtonItems,
          updateProfileMenuItems: this.updateProfileMenuItems,
          updateEventListenerItems: this.updateEventListenerItems,
          updateFileItems: this.updateFileItems,
          updateCreateDialogProps: null,
          updatePlugin: null,
        });
      };

      this.mainButtonItems.set(key, {
        ...value,
        onClick,

        pluginName: plugin.name,

        icon: `${plugin.iconUrl}/assets/${value.icon}`,
        items: newItems.length > 0 ? newItems : null,
      });
    });
  };

  deactivateMainButtonItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IMainButtonItem> | undefined =
      plugin.getMainButtonItems && plugin.getMainButtonItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.mainButtonItems.delete(key);
    });
  };

  updateProfileMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IProfileMenuItem> | undefined =
      plugin.getProfileMenuItems && plugin.getProfileMenuItems();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = value.usersType
        ? value.usersType.includes(userRole)
        : true;

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;

      const onClick = async () => {
        if (!value.onClick) return;

        const message = await value.onClick();

        messageActions({
          message,
          setElementProps: null,
          pluginName: plugin.name,
          setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
          setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
          updatePluginStatus: this.updatePluginStatus,
          updatePropsContext: null,
          setPluginDialogVisible: this.setPluginDialogVisible,
          setPluginDialogProps: this.setPluginDialogProps,
          updateContextMenuItems: this.updateContextMenuItems,
          updateInfoPanelItems: this.updateInfoPanelItems,
          updateMainButtonItems: this.updateMainButtonItems,
          updateProfileMenuItems: this.updateProfileMenuItems,
          updateEventListenerItems: this.updateEventListenerItems,
          updateFileItems: this.updateFileItems,
          updateCreateDialogProps: null,
          updatePlugin: null,
        });
      };

      this.profileMenuItems.set(key, {
        ...value,
        onClick,

        pluginName: plugin.name,

        icon: `${plugin.iconUrl}/assets/${value.icon}`,
      });
    });
  };

  deactivateProfileMenuItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IProfileMenuItem> | undefined =
      plugin.getProfileMenuItems && plugin.getProfileMenuItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.profileMenuItems.delete(key);
    });
  };

  updateEventListenerItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IEventListenerItem> | undefined =
      plugin.getEventListenerItems && plugin.getEventListenerItems();

    if (!items) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = value.usersTypes
        ? value.usersTypes.includes(userRole)
        : true;

      const correctDevice = value.devices
        ? value.devices.includes(device)
        : true;

      if (!correctUserType || !correctDevice) return;
      const eventHandler = async () => {
        if (!value.eventHandler) return;

        const message = await value.eventHandler();

        messageActions({
          message,
          setElementProps: null,
          pluginName: plugin.name,
          setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
          setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
          updatePluginStatus: this.updatePluginStatus,
          updatePropsContext: null,
          setPluginDialogVisible: this.setPluginDialogVisible,
          setPluginDialogProps: this.setPluginDialogProps,
          updateContextMenuItems: this.updateContextMenuItems,
          updateInfoPanelItems: this.updateInfoPanelItems,
          updateMainButtonItems: this.updateMainButtonItems,
          updateProfileMenuItems: this.updateProfileMenuItems,
          updateEventListenerItems: this.updateEventListenerItems,
          updateFileItems: this.updateFileItems,
          updateCreateDialogProps: null,
          updatePlugin: null,
        });
      };

      this.eventListenerItems.set(key, {
        ...value,
        eventHandler,

        pluginName: plugin.name,
      });
    });
  };

  deactivateEventListenerItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IEventListenerItem> | undefined =
      plugin.getEventListenerItems && plugin.getEventListenerItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.eventListenerItems.delete(key);
    });
  };

  updateFileItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items: Map<string, IFileItem> | undefined =
      plugin.getFileItems && plugin.getFileItems();

    if (!items) return;

    const userRole = this.getUserRole();

    Array.from(items).forEach(([key, value]) => {
      const correctUserType = value.usersType
        ? value.usersType.includes(userRole)
        : true;

      if (!correctUserType) return;

      const fileIcon = `${plugin.iconUrl}/assets/${value.fileRowIcon}`;
      const fileIconTile = `${plugin.iconUrl}/assets/${value.fileTileIcon}`;

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

        messageActions({
          message,
          setElementProps: null,
          pluginName: plugin.name,
          setSettingsPluginDialogVisible: this.setSettingsPluginDialogVisible,
          setCurrentSettingsDialogPlugin: this.setCurrentSettingsDialogPlugin,
          updatePluginStatus: this.updatePluginStatus,
          updatePropsContext: null,
          setPluginDialogVisible: this.setPluginDialogVisible,
          setPluginDialogProps: this.setPluginDialogProps,
          updateContextMenuItems: this.updateContextMenuItems,
          updateInfoPanelItems: this.updateInfoPanelItems,
          updateMainButtonItems: this.updateMainButtonItems,
          updateProfileMenuItems: this.updateProfileMenuItems,
          updateEventListenerItems: this.updateEventListenerItems,
          updateFileItems: this.updateFileItems,
          updateCreateDialogProps: null,
          updatePlugin: null,
        });
      };

      this.fileItems.set(key, {
        ...value,
        onClick,
        fileIcon,
        fileIconTile,

        pluginName: plugin.name,
      });
    });
  };

  deactivateFileItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items: Map<string, IFileItem> | undefined =
      plugin.getFileItems && plugin.getFileItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.fileItems.delete(key);
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
    const items: { key: string; value: IContextMenuItem }[] = Array.from(
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
}

export default PluginStore;
