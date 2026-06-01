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

import type { TCreatedBy } from "@docspace/shared/types";
import type {
  TFile,
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";

// Import types from SDK
import type {
  IContextMenuItem,
  IEventListenerItem,
  IFileItem,
  IInfoPanelItem,
  IInfoPanelSubMenu,
  IMainButtonItem,
  IProfileMenuItem,
  IArticleButtonItem,
  ISettings,
  IMessage,
  IPostMessage,
  IFrame,
  IImage,
  ICreateDialog,
  IContextMenuPlugin,
  IEventListenerPlugin,
  IFilePlugin,
  IInfoPanelPlugin,
  IMainButtonPlugin,
  IProfileMenuPlugin,
  IArticleButtonPlugin,
  IPlugin,
  IApiPlugin,
  ISettingsPlugin,
  ButtonGroup,
  IFloatingOperationsButton,
  IPostMessageCallbackMessage,
  IPostMessagePlugin,
  IMediaViewer,
} from "@onlyoffice/docspace-plugin-sdk";

import type {
  PluginDevices,
  PluginFileType,
  PluginScopes,
  PluginUsersType,
} from "./enums";

// Re-export SDK types for backward compatibility
export type {
  ISettings,
  IMessage,
  IPostMessageCallbackMessage,
  IPostMessage,
  IFrame,
  IImage,
  ICreateDialog,
  ButtonGroup as TButtonGroup,
};

// items
export type {
  IContextMenuItem,
  IEventListenerItem,
  IFileItem,
  IInfoPanelItem,
  IMainButtonItem,
  IProfileMenuItem,
  IArticleButtonItem,
};

//Extended client-side types
export interface IFloatingOperationsButtonClient
  extends IFloatingOperationsButton {
  pluginName: string;
}

export interface IContextMenuItemClient
  extends Omit<IContextMenuItem, "onClick"> {
  pluginName: string;
  items?: Omit<IContextMenuItemClient, "items">[];
  onClick?: (
    id: number | string,
  ) => Promise<IMessage> | Promise<void> | IMessage | void;
}

export interface IMainButtonItemClient extends IMainButtonItem {
  pluginName: string;
  items?: Omit<IMainButtonItemClient, "items">[];
}

export interface IProfileMenuItemClient extends IProfileMenuItem {
  pluginName: string;
}

export interface IEventListenerItemClient extends IEventListenerItem {
  pluginName: string;
}

interface IInfoPanelItemSubMenuClient
  extends Omit<IInfoPanelSubMenu, "onClick"> {
  onClick: (id: number) => Promise<IMessage | void>;
}

export interface IInfoPanelItemClient extends Omit<IInfoPanelItem, "subMenu"> {
  subMenu: IInfoPanelItemSubMenuClient;
  pluginName: string;
}

export interface IFileItemClient extends Omit<IFileItem, "onClick"> {
  onClick: (item: TFile) => Promise<IMessage> | Promise<void> | void | IMessage;
  fileIcon: string;
  fileIconTile: string;
  pluginName: string;
}

export interface IArticleButtonItemClient extends IArticleButtonItem {
  pluginName: string;
}

export interface IMediaViewerClient extends IMediaViewer {
  pluginName: string;
}

export interface IContextMenuItemValidation {
  type?: PluginFileType;
  fileExst?: string;
  userRole?: PluginUsersType;
  device?: PluginDevices;
  security?: TRoomSecurity | TFolderSecurity;
  itemSecurity?: TFileSecurity | TRoomSecurity | TFolderSecurity;
  itemId?: number | string;
}

// Client-specific window interface
export interface IframeWindow extends Window {
  Plugins: { [key: string]: TPlugin };
}

export type TPlugin = {
  name: string;
  nameLocaleMap?: { [key: string]: string };
  version: string;
  minDocSpaceVersion?: string;
  description: string;
  descriptionLocaleMap?: { [key: string]: string };
  nameLocale: string;
  descriptionLocale: string;
  compatible: boolean;
  license: string;
  author: string;
  homePage: string;
  pluginName: string;
  scopes: PluginScopes | PluginScopes[];
  image: string;
  createBy: TCreatedBy;
  createOn: Date;
  enabled: boolean;
  system: boolean;
  url: string;
  cssUrl?: string;
  settings: string;
  iconUrl: string;
  setLanguage?: (locale: string) => void;
  getLanguage?: () => string;
} & IPlugin &
  Partial<IApiPlugin> &
  Partial<IContextMenuPlugin> &
  Partial<IEventListenerPlugin> &
  Partial<IFilePlugin> &
  Partial<IInfoPanelPlugin> &
  Partial<IMainButtonPlugin> &
  Partial<IProfileMenuPlugin> &
  Partial<ISettingsPlugin> &
  Partial<IPostMessagePlugin> &
  Partial<IArticleButtonPlugin>;
