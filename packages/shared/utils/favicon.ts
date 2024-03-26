import { getLogoFromPath } from "./common";
import { TWhiteLabel } from "./whiteLabelHelper";

export const setFavicon = (whiteLabelLogoUrls: TWhiteLabel[]) => {
  if (!whiteLabelLogoUrls) return;
  const favicon = getLogoFromPath(whiteLabelLogoUrls[2]?.path?.light);

  if (!favicon) return;

  const link: HTMLLinkElement | null = document.querySelector("#favicon-icon");
  if (link) link.href = favicon;

  const shortcutIconLink: HTMLLinkElement | null =
    document.querySelector("#favicon");

  if (shortcutIconLink) shortcutIconLink.href = favicon;

  const appleIconLink: HTMLLinkElement | null = document.querySelector(
    "link[rel~='apple-touch-icon']",
  );

  if (appleIconLink) appleIconLink.href = favicon;

  const androidIconLink: HTMLLinkElement | null = document.querySelector(
    "link[rel~='android-touch-icon']",
  );
  if (androidIconLink) androidIconLink.href = favicon;
};
