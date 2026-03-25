// (c) Copyright Ascensio System SIA 2009-2026
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

import {
  ButtonGroup,
  Component,
  IButton,
  IMessage,
} from "@onlyoffice/docspace-plugin-sdk";
import { Dispatch, SetStateAction } from "react";
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

