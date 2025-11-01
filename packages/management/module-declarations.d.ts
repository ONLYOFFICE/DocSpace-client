declare module "csvjson-json_beautifier" {
  export default function jsonBeautifier(
    json: string,
    options?: unknown,
  ): string;
}

declare module "resize-image" {
  type ImageFormat = "png" | "gif" | "bmp" | "jpeg" | "webp";

  type ImageTypes = {
    [P in Uppercase<ImageFormat>]: Lowercase<P>;
  };

  interface ResizeImage extends ImageTypes {
    resize2Canvas: (
      img: HTMLImageElement | ImageBitmap,
      width: number,
      height: number,
    ) => HTMLCanvasElement;
    resize: (
      img: HTMLImageElement | HTMLCanvasElement,
      width: number,
      height: number,
      type?: ImageFormat,
    ) => string;
  }

  const value: ResizeImage;
  export default value;
}
