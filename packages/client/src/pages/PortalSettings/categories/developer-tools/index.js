// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useState, useTransition, Suspense } from "react";
import styled, { css } from "styled-components";
import { Submenu } from "@docspace/shared/components/submenu";

import { Box } from "@docspace/shared/components/box";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";

import { useNavigate } from "react-router-dom";
import JavascriptSDK from "./JavascriptSDK";
import Webhooks from "./Webhooks";

import Api from "./Api";

import { useTranslation } from "react-i18next";
import { isMobile, isMobileOnly } from "react-device-detect";
import AppLoader from "@docspace/shared/components/app-loader";
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
    "Common",
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
        label={t("Common:BetaLabel")}
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
    data.findIndex((item) => location.pathname.includes(item.id)),
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
        `/portal-settings/developer-tools/${e.id}`,
      ),
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

export default inject(({ setup, settingsStore }) => {
  const { initSettings } = setup;

  return {
    currentDeviceType: settingsStore.currentDeviceType,
    loadBaseInfo: async () => {
      await initSettings();
    },
  };
})(observer(DeveloperToolsWrapper));
