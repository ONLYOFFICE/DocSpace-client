import { TTheme } from "../themes";

export type TDirectionX = "left" | "right";
export type TDirectionY = "bottom" | "top" | "both";

export type TViewAs = "tile" | "table" | "row";

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
  }
}
