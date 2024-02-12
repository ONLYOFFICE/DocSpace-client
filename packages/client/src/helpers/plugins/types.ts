import { TCreatedBy } from "@docspace/shared/types";
import { ButtonProps } from "@docspace/shared/components/button/Button.types";
import { BoxProps } from "@docspace/shared/components/box/Box.types";
import { TextInputProps } from "@docspace/shared/components/text-input";
import { CheckboxProps } from "@docspace/shared/components/checkbox/Checkbox.types";
import { ToggleButtonProps } from "@docspace/shared/components/toggle-button/ToggleButton.types";
import { TextareaProps } from "@docspace/shared/components/textarea/Textarea.types";
import {
  ComboboxProps,
  TOption,
} from "@docspace/shared/components/combobox/Combobox.types";
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
  isCreateDialog: boolean;
  extension?: string;
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
    | ComboboxProps;
  toastProps?: ToastProps[];
  contextProps?: {
    name: string;
    props:
      | BoxProps
      | ButtonProps
      | CheckboxProps
      | ComboboxProps
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
  security?: (
    | keyof TRoomSecurity
    | keyof TFileSecurity
    | keyof TFolderSecurity
  )[];
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
  scopes: string | string[];
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
