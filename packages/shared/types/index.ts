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

export * from "@docspace/ui-kit/types";

import type { TFile, TFileLink, TFolder } from "../api/files/types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type {
  FolderType,
  RoomsType,
  ShareAccessRights,
  ShareRights,
} from "../enums";
import type { TTheme, TColorScheme } from "@docspace/ui-kit/providers/theme";
import type FirebaseHelper from "../utils/firebase";
import type { TRoom } from "../api/rooms/types";

export type { TDirectionX, TDirectionY } from "@docspace/ui-kit/types";

export type Option = {
  key: string;
  value: string;
  label: string;
};

export type TWeekdaysLabel = Pick<Option, "key" | "label">;

export type TViewAs =
  | "tile"
  | "table"
  | "row"
  | "settings"
  | "profile"
  | "tileDynamicHeight";

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
  params?: Record<string, unknown>,
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
  folderType?: FolderType;
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

export interface LinkParamsType {
  link: TFileLink;
  item: TFile | TFolder | TRoom;

  updateLink?: (newLink: TFileLink) => void;
}

export type TShareLinkAccessRightOption = {
  key: string;
  icon: string;
  label: string;
  access: ShareAccessRights;
  description?: string;
  title?: string;
};

export type TShareToUserAccessRightOption = {
  key: string;
  label: string;
  access: ShareAccessRights;
  description?: string;
  isSeparator?: boolean;
};

export type ValueOf<T> = T[keyof T];

declare global {
  interface Window {
    firebaseHelper: FirebaseHelper;
    Asc: unknown;
    zESettings: unknown;
    zE: {
      apply: (...args: unknown[]) => void;
    };
    i18n?: {
      t?: (key: string, options?: Record<string, string | number>) => string;
      inLoad: { url: string; callbacks: Function[] }[];
      loaded: Record<
        string,
        { data: Record<string, string>; namespaces: string }
      >;
      instance?: import("i18next").i18n;
    };
    timezone: string;
    snackbar?: object;
    DocSpace: {
      navigate: (path: string, state?: { [key: string]: unknown }) => void;
      location: Location & { state: unknown };
      displayFileExtension?: boolean;
    };
    loginCallback?: ((profile: unknown) => void) | null;
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
    AscDesktopEditor?: {
      execCommand: (key: string, value: string) => void;
      cloudCryptoCommand: (
        key: string,
        value: unknown,
        callback: unknown,
      ) => void;
      getCloudKeys?: (domain: string) => Array<{ id: string }>;
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
      callback: (obj?: object) => void,
    ) => void;
    onSystemMessage: (e: {
      type: string;
      opMessage?: string;
      opType: number;
    }) => void;
    RendererProcessVariable?: {
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
    import("@docspace/ui-kit/components/context-menu").ContextMenuModel;

  export type SeparatorType =
    import("@docspace/ui-kit/components/context-menu").SeparatorType;
}

export type TDefaultTemplateItem = {
  id: number | null;
  title?: string;
  isModified?: boolean;
  lastModified?: string;
  fileExst: string;
  fileSize: number;
  viewUrl: string;
};
