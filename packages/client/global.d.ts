import { NavigateFunction, Location } from "react-router-dom";

declare global {
  declare module "*.svg" {
    const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
    export default SVG;
  }
  declare module "*.svg?url" {
    const SVGUrl: string;
    export default SVGUrl;
  }

  declare module "*.png" {
    const IMGUrl: string;
    export default IMGUrl;
  }

  interface Window {
    Tiff: new (arg: object) => any;
    DocSpaceConfig: any;
    DocSpace: {
      location: Location;
      navigate: NavigateFunction;
    };
  }
}
