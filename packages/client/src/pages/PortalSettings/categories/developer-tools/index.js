import React, { useEffect, useState, useTransition, Suspense } from "react";
import styled, { css } from "styled-components";
import { Submenu } from "@docspace/shared/components/submenu";

import { Box } from "@docspace/shared/components/box";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/common/utils";
import config from "PACKAGE_FILE";

import { useNavigate } from "react-router-dom";
import JavascriptSDK from "./JavascriptSDK";
import Webhooks from "./Webhooks";

import Api from "./Api";

import { useTranslation } from "react-i18next";
import { isMobile, isMobileOnly } from "react-device-detect";
import AppLoader from "@docspace/common/components/AppLoader";
import SSOLoader from "./sub-components/ssoLoader";
import { WebhookConfigsLoader } from "./Webhooks/sub-components/Loaders";
import { DeviceType } from "@docspace/shared/enums";
import PluginSDK from "./PluginSDK";
import { Badge } from "@docspace/shared/components/badge";

const StyledSubmenu = styled(Submenu)`
  .sticky {
    z-index: 201;
  }
`;

const DeveloperToolsWrapper = (props) => {
  const { loadBaseInfo, currentDeviceType } = props;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const { t, ready } = useTranslation([
    "JavascriptSdk",
    "Webhooks",
    "Settings",
    "WebPlugins",
  ]);
  const [isPending, startTransition] = useTransition();

  const sdkLabel = (
    <Box displayProp="flex" style={{ gap: "8px" }}>
      {t("JavascriptSdk")}
    </Box>
  );

  const pluginLabel = (
    <Box displayProp="flex" style={{ gap: "8px" }}>
      {t("WebPlugins:PluginSDK")}

      <Badge
        label={t("Settings:BetaLabel")}
        backgroundColor="#533ED1"
        fontSize="9px"
        borderRadius="50px"
        noHover={true}
        isHovered={false}
      />
    </Box>
  );

  const data = [
    {
      id: "api",
      name: t("Settings:Api"),
      content: <Api />,
    },
    {
      id: "javascript-sdk",
      name: sdkLabel,
      content: <JavascriptSDK />,
    },
    {
      id: "plugin-sdk",
      name: pluginLabel,
      content: <PluginSDK />,
    },
    {
      id: "webhooks",
      name: t("Webhooks:Webhooks"),
      content: <Webhooks />,
    },
  ];

  const [currentTab, setCurrentTab] = useState(
    data.findIndex((item) => location.pathname.includes(item.id))
  );

  const load = async () => {
    //await loadBaseInfo();
  };

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    if (currentTab !== -1) {
      setCurrentTab(currentTab);
    }
  }, []);

  useEffect(() => {
    ready && startTransition(load);
  }, [ready]);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/developer-tools/${e.id}`
      )
    );
  };

  const loaders = [<SSOLoader />, <AppLoader />];

  return (
    <Suspense fallback={loaders[currentTab] || <AppLoader />}>
      <StyledSubmenu
        data={data}
        startSelect={currentTab}
        onSelect={onSelect}
        topProps={
          currentDeviceType === DeviceType.desktop
            ? 0
            : currentDeviceType === DeviceType.mobile
              ? "53px"
              : "61px"
        }
      />
    </Suspense>
  );
};

export default inject(({ setup, auth }) => {
  const { initSettings } = setup;

  const { settingsStore } = auth;

  return {
    currentDeviceType: settingsStore.currentDeviceType,
    loadBaseInfo: async () => {
      await initSettings();
    },
  };
})(observer(DeveloperToolsWrapper));
