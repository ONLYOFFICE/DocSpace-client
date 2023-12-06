import { TTheme } from "../themes";

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
  }
}
