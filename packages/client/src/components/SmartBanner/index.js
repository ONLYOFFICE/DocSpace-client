import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { isMobile, isIOS } from "react-device-detect";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router-dom";
import SmartBanner from "react-smartbanner";
import { getCookie } from "@docspace/shared/utils";
import "./main.css";

const Wrapper = styled.div`
  padding-bottom: 80px;
`;

const ReactSmartBanner = (props) => {
  const { t, ready, isBannerVisible, setIsBannerVisible } = props;
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
    <Wrapper>
      <SmartBanner
        title={t("SmartBanner:AppName")}
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
  ) : (
    <></>
  );
};

export default inject(({ bannerStore }) => {
  return {
    isBannerVisible: bannerStore.isBannerVisible,
    setIsBannerVisible: bannerStore.setIsBannerVisible,
  };
})(observer(ReactSmartBanner));
