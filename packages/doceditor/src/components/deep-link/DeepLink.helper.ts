// (c) Copyright Ascensio System SIA 2010-2024
// 
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
// 
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
// 
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
// 
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
// 
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
// 
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
