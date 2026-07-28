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

import React from "react";
import { isMobile } from "react-device-detect";

import { TFile } from "@docspace/shared/api/files/types";
import { TSettings } from "@docspace/shared/api/settings/types";
import { DeepLinkType } from "@docspace/shared/enums";

import { getDeepLink } from "../components/deep-link/DeepLink.helper";

export interface UseDeepLinkProps {
  settings?: TSettings;
  fileInfo?: TFile;
  email?: string;
  deepLinkSettings?: number;
}

const useDeepLink = ({
  settings,
  fileInfo,
  email,
  deepLinkSettings,
}: UseDeepLinkProps) => {
  const [isShowDeepLink, setIsShowDeepLink] = React.useState(false);

  React.useEffect(() => {
    const androidID = settings?.deepLink?.androidPackageName;
    const iOSId = settings?.deepLink?.iosPackageId;
    const deepLinkUrl = settings?.deepLink?.url;
    const isAndroidWebView =
      window.navigator.userAgent.includes("AscAndroidWebView");

    const defaultOpenDocument = localStorage.getItem("defaultOpenDocument");
    const params = new URLSearchParams(window.location.search);
    const withoutRedirect = params.get("without_redirect");
    const isSDK = params.get("isSDK");
    const isEmbedded = params.get("editorType") === "embedded";
    const isOpenOnlyApp =
      defaultOpenDocument === "app" || deepLinkSettings === DeepLinkType.App;

    if (
      !isSDK &&
      !isEmbedded &&
      isMobile &&
      !defaultOpenDocument &&
      androidID &&
      iOSId &&
      deepLinkUrl &&
      !withoutRedirect &&
      !isAndroidWebView &&
      deepLinkSettings !== DeepLinkType.Web
    ) {
      setIsShowDeepLink(true);
    }

    if (!isSDK && !isEmbedded && isMobile && isOpenOnlyApp) {
      getDeepLink(
        window.location.origin,
        email || "",
        fileInfo,
        settings?.deepLink,
        window.location.href,
        isOpenOnlyApp,
      );
    }
  }, [fileInfo, settings?.deepLink, email, deepLinkSettings]);

  return { isShowDeepLink, setIsShowDeepLink };
};

export default useDeepLink;
