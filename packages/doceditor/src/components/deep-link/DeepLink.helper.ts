/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
    console.error(error);
    options?.onFail?.();
  }
};

export const redirectToStore = (deepLinkConfig?: TDeepLinkConfig) => {
  const nav = navigator.userAgent;
  const isIOS = nav.includes("iPhone;") || nav.includes("iPad;");

  const storeUrl = isIOS
    ? `https://apps.apple.com/app/id${deepLinkConfig?.iosPackageId}`
    : `https://play.google.com/store/apps/details?id=${deepLinkConfig?.androidPackageName}`;

  window.location.replace(storeUrl);
};

export const getDeepLink = (
  location: string,
  email: string,
  file?: TFile,
  deepLinkConfig?: TDeepLinkConfig,
  originalUrl?: string,
  isOpenOnlyApp?: boolean,
) => {
  if (!deepLinkConfig) {
    return (window.location.href = "/");
  }

  const jsonData = {
    portal: location,
    email,
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
    originalUrl,
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
