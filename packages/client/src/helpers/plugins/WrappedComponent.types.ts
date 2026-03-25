// ---------------------------------------------------------------------------
// WrappedComponent types
// ---------------------------------------------------------------------------

import {
  ButtonGroup,
  Component,
  IButton,
  IMessage,
} from "@onlyoffice/docspace-plugin-sdk";
import { Dispatch, SetStateAction } from "react";
import { TMessageActionsParams } from "./types";
import PluginStore from "SRC_DIR/store/PluginStore";

export type TAllComponentProps = Component["props"];

export type TContextProps = Record<string, TAllComponentProps>;

export type TPropsContext = {
  contextProps: TContextProps;
  updatePropsContext: (
    newContextProps: NonNullable<IMessage["contextProps"]>,
  ) => void;
  isRequestRunning: boolean;
  setIsRequestRunning: Dispatch<SetStateAction<boolean>>;
  setModalRequestRunning?: (value: boolean) => void;
  modalRequestRunning?: boolean;
};

export type TButtonElementProps = IButton & {
  isSaveButton?: boolean;
  settingsModalRequestRunning?: boolean;
  setSettingsModalRequestRunning?: (value: boolean) => void;
  onCloseAction?: () => void;
};

export type TPluginStoreInjected = {
  getPluginIconUrl: PluginStore["getPluginIconUrl"];
  setSettingsPluginDialogVisible: PluginStore["setSettingsPluginDialogVisible"];
  updatePluginStatus: PluginStore["updatePluginStatus"];
  setPluginDialogVisible: PluginStore["setPluginDialogVisible"];
  updateContextMenuItems: PluginStore["updateContextMenuItems"];
  updateInfoPanelItems: PluginStore["updateInfoPanelItems"];
  setPluginDialogProps: PluginStore["setPluginDialogProps"];
  updateMainButtonItems: PluginStore["updateMainButtonItems"];
  updateProfileMenuItems: PluginStore["updateProfileMenuItems"];
  updateEventListenerItems: PluginStore["updateEventListenerItems"];
  updateFileItems: PluginStore["updateFileItems"];
  updatePlugin: PluginStore["updatePlugin"];
  setPluginSelectorVisible: PluginStore["setPluginSelectorVisible"];
  setPluginSelectorProps: PluginStore["setPluginSelectorProps"];
  setPluginMediaViewerVisible: PluginStore["setPluginMediaViewerVisible"];
  setPluginMediaViewerProps: PluginStore["setPluginMediaViewerProps"];
};

export type TPluginComponentOwnProps = {
  component: Component;
  pluginName: string;
};

export type TPluginComponentProps = TPluginComponentOwnProps &
  TPluginStoreInjected;

export type TWrappedComponentProps = {
  pluginName: string;
  component: Component;
  saveButton?: ButtonGroup & { contextName?: string };
  setSaveButtonProps?: Dispatch<SetStateAction<ButtonGroup | undefined>>;
  setModalRequestRunning?: (value: boolean) => void;
  modalRequestRunning?: boolean;
};

