// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable no-console */
import { makeAutoObservable, runInAction } from "mobx";
import { cloneDeep } from "lodash";

import api from "@docspace/shared/api";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import { toastr } from "@docspace/shared/components/toast";

import defaultConfig from "PUBLIC_DIR/scripts/config.json";

import {
  IContextMenuItem,
  IEventListenerItem,
  IFileItem,
  IInfoPanelItem,
  IMainButtonItem,
  IProfileMenuItem,
  IframeWindow,
  TPlugin,
} from "SRC_DIR/helpers/plugins/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import {
  TFile,
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import { ModalDialogProps } from "@docspace/shared/components/modal-dialog/ModalDialog.types";

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
  window.DocSpaceConfig?.api?.origin || apiOrigin || window.location.origin;
const proxy = window.DocSpaceConfig?.proxy?.url || proxyURL;
const prefix = window.DocSpaceConfig?.api?.prefix || apiPrefix;

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

  isLoading = true;

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

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
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

    const newStatus = plugin?.getStatus();

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

    this.updatePlugins();

    this.setIsInit(true);
  };

  updatePlugins = async () => {
    if (!this.userStore || !this.userStore.user) return;

    const { isAdmin, isOwner } = this.userStore.user;

    this.setIsLoading(true);

    try {
      this.plugins = [];

      const plugins = await api.plugins.getPlugins(
        !isAdmin && !isOwner ? true : null,
      );

      this.setIsEmptyList(plugins.length === 0);
      plugins.forEach((plugin) => this.initPlugin(plugin));

      setTimeout(() => {
        this.setIsLoading(false);
      }, 500);
    } catch (e) {
      console.log(e);
    }
  };

  addPlugin = async (data: FormData) => {
    try {
      const plugin = await api.plugins.addPlugin(data);

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

  initPlugin = (plugin: TAPIPlugin, callback?: (plugin: TPlugin) => void) => {
    const onLoad = async () => {
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

      this.installPlugin(newPlugin);

      if (newPlugin.scopes.includes(PluginScopes.Settings)) {
        newPlugin.setAdminPluginSettingsValue?.(plugin.settings || null);
      }

      callback?.(newPlugin);
    };

    const onError = () => {};

    const frameDoc = this.pluginFrame?.contentDocument;

    const script = frameDoc?.createElement("script");

    if (script) {
      script.setAttribute("type", "text/javascript");
      script.setAttribute("id", `${plugin.name}`);

      if (onLoad) script.onload = onLoad.bind(this);
      if (onError) script.onerror = onError.bind(this);

      script.src = plugin.url;
      script.async = true;

      frameDoc?.body.appendChild(script);
    }
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

  updatePlugin = async (name: string, status: boolean, settings: string) => {
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
        this.activatePlugin(name);
      } else {
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

  getContextMenuKeysByType = (
    type: PluginFileType,
    fileExst: string,
    security: TRoomSecurity | TFileSecurity | TFolderSecurity,
  ) => {
    if (!this.contextMenuItems) return;

    const userRole = this.getUserRole();
    const device = this.getCurrentDevice();

    const itemsMap = Array.from(this.contextMenuItems);
    const keys: string[] = [];

    switch (type) {
      case PluginFileType.Files:
        itemsMap.forEach((val) => {
          const item = val[1];

          if (!item.fileType) return;

          if (item.fileType.includes(PluginFileType.Files)) {
            const correctFileExt = item.fileExt
              ? item.fileExt.includes(fileExst)
              : true;

            const correctUserType = item.usersTypes
              ? item.usersTypes.includes(userRole)
              : true;

            const correctDevice = item.devices
              ? item.devices.includes(device)
              : true;

            const correctSecurity = item.security
              ? // @ts-expect-error its valid key
                item.security.every((key) => security?.[key])
              : true;

            if (
              correctFileExt &&
              correctUserType &&
              correctDevice &&
              correctSecurity
            )
              keys.push(item.key);
          }
        });
        break;
      case PluginFileType.Folders:
        itemsMap.forEach((val) => {
          const item = val[1];

          if (item.fileType?.includes(PluginFileType.Folders)) {
            const correctUserType = item.usersTypes
              ? item.usersTypes.includes(userRole)
              : true;

            const correctDevice = item.devices
              ? item.devices.includes(device)
              : true;

            const correctSecurity = item.security
              ? // @ts-expect-error its valid key
                item.security.every((key) => security?.[key])
              : true;

            if (correctUserType && correctDevice && correctSecurity)
              keys.push(item.key);
          }
        });
        break;
      case PluginFileType.Rooms:
        itemsMap.forEach((val) => {
          const item = val[1];

          if (item.fileType?.includes(PluginFileType.Rooms)) {
            const correctUserType = item.usersTypes
              ? item.usersTypes.includes(userRole)
              : true;

            const correctDevice = item.devices
              ? item.devices.includes(device)
              : true;

            const correctSecurity = item.security
              ? // @ts-expect-error its valid key
                item.security.every((key) => security?.[key])
              : true;

            if (correctUserType && correctDevice && correctSecurity)
              keys.push(item.key);
          }
        });
        break;
      case PluginFileType.Image:
        itemsMap.forEach((val) => {
          const item = val[1];

          if (item.fileType?.includes(PluginFileType.Image)) {
            const correctFileExt = item.fileExt
              ? item.fileExt.includes(fileExst)
              : true;

            const correctUserType = item.usersTypes
              ? item.usersTypes.includes(userRole)
              : true;

            const correctDevice = item.devices
              ? item.devices.includes(device)
              : true;

            const correctSecurity = item.security
              ? // @ts-expect-error its valid key
                item.security.every((key) => security?.[key])
              : true;

            if (
              correctUserType &&
              correctDevice &&
              correctFileExt &&
              correctSecurity
            )
              keys.push(item.key);
          }
        });
        break;
      case PluginFileType.Video:
        itemsMap.forEach((val) => {
          const item = val[1];

          if (item.fileType?.includes(PluginFileType.Video)) {
            const correctUserType = item.usersTypes
              ? item.usersTypes.includes(userRole)
              : true;

            const correctDevice = item.devices
              ? item.devices.includes(device)
              : true;

            const correctSecurity = item.security
              ? // @ts-expect-error its valid key
                item.security.every((key) => security?.[key])
              : true;

            if (correctUserType && correctDevice && correctSecurity)
              keys.push(item.key);
          }
        });
        break;
      default:
        itemsMap.forEach((val) => {
          const item = val[1];
          if (item.fileType) return;

          const correctUserType = item.usersTypes
            ? item.usersTypes.includes(userRole)
            : true;

          const correctDevice = item.devices
            ? item.devices.includes(device)
            : true;

          const correctSecurity = item.security
            ? // @ts-expect-error its valid key
              item.security.every((key) => security?.[key])
            : true;

          if (correctUserType && correctDevice && correctSecurity)
            keys.push(item.key);
        });
    }

    if (keys.length === 0) return null;

    return keys;
  };

  updateContextMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items = plugin.getContextMenuItems && plugin.getContextMenuItems();

    if (!items) return;

    Array.from(items).forEach(([key, value]) => {
      const onClick = async (fileId: number) => {
        if (!value.onClick) return;

        const message = await value.onClick(fileId);

        messageActions(
          message,
          null,

          plugin.name,

          this.setSettingsPluginDialogVisible,
          this.setCurrentSettingsDialogPlugin,
          this.updatePluginStatus,
          null,
          this.setPluginDialogVisible,
          this.setPluginDialogProps,

          this.updateContextMenuItems,
          this.updateInfoPanelItems,
          this.updateMainButtonItems,
          this.updateProfileMenuItems,
          this.updateEventListenerItems,
          this.updateFileItems,
        );
      };

      this.contextMenuItems.set(key, {
        ...value,
        onClick,

        pluginName: plugin.name,

        icon: `${plugin.iconUrl}/assets/${value.icon}`,
      });
    });
  };

  deactivateContextMenuItems = (plugin: TPlugin) => {
    if (!plugin) return;

    const items = plugin.getContextMenuItems?.();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.contextMenuItems.delete(key);
    });
  };

  updateInfoPanelItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items = plugin.getInfoPanelItems && plugin.getInfoPanelItems();

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

      const submenu = { ...value.subMenu };

      if (value.subMenu.onClick) {
        const onClick = async (id: number) => {
          const message = await value?.subMenu?.onClick?.(id);

          messageActions(
            message,
            null,

            plugin.name,

            this.setSettingsPluginDialogVisible,
            this.setCurrentSettingsDialogPlugin,
            this.updatePluginStatus,
            null,
            this.setPluginDialogVisible,
            this.setPluginDialogProps,

            this.updateContextMenuItems,
            this.updateInfoPanelItems,
            this.updateMainButtonItems,
            this.updateProfileMenuItems,
            this.updateEventListenerItems,
            this.updateFileItems,
          );
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

    const items = plugin.getInfoPanelItems && plugin.getInfoPanelItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.infoPanelItems.delete(key);
    });
  };

  updateMainButtonItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items = plugin.getMainButtonItems?.();

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

            messageActions(
              message,
              null,

              plugin.name,

              this.setSettingsPluginDialogVisible,
              this.setCurrentSettingsDialogPlugin,
              this.updatePluginStatus,
              null,
              this.setPluginDialogVisible,
              this.setPluginDialogProps,

              this.updateContextMenuItems,
              this.updateInfoPanelItems,
              this.updateMainButtonItems,
              this.updateProfileMenuItems,
              this.updateEventListenerItems,
              this.updateFileItems,
            );
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

        messageActions(
          message,
          null,

          plugin.name,

          this.setSettingsPluginDialogVisible,
          this.setCurrentSettingsDialogPlugin,
          this.updatePluginStatus,
          null,
          this.setPluginDialogVisible,
          this.setPluginDialogProps,

          this.updateContextMenuItems,
          this.updateInfoPanelItems,
          this.updateMainButtonItems,
          this.updateProfileMenuItems,
          this.updateEventListenerItems,
          this.updateFileItems,
        );
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

    const items = plugin.getMainButtonItems && plugin.getMainButtonItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.mainButtonItems.delete(key);
    });
  };

  updateProfileMenuItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items = plugin.getProfileMenuItems && plugin.getProfileMenuItems();

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

        messageActions(
          message,
          null,

          plugin.name,

          this.setSettingsPluginDialogVisible,
          this.setCurrentSettingsDialogPlugin,
          this.updatePluginStatus,
          null,
          this.setPluginDialogVisible,
          this.setPluginDialogProps,

          this.updateContextMenuItems,
          this.updateInfoPanelItems,
          this.updateMainButtonItems,
          this.updateProfileMenuItems,
          this.updateEventListenerItems,
          this.updateFileItems,
        );
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

    const items = plugin.getProfileMenuItems && plugin.getProfileMenuItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.profileMenuItems.delete(key);
    });
  };

  updateEventListenerItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items =
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

        messageActions(
          message,
          null,

          plugin.name,

          this.setSettingsPluginDialogVisible,
          this.setCurrentSettingsDialogPlugin,
          this.updatePluginStatus,
          null,
          this.setPluginDialogVisible,
          this.setPluginDialogProps,

          this.updateContextMenuItems,
          this.updateInfoPanelItems,
          this.updateMainButtonItems,
          this.updateProfileMenuItems,
          this.updateEventListenerItems,
          this.updateFileItems,
        );
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

    const items =
      plugin.getEventListenerItems && plugin.getEventListenerItems();

    if (!items) return;

    Array.from(items).forEach(([key]) => {
      this.eventListenerItems.delete(key);
    });
  };

  updateFileItems = (name: string) => {
    const plugin = this.plugins.find((p) => p.name === name);

    if (!plugin || !plugin.enabled) return;

    const items = plugin.getFileItems && plugin.getFileItems();

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
        if (!value.onClick || !correctDevice) return;

        const message = await value.onClick(item);

        messageActions(
          message,
          null,

          plugin.name,

          this.setSettingsPluginDialogVisible,
          this.setCurrentSettingsDialogPlugin,
          this.updatePluginStatus,
          null,
          this.setPluginDialogVisible,
          this.setPluginDialogProps,

          this.updateContextMenuItems,
          this.updateInfoPanelItems,
          this.updateMainButtonItems,
          this.updateProfileMenuItems,
          this.updateEventListenerItems,
          this.updateFileItems,
        );
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

    const items = plugin.getFileItems && plugin.getFileItems();

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
