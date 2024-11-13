// (c) Copyright Ascensio System SIA 2009-2024
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
  TGetColorTheme,
  TSettings,
  TVersionBuild,
} from "../api/settings/types";
import { RoomsType } from "../enums";
import { TTheme } from "../themes";
import FirebaseHelper from "../utils/firebase";

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row" | "settings" | "profile";

export type TSortOrder = "descending" | "ascending";
export type TSortBy = "DateAndTime" | "Tags" | "AZ";

export type TTranslation = (
  key: string,
  params?: { [key: string]: string | string[] },
) => string;

export type Nullable<T> = T | null;

export type NonFunctionPropertyNames<T, ExcludeTypes> = {
  [K in keyof T]: T[K] extends ExcludeTypes ? never : K;
}[keyof T];

export type NonFunctionProperties<T, ExcludeTypes> = Pick<
  T,
  NonFunctionPropertyNames<T, ExcludeTypes>
>;

export type MergeTypes<T, MergedType> = Omit<T, keyof MergedType> & MergedType;

export type TPathParts = {
  id: number;
  title: string;
  roomType?: RoomsType;
};

export type TCreatedBy = {
  avatarSmall: string;
  displayName: string;
  hasAvatar: boolean;
  id: string;
  profileUrl: string;
};

export type TI18n = {
  language: string;
  changeLanguage: (l: string) => string;
  t: (...key: string[]) => string;
};

declare module "styled-components" {
  export interface DefaultTheme extends TTheme {}
}
declare global {
  interface Window {
    firebaseHelper: FirebaseHelper;
    __ASC_INITIAL_EDITOR_STATE__?: {
      user: unknown;
      portalSettings: TSettings;
      appearanceTheme: TGetColorTheme;
      versionInfo: TVersionBuild;
    };
    zESettings: {};
    zE: {};
    i18n: {
      loaded: {
        [key: string]: { data: { [key: string]: string }; namespaces: string };
      };
    };
    timezone: string;
    snackbar?: {};
    DocSpace: {
      navigate: (path: string, state?: { [key: string]: unknown }) => void;
      location: Location;
    };
    logs: {
      socket: string[];
    };
    ClientConfig?: {
      pdfViewerUrl: string;
      wrongPortalNameUrl?: string;
      api: {
        origin?: string;
        prefix?: string;
      };
      proxy: {
        url?: string;
      };
      imageThumbnails?: boolean;
      oauth2: {
        origin: string;
      };
      editor?: {
        requestClose: boolean;
      };
      firebase: {
        fetchTimeoutMillis?: number;
        minimumFetchIntervalMillis?: number;
      };
      campaigns?: string[];
      isFrame?: boolean;
      management: {
        checkDomain?: boolean;
      };
      logs: {
        enableLogs: false;
        logsToConsole: false;
      };
    };
    AscDesktopEditor: {
      execCommand: (key: string, value: string) => void;
      cloudCryptoCommand: (
        key: string,
        value: unknown,
        callback: unknown,
      ) => void;
      getViewportSettings?: () => {
        widgetType: "window" | "tab";
        captionHeight: number;
      };
      onViewportSettingsChanged?: VoidFunction;
      attachEvent?: (listener: string, callback: VoidFunction) => void;
    };
    cloudCryptoCommand: (
      type: string,
      params: { [key: string]: string | boolean },
      callback: (obj?: {}) => void,
    ) => void;
    onSystemMessage: (e: {
      type: string;
      opMessage?: string;
      opType: number;
    }) => void;
    RendererProcessVariable: {
      theme?: { id: string; system: string };
    };
    Tiff: new (arg: object) => {
      toDataURL: () => string;
    };
    dataLayer?: Record<string, unknown>[];
    errorOnLoad?: Error;
    authCallback?: (profile: string) => Promise<void>;
  }

  export type ContextMenuModel =
    import("../components/context-menu/ContextMenu.types").ContextMenuModel;

  export type SeparatorType =
    import("../components/context-menu/ContextMenu.types").SeparatorType;
}
