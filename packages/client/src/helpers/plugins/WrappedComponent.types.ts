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
