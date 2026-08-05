/// <reference types="vite/client" />

// SVG imports as React components (default, without ?url)
declare module "*.svg" {
  import type React from "react";
  const SVGComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default SVGComponent;
}

// SVG imports as URL strings (with ?url suffix)
declare module "*.svg?url" {
  const src: string;
  export default src;
}

// JSON imports as URL strings (with ?url suffix)
declare module "*.json?url" {
  const src: string;
  export default src;
}

// Image imports
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.gif" {
  const src: string;
  export default src;
}
declare module "*.ico" {
  const src: string;
  export default src;
}
declare module "*.woff2" {
  const src: string;
  export default src;
}

// SCSS modules
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Global constants injected by Vite's define config
declare const VERSION: string;
declare const BUILD_AT: string;
// Per-language md5 of the combined locale bundle, used as a ?hash= cache-buster.
declare const COMBINED_LOCALE_HASHES: Record<string, string>;
