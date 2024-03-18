import { getLogoFromPath } from "./common";
import { TWhiteLabel } from "./whiteLabelHelper";

export const setFavicon = (whiteLabelLogoUrls: TWhiteLabel[]) => {
  if (!whiteLabelLogoUrls) return;
  const favicon = getLogoFromPath(whiteLabelLogoUrls[2]?.path?.light);

  if (!favicon) return;

  const link: HTMLLinkElement = document.querySelector("#favicon-icon");
  link.href = favicon;

  const shortcutIconLink: HTMLLinkElement = document.querySelector("#favicon");
  shortcutIconLink.href = favicon;

  const appleIconLink: HTMLLinkElement = document.querySelector(
    "link[rel~='apple-touch-icon']",
  );

  if (appleIconLink) appleIconLink.href = favicon;

  const androidIconLink: HTMLLinkElement = document.querySelector(
    "link[rel~='android-touch-icon']",
  );
  if (androidIconLink) androidIconLink.href = favicon;
};
