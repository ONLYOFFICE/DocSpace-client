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

declare global {
  interface Window {
    firebaseHelper: any;
  }
}
