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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import config from "PACKAGE_FILE";

import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Tabs } from "@docspace/shared/components/tabs";

import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import JavascriptSDK from "./JavascriptSDK";
import Webhooks from "./Webhooks";
import Api from "./Api";
import PluginSDK from "./PluginSDK";
import OAuth from "./OAuth";

import SSOLoader from "./sub-components/ssoLoader";
import ApiKeys from "./ApiKeys";

const DeveloperToolsWrapper = (props) => {
  const { currentDeviceType, identityServerEnabled } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState();

  const { t } = useTranslation([
    "JavascriptSdk",
    "Webhooks",
    "Settings",
    "WebPlugins",
    "Common",
    "OAuth",
  ]);
  // const [, startTransition] = useTransition();

  const sdkLabel = (
    <div style={{ boxSizing: "border-box", display: "flex", gap: "8px" }}>
      {t("JavascriptSdk")}
    </div>
  );

  const pluginLabel = (
    <div style={{ boxSizing: "border-box", display: "flex", gap: "8px" }}>
      {t("WebPlugins:PluginSDK")}
    </div>
  );

  const oauthData = identityServerEnabled
    ? {
        id: "oauth",
        name: t("OAuth:OAuth"),
        content: <OAuth />,
      }
    : {};

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
    { ...oauthData },
    {
      id: "api-keys",
      name: t("Settings:ApiKeys"),
      content: <ApiKeys />,
    },
  ];

  // const load = async () => {
  //   // await loadBaseInfo();
  // };

  useEffect(() => {
    const path = location.pathname;

    const currentTab = data.find(
      (item) =>
        path === `/portal-settings/developer-tools/${item.id}` ||
        path === `/developer-tools/${item.id}`,
    );

    if (currentTab !== -1 && data.length) {
      setCurrentTabId(currentTab.id);
    }

    setIsLoading(true);
  }, [location.pathname]);

  // useEffect(() => {
  //   ready && startTransition(load);
  // }, [ready]);

  const onSelect = (e) => {
    const path = location.pathname.includes("/portal-settings")
      ? "/portal-settings"
      : "";
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `${path}/developer-tools/${e.id}`,
      ),
    );
    setCurrentTabId(e.id);
  };

  if (!isLoading) return <SSOLoader />;

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
    />
  );
};

export const Component = inject(({ setup, settingsStore, authStore }) => {
  const { initSettings } = setup;

  const { identityServerEnabled } = authStore.capabilities;

  return {
    currentDeviceType: settingsStore.currentDeviceType,
    loadBaseInfo: async () => {
      await initSettings();
    },
    identityServerEnabled,
  };
})(observer(DeveloperToolsWrapper));
