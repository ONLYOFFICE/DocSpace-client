import UTIF from "utif";

export const decodeTiff = (arrayBuffer: ArrayBuffer): Promise<Blob | null> => {
  const ifds = UTIF.decode(arrayBuffer);
  UTIF.decodeImage(arrayBuffer, ifds[0]);

  const rgb = UTIF.toRGBA8(ifds[0]);

  const pixels = new Uint8ClampedArray(rgb);
  const image = new ImageData(pixels, ifds[0].width, ifds[0].height);

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");

  return new Promise((resolve) => {
    ctx?.putImageData(image, 0, 0);
    canvas.toBlob(resolve);
  });
};
