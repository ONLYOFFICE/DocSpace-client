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
import { TFunction } from "i18next";

import { TColorScheme, TTheme } from "@docspace/shared/themes";
import { TTranslation } from "@docspace/shared/types";

import { PluginScopes } from "SRC_DIR/helpers/plugins/enums";
import { TPlugin } from "SRC_DIR/helpers/plugins/types";

export interface PluginDropzoneProps {
  onDrop: <T extends File>(acceptedFiles: T[]) => void;
  isLoading: boolean;
  isDisabled: boolean;
  dataTestId?: string;
}

export interface PluginsEmptyScreen {
  t: TTranslation;
  theme: TTheme;
  withUpload: boolean;
  apiPluginSDKLink: string | undefined;
  currentColorScheme: TColorScheme;
  onDrop: <T extends File>(acceptedFiles: T[]) => void;
}

export interface PluginItemProps {
  name: string;
  version: string;
  description?: string;

  enabled: boolean;
  updatePlugin: (
    name: string,
    status: boolean,
    settings?: string,
    t?: TFunction,
  ) => Promise<unknown>;

  scopes: PluginScopes | PluginScopes[];

  openSettingsDialog: (name: string) => void;

  image: string;
  url: string;

  dataTestId?: string;
}

export interface ListLoaderProps {
  withUpload: boolean;
}

export interface PluginsProps {
  withUpload: boolean;

  pluginList: TPlugin[];

  openSettingsDialog: (name: string) => void;

  updatePlugin: (
    name: string,
    status: boolean,
    settings?: string,
  ) => Promise<unknown>;
  addPlugin: (data: FormData) => Promise<void>;

  updatePlugins: (fromList?: boolean) => Promise<void>;

  currentColorScheme: TColorScheme;
  theme: TTheme;

  isLoading: boolean;
  isEmptyList: boolean;

  apiPluginSDKLink: string | undefined;

  isPortalSettingsLoading: boolean;
}

export interface UploadDecsriptionProps {
  apiPluginSDKLink: string | undefined;
  currentColorScheme: TColorScheme;
  t: TTranslation;
}
