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

import { TCreatedBy } from "@docspace/shared/types";
import { ButtonProps } from "@docspace/shared/components/button/Button.types";
import { BoxProps } from "@docspace/shared/components/box/Box.types";
import { TextInputProps } from "@docspace/shared/components/text-input";
import { CheckboxProps } from "@docspace/shared/components/checkbox/Checkbox.types";
import { ToggleButtonProps } from "@docspace/shared/components/toggle-button/ToggleButton.types";
import { TextareaProps } from "@docspace/shared/components/textarea/Textarea.types";
import {
  TComboboxProps,
  TOption,
} from "@docspace/shared/components/combobox/ComboBox.types";
import { ToastProps } from "@docspace/shared/components/toast/Toast.type";
import { ModalDialogProps } from "@docspace/shared/components/modal-dialog/ModalDialog.types";
import { TextProps } from "@docspace/shared/components/text/Text.types";
import { RectangleSkeletonProps } from "@docspace/shared/skeletons";
import { LabelProps } from "@docspace/shared/components/label/Label.types";
import {
  TFile,
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import {
  PluginActions,
  PluginComponents,
  PluginDevices,
  PluginEvents,
  PluginFileType,
  PluginScopes,
  PluginStatus,
  PluginUsersType,
} from "./enums";

export interface IPostMessage {
  frameId: string;
  message: { [key: string]: unknown };
}

export interface IFrame {
  src: string;
  width?: string;
  height?: string;
  name?: string;
  sandbox?: string;
  id?: string;
  style?: { [key: string]: string };
}

export interface ICreateDialog {
  title: string;
  startValue: string;
  visible: boolean;
  options?: TOption[];
  selectedOption?: TOption;
  onSelect?: (option: TOption) => IMessage | void;
  onSave?: (
    e: unknown,
    value: string,
  ) => Promise<IMessage> | Promise<void> | IMessage | void;
  onCancel?: (e: unknown) => void;
  onClose?: (e: unknown) => void;
  onChange?: (value: string) => void;
  isCreateDialog: boolean;
  extension?: string;
  errorText?: string;
  isAutoFocusOnError?: boolean;
}

export interface IImage {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  name?: string;
  id?: string;
  style?: { [key: string]: string };
}

export interface IMessage {
  actions?: PluginActions[];
  newProps?:
    | TextInputProps
    | CheckboxProps
    | ToggleButtonProps
    | ButtonProps
    | TextareaProps
    | TComboboxProps;
  toastProps?: ToastProps[];
  contextProps?: {
    name: string;
    props:
      | BoxProps
      | ButtonProps
      | CheckboxProps
      | TComboboxProps
      | IFrame
      | IImage
      | TextInputProps
      | LabelProps
      | RectangleSkeletonProps
      | TextProps
      | TextareaProps
      | ToggleButtonProps;
  }[];
  createDialogProps?: ICreateDialog;
  modalDialogProps?: ModalDialogProps;
  postMessage?: IPostMessage;
  settings?: string;
}

type TButtonGroup = {
  component: PluginComponents.button;
  props: ButtonProps;
  contextName?: string;
};

export interface ISettings {
  settings: BoxProps;
  saveButton: TButtonGroup;
  isLoading?: boolean;
  onLoad?: () => Promise<{ settings: BoxProps; saveButton?: TButtonGroup }>;
}

export interface IContextMenuItem {
  key: string;
  label: string;
  icon: string;
  onClick: (id: number) => Promise<IMessage> | Promise<void> | IMessage | void;
  withActiveItem?: boolean;
  fileExt?: string[];
  fileType?: PluginFileType[];
  usersTypes?: PluginUsersType[];
  devices?: PluginDevices[];
  fileSecurity?: (keyof TFileSecurity)[];
  security?: (keyof TRoomSecurity | keyof TFolderSecurity)[];
  pluginName?: string;
}

export interface IEventListenerItem {
  key: string;
  eventType: PluginEvents;
  eventHandler: () => Promise<IMessage> | Promise<void> | IMessage | void;
  usersTypes?: PluginUsersType[];
  devices?: PluginDevices[];
  pluginName?: string;
}

export interface IFileItem {
  extension: string;
  onClick: (item: TFile) => Promise<IMessage> | Promise<void> | IMessage | void;
  usersType?: PluginUsersType[];
  devices?: PluginDevices[];
  fileTypeName?: string;
  fileRowIcon?: string;
  fileTileIcon?: string;
  fileIcon?: string;
  fileIconTile?: string;
  pluginName?: string;
}

export interface IInfoPanelSubMenu {
  name: string;
  onClick?: (id: number) => Promise<IMessage> | Promise<void> | IMessage | void;
}

export interface IInfoPanelItem {
  key: string;
  subMenu: IInfoPanelSubMenu;
  body: BoxProps;
  onLoad: () => Promise<{ body: BoxProps }>;
  filesType?: PluginFileType[];
  filesExsts?: string[];
  usersTypes?: PluginUsersType[];
  devices?: PluginDevices[];
  pluginName?: string;
}

export interface IMainButtonItem {
  key: string;
  label: string;
  icon: string;
  onClick?: (
    id: number | string,
  ) => Promise<IMessage> | Promise<void> | IMessage | void;
  usersType?: PluginUsersType[];
  items?: IMainButtonItem[] | null;
  devices?: PluginDevices[];
  pluginName?: string;
}

export interface IProfileMenuItem {
  key: string;
  label: string;
  icon: string;
  onClick: () => Promise<IMessage> | Promise<void> | IMessage | void;
  usersType?: PluginUsersType[];
  devices?: PluginDevices[];
  pluginName?: string;
}

export interface IframeWindow extends Window {
  Plugins: { [key: string]: TPlugin };
}

export type TPlugin = {
  name: string;
  version: string;
  description: string;
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

  status: PluginStatus;
  onLoadCallback: () => Promise<void>;
  updateStatus: (status: PluginStatus) => void;
  getStatus: () => PluginStatus;
  setOnLoadCallback: (callback: () => Promise<void>) => void;

  adminPluginSettings?: ISettings | null;
  setAdminPluginSettings?: (settings: ISettings | null) => void;
  setAdminPluginSettingsValue?: (settings: string | null) => void;
  getAdminPluginSettings?: () => ISettings | null;

  origin?: string;
  proxy?: string;
  prefix?: string;
  setOrigin?: (origin: string) => void;
  setProxy?: (proxy: string) => void;
  setPrefix?: (prefix: string) => void;
  getOrigin?: () => string;
  getProxy?: () => string;
  getPrefix?: () => string;
  setAPI?: (origin: string, proxy: string, prefix: string) => void;
  getAPI?: () => { origin: string; proxy: string; prefix: string };

  contextMenuItems: Map<string, IContextMenuItem>;
  addContextMenuItem(item: IContextMenuItem): void;
  getContextMenuItems(): Map<string, IContextMenuItem>;
  getContextMenuItemsKeys(): string[];
  updateContextMenuItem(item: IContextMenuItem): void;

  eventListenerItems?: Map<string, IEventListenerItem>;
  addEventListenerItem?: (item: IEventListenerItem) => void;
  getEventListenerItems?: () => Map<string, IEventListenerItem>;

  fileItems?: Map<string, IFileItem>;
  addFileItem?: (item: IFileItem) => void;
  getFileItems?: () => Map<string, IFileItem>;
  updateFileItem?: (item: IFileItem) => void;

  infoPanelItems?: Map<string, IInfoPanelItem>;
  addInfoPanelItem?: (item: IInfoPanelItem) => void;
  getInfoPanelItems?: () => Map<string, IInfoPanelItem>;
  updateInfoPanelItem?: (item: IInfoPanelItem) => void;

  mainButtonItems?: Map<string, IMainButtonItem>;
  addMainButtonItem?: (item: IMainButtonItem) => void;
  getMainButtonItems?: () => Map<string, IMainButtonItem>;
  updateMainButtonItem?: (item: IMainButtonItem) => void;

  profileMenuItems?: Map<string, IProfileMenuItem>;
  addProfileMenuItem?: (item: IProfileMenuItem) => void;
  getProfileMenuItems?: () => Map<string, IProfileMenuItem>;
  updateProfileMenuItem?: (item: IProfileMenuItem) => void;
};
