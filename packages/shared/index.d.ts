declare module "*.svg?url" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  import React from "react";

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module "external-remotes-plugin" {}
declare module "csvjson-json_beautifier" {}
