import { TFile } from "@docspace/shared/api/files/types";

export type TDeepLinkerOptions = {
  onReturn?: () => void;
  onFallback?: () => void;
  onIgnored?: () => void;
};

type TDeepLinkerThis = {
  openURL: (url: Location | (string & Location)) => void;
  destroy: () => void;
};

const DeepLinker = function (
  this: TDeepLinkerThis,
  options: TDeepLinkerOptions,
) {
  if (!options) {
    throw new Error("no options");
  }

  let hasFocus = true;
  let didHide = false;

  function onBlur() {
    hasFocus = false;
  }

  function onVisibilityChange(e: Event) {
    const target = e.target as Document;
    if (target.visibilityState === "hidden") {
      didHide = true;
    }
  }

  function onFocus() {
    if (didHide) {
      if (options.onReturn) {
        options.onReturn();
      }

      didHide = false;
    } else {
      if (!hasFocus && options.onFallback) {
        setTimeout(function () {
          if (!didHide) {
            options.onFallback?.();
          }
        }, 3000);
      }
    }

    hasFocus = true;
  }

  function bindEvents(mode: "add" | "remove") {
    [
      [window, "blur", onBlur],
      [document, "visibilitychange", onVisibilityChange],
      [window, "focus", onFocus],
    ].forEach(function (conf) {
      switch (mode) {
        case "add":
          if (
            typeof conf[0] !== "string" &&
            typeof conf[0] !== "function" &&
            typeof conf[1] === "string" &&
            typeof conf[2] === "function"
          )
            conf[0].addEventListener(conf[1], conf[2]);
          break;
        case "remove":
          if (
            typeof conf[0] !== "string" &&
            typeof conf[0] !== "function" &&
            typeof conf[1] === "string" &&
            typeof conf[2] === "function"
          )
            conf[0].removeEventListener(conf[1], conf[2]);
          break;
        default:
          break;
      }
    });
  }

  bindEvents("add");

  this.destroy = bindEvents.bind(null, "remove");
  this.openURL = function (url) {
    var dialogTimeout = 500;

    setTimeout(function () {
      if (hasFocus && options.onIgnored) {
        options.onIgnored();
      }
    }, dialogTimeout);

    window.location = url;
  };
};

function bytesToBase64(bytes: number[]) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

export type TDeepLinkConfig = {
  iosPackageId: string;
  androidPackageName: string;
  url: string;
};

export const getDeepLink = (
  location: string,
  email: string,
  file?: TFile,
  deepLinkConfig?: TDeepLinkConfig,
  originalUrl?: string,
) => {
  const jsonData = {
    portal: location,
    email: email,
    file: {
      id: file?.id,
      title: file?.title,
      extension: file?.fileExst,
    },
    folder: {
      id: file?.folderId,
      parentId: file?.rootFolderId,
      rootFolderType: file?.rootFolderType,
    },
    originalUrl: originalUrl,
  };
  const stringifyData = JSON.stringify(jsonData);
  const deepLinkData = bytesToBase64(
    Array.from(new TextEncoder().encode(stringifyData)),
  );

  const linker = new (DeepLinker as any)({
    onIgnored: () => {
      redirectToStore(deepLinkConfig);
    },
    onFallback: () => {
      redirectToStore(deepLinkConfig);
    },
    onReturn: () => {
      //redirectToStore(deepLinkConfig);
    },
  });

  linker.openURL(`${deepLinkConfig?.url}?data=${deepLinkData}`);
};

const redirectToStore = (deepLinkConfig?: TDeepLinkConfig) => {
  const nav = navigator.userAgent;
  const isIOS = nav.includes("iPhone;") || nav.includes("iPad;");

  const storeUrl = isIOS
    ? `https://apps.apple.com/app/id${deepLinkConfig?.iosPackageId}`
    : `https://play.google.com/store/apps/details?id=${deepLinkConfig?.androidPackageName}`;

  window.location.replace(storeUrl);
};
