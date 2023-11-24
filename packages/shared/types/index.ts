import { ThemeType } from "../themes";

export type TInterfaceDirection = "rtl" | "ltr";

export type TColorScheme = {
  id: string | number;
  main: {
    accent: string;
    buttons: string;
  };
  name: string;
  text: {
    accent: string;
    buttons: string;
  };
};

declare module "styled-components" {
  export interface DefaultTheme extends ThemeType {}
}
declare global {
  interface Window {
    firebaseHelper: { config: { authDomain: string } };
  }
}
