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

import { useEffect } from "react";
import { isMobile, isIOS } from "react-device-detect";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import SmartBanner from "react-smartbanner";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import "./main.css";

const ReactSmartBanner = (props) => {
  const { t, ready, isBannerVisible, setIsBannerVisible, logoText } = props;
  const force = isIOS ? "ios" : "android";
  const location = useLocation();

  const checkBanner = () => {
    const cookieClosed = getCookie("smartbanner-closed");
    const cookieInstalled = getCookie("smartbanner-installed");
    const path = window.location.pathname.toLowerCase();
    if (
      (path.includes("rooms") ||
        path.includes("files") ||
        path.includes("shared-with-me") ||
        path.includes("recent")) &&
      !(cookieClosed || cookieInstalled)
    ) {
      setIsBannerVisible(true);
    } else {
      setIsBannerVisible(false);
    }
  };

  useEffect(() => {
    checkBanner();
  }, []);

  useEffect(() => {
    checkBanner();
  }, [location]);

  const storeText = {
    ios: t("SmartBanner:AppStore"),
    android: t("SmartBanner:GooglePlay"),
    windows: "",
    kindle: "",
  };

  const priceText = {
    ios: t("Common:Free"),
    android: t("Common:Free"),
    windows: "",
    kindle: "",
  };

  const appMeta = {
    ios: "react-apple-itunes-app",
    android: "react-google-play-app",
    windows: "msApplication-ID",
    kindle: "kindle-fire-app",
  };

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  return isMobile && isBannerVisible && ready && isTouchDevice ? (
    <div id="smart-banner" style={{ paddingBottom: "80px" }}>
      <SmartBanner
        title={t("SmartBanner:SmartBannerAppName", {
          organizationName: logoText,
        })}
        author="Ascensio System SIA"
        button={t("Common:View")}
        force={force}
        onClose={() => setIsBannerVisible(false)}
        onInstall={() => setIsBannerVisible(false)}
        storeText={storeText}
        price={priceText}
        appMeta={appMeta}
      />
    </div>
  ) : null;
};

export default inject(({ settingsStore }) => {
  const { isBannerVisible, setIsBannerVisible, logoText } = settingsStore;
  return {
    isBannerVisible,
    setIsBannerVisible,
    logoText,
  };
})(observer(ReactSmartBanner));
