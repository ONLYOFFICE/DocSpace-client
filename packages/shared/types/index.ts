import { TTheme } from "../themes";

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row";

export type TTranslation = (key: string) => string;

export type { TUser } from "./user";

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
    DocSpaceConfig: { wrongPortalNameUrl?: string };
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
