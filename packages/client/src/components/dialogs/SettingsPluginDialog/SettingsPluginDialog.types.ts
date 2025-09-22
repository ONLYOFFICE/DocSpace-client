import { TTranslation } from "@docspace/shared/types";
import { Dispatch, SetStateAction } from "react";
import {
  ISettings,
  TButtonGroup,
  TPlugin,
} from "SRC_DIR/helpers/plugins/types";
import PluginStore from "SRC_DIR/store/PluginStore";

export type HeaderProps = {
  t: TTranslation;
  name: string;
};

export type FooterProps = {
  t: TTranslation;
  pluginName: string;
  saveButtonProps?: TButtonGroup;
  modalRequestRunning: boolean;
  setModalRequestRunning: Dispatch<SetStateAction<boolean>>;
  onCloseAction: () => void;
  updatePlugin: PluginStore["updatePlugin"];
};

export type InfoProps = {
  t: TTranslation;
  plugin: TPlugin;
  withDelete: boolean;
  withSeparator: boolean;
};

export type SettingsPluginDialogProps = {
  plugin: TPlugin;
  withDelete: boolean;
  pluginSettings?: ISettings | null;
  settingsPluginDialogVisible: boolean;
  updatePlugin: PluginStore["updatePlugin"];
  onClose: () => void;
  onDelete: () => void;
};
