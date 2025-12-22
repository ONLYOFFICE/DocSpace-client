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
  IPlugin,
  IApiPlugin,
  ISettingsPlugin,
  ButtonGroup,
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
};

//Extended client-side types
export interface IContextMenuItemClient extends IContextMenuItem {
  pluginName: string;
  items?: Omit<IContextMenuItemClient, "items">[];
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

export interface IContextMenuItemValidation {
  type?: PluginFileType;
  fileExst?: string;
  userRole?: PluginUsersType;
  device?: PluginDevices;
  security?: TRoomSecurity | TFolderSecurity;
  itemSecurity?: TFileSecurity | TRoomSecurity | TFolderSecurity;
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
  Partial<ISettingsPlugin>;
