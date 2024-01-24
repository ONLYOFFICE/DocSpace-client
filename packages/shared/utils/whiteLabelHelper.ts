/* eslint-disable no-console */
import axios from "axios";
import isEqual from "lodash/isEqual";

export type TWhiteLabel = {
  path: { light: string; dark: string };
  name: string;
};

export const generateLogo = (
  width: number,
  height: number,
  text: string,
  alignCenter: boolean,
  fontSize: number = 18,
  fontColor: string = "#000",
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  const x = alignCenter ? width / 2 : 0;

  if (ctx) {
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = fontColor;
    ctx.textAlign = alignCenter ? "center" : "start";
    ctx.textBaseline = "middle";
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, x, height - fontSize / 2);
  }

  return canvas.toDataURL();
};

export const getLogoOptions = (index: number, text: string) => {
  switch (index) {
    case 0:
      return { fontSize: 18, text, width: 211, height: 24 };
    case 1:
      return { fontSize: 32, text, width: 384, height: 42 };
    case 2:
      return {
        fontSize: 26,
        text: text.trim().charAt(0),
        width: 30,
        height: 30,
        alignCenter: true,
      };
    case 3:
      return { fontSize: 22, text, width: 154, height: 27 };
    case 4:
      return { fontSize: 22, text, width: 154, height: 27 };
    case 5:
      return {
        fontSize: 24,
        text: text.trim().charAt(0),
        width: 28,
        height: 28,
        alignCenter: true,
      };
    case 6:
      return { fontSize: 18, text, width: 211, height: 24 };
    default:
      return { fontSize: 18, text, width: 211, height: 24 };
  }
};

const getUploadedFileDimensions = (file: File) =>
  new Promise((resolve, reject) => {
    try {
      const img = new Image();

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL(img.src);

        resolve({ width, height });
      };

      img.src = window.URL.createObjectURL(file);
    } catch (exception: unknown) {
      reject(exception);
    }
  });

export const uploadLogo = async (file: File) => {
  try {
    const fileDimensions = (await getUploadedFileDimensions(file)) as {
      width: string;
      height: string;
    };
    if (fileDimensions) {
      const { width, height }: { width: string; height: string } =
        fileDimensions;

      const data = new FormData();
      data.append("file", file);
      data.append("width", width);
      data.append("height", height);

      return await axios.post("/logoUploader.ashx", data);
    }
  } catch (error) {
    console.error(error);
  }
};

export const getNewLogoArr = (
  logoUrlsWhiteLabel: TWhiteLabel[],
  defaultWhiteLabelLogoUrls: TWhiteLabel[],
) => {
  const logosArr = [];

  for (let i = 0; i < logoUrlsWhiteLabel.length; i += 1) {
    const currentLogo = logoUrlsWhiteLabel[i];
    const defaultLogo = defaultWhiteLabelLogoUrls[i];

    if (!isEqual(currentLogo, defaultLogo)) {
      const value: { light?: string; dark?: string } = {};

      if (!isEqual(currentLogo.path.light, defaultLogo.path.light))
        value.light = currentLogo.path.light;
      if (!isEqual(currentLogo.path.dark, defaultLogo.path.dark))
        value.dark = currentLogo.path.dark;

      logosArr.push({
        key: String(i + 1),
        value,
      });
    }
  }
  return logosArr;
};

export const getLogosAsText = (
  logoUrlsWhiteLabel: TWhiteLabel[],
  logoTextWhiteLabel: string,
) => {
  const newLogos = logoUrlsWhiteLabel;
  for (let i = 0; i < logoUrlsWhiteLabel.length; i += 1) {
    const options = getLogoOptions(i, logoTextWhiteLabel);
    const isDocsEditorName = logoUrlsWhiteLabel[i].name === "DocsEditor";

    const logoLight = generateLogo(
      options.width,
      options.height,
      options.text,
      options.alignCenter || false,
      options.fontSize,
      isDocsEditorName ? "#fff" : "#000",
    );
    const logoDark = generateLogo(
      options.width,
      options.height,
      options.text,
      options.alignCenter || false,
      options.fontSize,
      "#fff",
    );
    newLogos[i].path.light = logoLight;
    newLogos[i].path.dark = logoDark;
  }
  return newLogos;
};
