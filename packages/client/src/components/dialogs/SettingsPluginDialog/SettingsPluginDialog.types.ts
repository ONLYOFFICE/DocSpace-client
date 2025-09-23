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
