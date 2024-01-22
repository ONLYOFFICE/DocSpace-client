import { RoomsType } from "../enums";
import { TTheme } from "../themes";

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row" | "settings" | "profile";

export type TTranslation = (key: string) => string;

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
    firebaseHelper: { config: { authDomain: string } };
    i18n: {
      loaded: {
        [key: string]: { data: { [key: string]: string }; namespaces: string };
      };
    };
    timezone: string;
    snackbar?: {};
    DocSpace: {
      navigate: (path: string) => void;
    };
    DocSpaceConfig: {
      wrongPortalNameUrl?: string;
      api: {
        origin?: string;
        prefix?: string;
      };
      proxy: {
        url?: string;
      };
    };
    AscDesktopEditor: { execCommand: (key: string, value: string) => void };
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
  }
}
