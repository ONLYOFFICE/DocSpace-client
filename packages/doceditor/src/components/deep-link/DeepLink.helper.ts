// (c) Copyright Ascensio System SIA 2009-2025
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

import { isSafari } from "react-device-detect";
import { TFile } from "@docspace/shared/api/files/types";

export type TDeepLinkConfig = {
  iosPackageId: string;
  androidPackageName: string;
  url: string;
};

function bytesToBase64(bytes: number[]) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

const openDeepLink = (
  url: string,
  options?: Partial<{
    onOpen?: () => void;
    onFail?: () => void;
  }>,
) => {
  const time = isSafari ? 3000 : 1000;
  let timeout: NodeJS.Timeout;
  let interval: NodeJS.Timeout;
  let visible: DocumentVisibilityState = "visible";

  const handleOpen = () => {
    window.removeEventListener("visibilitychange", () => true);
    options?.onOpen?.();
  };
  const handleResponse = () => {
    if (visible === "visible") return options?.onFail?.();
    if (interval) clearInterval(interval);
    handleOpen();
  };

  try {
    window.addEventListener(
      "visibilitychange",
      (e) => (visible = (e.target as Document)?.visibilityState),
    );
    timeout = setTimeout(handleResponse, time);

    interval = setInterval(() => {
      if (visible === "hidden") {
        clearTimeout(timeout);
        handleResponse();
      }
    }, time);

    window.location.href = url;
  } catch (error) {
    options?.onFail?.();
  }
};

export const getDeepLink = (
  location: string,
  email: string,
  file?: TFile,
  deepLinkConfig?: TDeepLinkConfig,
  originalUrl?: string,
  isOpenOnlyApp?: boolean,
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

  openDeepLink(`${deepLinkConfig?.url}?data=${deepLinkData}`, {
    onOpen: () =>
      (window.location.href = `${deepLinkConfig?.url}?data=${deepLinkData}`),
    onFail: isOpenOnlyApp ? undefined : () => redirectToStore(deepLinkConfig),
  });
};

export const redirectToStore = (deepLinkConfig?: TDeepLinkConfig) => {
  const nav = navigator.userAgent;
  const isIOS = nav.includes("iPhone;") || nav.includes("iPad;");

  const storeUrl = isIOS
    ? `https://apps.apple.com/app/id${deepLinkConfig?.iosPackageId}`
    : `https://play.google.com/store/apps/details?id=${deepLinkConfig?.androidPackageName}`;

  window.location.replace(storeUrl);
};
