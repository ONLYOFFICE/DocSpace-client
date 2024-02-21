import type { TTheme } from "@docspace/shared/themes";
import type store from "./src/store";
import "@docspace/shared/index.d";

declare module "*.svg" {
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
declare module "*.svg?url" {
  const SVGUrl: string;
  export default SVGUrl;
}

declare global {
  type TStore = typeof store;

  interface Window {
    theme: TTheme;
  }
}
