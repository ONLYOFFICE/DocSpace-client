import { ThemeType, TColorScheme } from "../themes";

export type TInterfaceDirection = "rtl" | "ltr";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeType {}
}
declare global {
  interface Window {
    firebaseHelper: { config: { authDomain: string } };
  }
}

export { TColorScheme };
