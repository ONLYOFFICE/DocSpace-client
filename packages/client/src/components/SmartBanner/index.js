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

import { useEffect } from "react";
import styled from "styled-components";
import { isMobile, isIOS } from "react-device-detect";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import SmartBanner from "react-smartbanner";
import { getCookie } from "@docspace/shared/utils";
import "./main.css";

const Wrapper = styled.div`
  padding-bottom: 80px;
`;

const ReactSmartBanner = (props) => {
  const { t, ready, isBannerVisible, setIsBannerVisible, logoText } = props;
  const force = isIOS ? "ios" : "android";
  const location = useLocation();

  const checkBanner = () => {
    const cookieClosed = getCookie("smartbanner-closed");
    const cookieInstalled = getCookie("smartbanner-installed");
    const path = window.location.pathname.toLowerCase();
    if (
      (path.includes("rooms") || path.includes("files")) &&
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
    <Wrapper id="smart-banner">
      <SmartBanner
        title={t("SmartBanner:AppName", {
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
    </Wrapper>
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
