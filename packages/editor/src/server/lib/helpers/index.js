import path from "path";
import fs from "fs";
import { initSSR } from "@docspace/shared/api/client";
import { getUser } from "@docspace/shared/api/people";
import {
  getSettings,
  getBuildVersion,
  getAppearanceTheme,
  getLogoUrls,
} from "@docspace/shared/api/settings";
import {
  openEdit,
  getSettingsFiles,
  // getShareFiles,
} from "@docspace/shared/api/files";
import { TenantStatus } from "@docspace/shared/enums";

import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { getLogoFromPath } from "@docspace/shared/utils";

export const getFavicon = (logoUrls) => {
  if (!logoUrls) return null;

  return getLogoFromPath(logoUrls[2]?.path?.light);
};

export const initDocEditor = async (req) => {
  if (!req) return false;
  let personal = IS_PERSONAL || null;
  const { headers, url, query, type } = req;
  const { version, desktop: isDesktop } = query;
  let error = null,
    user,
    settings,
    filesSettings,
    versionInfo,
    appearanceTheme,
    logoUrls;
  initSSR(headers);

  try {
    const decodedId = query.fileId || query.fileid || null;
    const fileId =
      typeof decodedId === "string" ? encodeURIComponent(decodedId) : decodedId;

    if (!fileId) {
      return {
        props: {
          needLoader: true,
        },
      };
    }

    const doc = query?.doc || null;
    const shareKey = query?.share ?? null;
    const view = url.indexOf("action=view") !== -1;
    const fileVersion = version || null;

    const baseSettings = [
      getUser(null, headers),
      getAppearanceTheme(headers),
      getLogoUrls(headers),
    ];
    let settings;

    try {
      settings = await getSettings(false, headers);
    } catch (err) {
      console.error("initDocEditor settings failed", err);

      return { isSettingsError: true };
    }

    [user, appearanceTheme, logoUrls] = await Promise.all(baseSettings);

    if (settings.tenantStatus === TenantStatus.PortalRestore) {
      error = "restore-backup";
      return { error, logoUrls };
    }

    [filesSettings, versionInfo] = await Promise.all([
      getSettingsFiles(headers),
      getBuildVersion(headers),
    ]);

    const successAuth = !!user;

    personal = settings?.personal;

    if (!successAuth && !doc && !shareKey) {
      error = {
        unAuthorized: true,
      };
      return { error };
    }

    const config = await openEdit(
      fileId,
      fileVersion,
      doc,
      view,
      headers,
      shareKey
    );

    //const sharingSettings = await getShareFiles([+fileId], []);

    const isSharingAccess = config?.file?.canShare;

    if (view) {
      config.editorConfig.mode = "view";
    }

    if (type) {
      config.type = type;
    }

    // logoUrls.forEach((logo, index) => {
    //   logoUrls[index].path.dark = getLogoFromPath(logo.path.dark);
    //   logoUrls[index].path.light = getLogoFromPath(logo.path.dark);
    // });

    // change only for default logo
    if (
      config?.editorConfig?.customization?.logo?.image.indexOf("images/logo/") >
      -1
    ) {
      config.editorConfig.customization.logo.image =
        config.editorConfig.customization.logo.url +
        getLogoFromPath(config.editorConfig.customization.logo.image);
    }

    // change only for default logo
    if (
      config?.editorConfig?.customization?.logo?.imageDark.indexOf(
        "images/logo/"
      ) > -1
    ) {
      config.editorConfig.customization.logo.imageDark =
        config.editorConfig.customization.logo.url +
        getLogoFromPath(config.editorConfig.customization.logo.imageDark);
    }

    if (
      config.editorConfig.customization.customer &&
      config.editorConfig.customization.customer.logo.indexOf("images/logo/") >
        -1
    ) {
      config.editorConfig.customization.customer.logo =
        config.editorConfig.customization.logo.url +
        getLogoFromPath(config.editorConfig.customization.customer.logo);
    }
    // needed to reset rtl language in Editor
    config.editorConfig.lang = getLtrLanguageForEditor(
      user?.cultureName,
      settings.culture,
      true
    );

    return {
      config,
      personal,
      successAuth,
      user,
      error,
      isSharingAccess,
      url,
      doc,
      fileId,
      view,
      filesSettings,
      //sharingSettings,
      portalSettings: settings,
      versionInfo,
      appearanceTheme,
      logoUrls,
    };
  } catch (err) {
    console.error("initDocEditor failed", err);
    let message = "";
    if (typeof err === "string") message = err;
    else message = err.response?.data?.error?.message || err.message;

    const errorStatus =
      typeof err !== "string"
        ? err?.response?.data?.statusCode || err?.response?.data?.status
        : null;

    error = {
      errorMessage: message,
      errorStatus,
    };
    return { error, user, logoUrls };
  }
};

export const getAssets = () => {
  const manifest = fs.readFileSync(
    path.join(__dirname, "client/manifest.json"),
    "utf-8"
  );

  const assets = JSON.parse(manifest);

  return assets;
};

export const getScripts = (assets) => {
  const regTest = /static\/js\/.*/;
  const keys = [];

  for (let key in assets) {
    if (assets.hasOwnProperty(key) && regTest.test(key)) {
      keys.push(key);
    }
  }

  return keys;
};
