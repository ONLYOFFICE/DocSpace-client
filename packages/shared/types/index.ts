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

import type { TBreadCrumb } from "../components/selector/Selector.types";
import { RoomsType, ShareAccessRights } from "../enums";
import { TTheme, TColorScheme } from "../themes";
import FirebaseHelper from "../utils/firebase";

export type Option = {
  key: string;
  value: string;
  label: string;
};

export type TWeekdaysLabel = Pick<Option, "key" | "label">;

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row" | "settings" | "profile";

export type ProviderType = {
  provider_id: unknown;
  customer_title: string;
};

export type ConnectedThirdPartyAccountType = {
  id: string;
  title: string;
  providerId: string;
  providerKey: string;
};

export type ThirdPartyAccountType = {
  name: string;
  key: string;
  title: string;
  label: string;
  provider_key: string;
  provider_link?: string;
  storageIsConnected: boolean;
  connected: boolean;
  provider_id?: string;
  id?: string;
  disabled: boolean;
  className?: string;
};

export type BackupToPublicRoomOptionType = {
  breadCrumbs: TBreadCrumb[];
  selectedItemId: number | string | undefined;
  onClose: VoidFunction;
  onSelectFolder: (
    folderId: number | string | undefined,
    breadCrumbs: TBreadCrumb[],
  ) => void;
};

export type TSortOrder = "descending" | "ascending";
export type TSortBy =
  | "DateAndTime"
  | "DateAndTimeCreation"
  | "Tags"
  | "Type"
  | "AZ"
  | "Author"
  | "roomType"
  | "usedspace"
  | "Size";

export type TTranslation = (
  key: string,
  params?: { [key: string]: string | string[] | number },
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

export type WithFlag<K extends string, V> =
  | ({ [P in K]: true } & V)
  | ({ [P in K]?: undefined } & Partial<Record<keyof V, undefined>>);

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type TResolver<Res = VoidFunction, Rej = VoidFunction> = {
  resolve: Res;
  reject: Rej;
};

export type TPathParts = {
  id: number;
  title: string;
  roomType?: RoomsType;
};

export type TCreatedBy = {
  avatarSmall: string;
  avatar?: string;
  avatarOriginal?: string;
  avatarMax?: string;
  avatarMedium?: string;
  displayName: string;
  hasAvatar: boolean;
  id: string;
  profileUrl: string;
  isAnonim?: boolean;
  templateAccess?: ShareAccessRights;
};
export type ConnectingStoragesType = {
  id: string;
  className: string;
  providerKey: string;
  isConnected: boolean;
  isOauth: boolean;
  oauthHref: string;
  category: string;
  requiredConnectionUrl: boolean;
  clientId?: string;
};

export type StorageRegionsType = { displayName: string; systemName: string };

export type PropertiesType = { name: string; title: string; value: string };

export type TI18n = {
  language: string;
  changeLanguage: (l: string) => string;
  t: (...key: string[]) => string;
};

export type SelectedStorageType = {
  id: string;
  isSet: boolean;
  title: string;
  properties: PropertiesType[];
  current?: unknown;
};

declare module "styled-components" {
  export interface DefaultTheme extends TTheme {
    currentColorScheme?: TColorScheme;
  }
}

export interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

declare global {
  interface Window {
    firebaseHelper: FirebaseHelper;
    Asc: unknown;
    zESettings: unknown;
    zE: {
      apply: Function;
    };
    i18n: {
      loaded: {
        [key: string]: { data: { [key: string]: string }; namespaces: string };
      };
    };
    timezone: string;
    snackbar?: {};
    DocSpace: {
      navigate: (path: string, state?: { [key: string]: unknown }) => void;
      location: Location & { state: unknown };
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
        secret: string;
        apiSystem: string[];
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
        enableLogs: boolean;
        logsToConsole: boolean;
      };
      loaders: {
        showLoader: boolean;
        showLoaderTime: number;
        loaderTime: number;
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
      theme?: { id: string; system: string; type: string; addlocal: string };
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
