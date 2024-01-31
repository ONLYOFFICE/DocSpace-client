import UTIF from "utif";

export const encoderTiff = (arrayBuffer: ArrayBuffer): string => {
  const ifds = UTIF.decode(arrayBuffer);
  UTIF.decodeImage(arrayBuffer, ifds[0]);

  const rgb = UTIF.toRGBA8(ifds[0]);

  const pixels = new Uint8ClampedArray(rgb);
  const image = new ImageData(pixels, ifds[0].width, ifds[0].height);

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx?.putImageData(image, 0, 0);

  const url = canvas.toDataURL();

  return url;
};
