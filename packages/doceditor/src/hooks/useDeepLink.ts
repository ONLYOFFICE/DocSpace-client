import React from "react";
import { isMobile } from "react-device-detect";

import { TFile } from "@docspace/shared/api/files/types";
import { TSettings } from "@docspace/shared/api/settings/types";

import { getDeepLink } from "../components/deep-link/DeepLink.helper";

export interface UseDeepLinkProps {
  settings?: TSettings;
  fileInfo?: TFile;
  email?: string;
}

const useDeepLink = ({ settings, fileInfo, email }: UseDeepLinkProps) => {
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

    if (
      isMobile &&
      !defaultOpenDocument &&
      androidID &&
      iOSId &&
      deepLinkUrl &&
      !withoutRedirect &&
      !isAndroidWebView
    ) {
      setIsShowDeepLink(true);
    }

    if (isMobile && defaultOpenDocument === "app") {
      getDeepLink(
        window.location.origin,
        email || "",
        fileInfo,
        settings?.deepLink,
        window.location.href,
      );
    }
  }, [fileInfo, settings?.deepLink, email]);

  return { isShowDeepLink, setIsShowDeepLink };
};

export default useDeepLink;
