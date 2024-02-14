import {
  TGetColorTheme,
  TSettings,
  TVersionBuild,
} from "../api/settings/types";
import { TUser } from "../api/people/types";
import { RoomsType } from "../enums";
import { TTheme } from "../themes";
import FirebaseHelper from "../utils/firebase";

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row" | "settings" | "profile";

export type TTranslation = (key: string) => string;

export type Nullable<T> = T | null;

export type NonFunctionPropertyNames<T, ExcludeTypes> = {
  [K in keyof T]: T[K] extends ExcludeTypes ? never : K;
}[keyof T];

export type NonFunctionProperties<T, ExcludeTypes> = Pick<
  T,
  NonFunctionPropertyNames<T, ExcludeTypes>
>;

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
  export interface DefaultTheme extends TTheme { }
}
declare global {
  interface Window {
    firebaseHelper: FirebaseHelper;
    __ASC_INITIAL_EDITOR_STATE__?: {
      user: TUser;
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
    };
    DocSpaceConfig: {
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
      firebase: {
        fetchTimeoutMillis?: number;
        minimumFetchIntervalMillis?: number;
      };
      campaigns?: string[];
    };
    AscDesktopEditor: {
      execCommand: (key: string, value: string) => void;
      cloudCryptoCommand: (
        key: string,
        value: unknown,
        callback: unknown,
      ) => void;
    };
    cloudCryptoCommand: (
      type: string,
      params: string[],
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
  }

  export type ContextMenuModel =
    import("../components/context-menu/ContextMenu.types").ContextMenuModel;

  export type SeparatorType =
    import("../components/context-menu/ContextMenu.types").SeparatorType;
}
