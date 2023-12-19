import React, { useEffect, useState } from "react";
import Submenu from "@docspace/components/submenu";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/common/utils";
import config from "PACKAGE_FILE";

import SSO from "./SingleSignOn";
import LDAP from "./LDAP";
import ThirdParty from "./ThirdPartyServicesSettings";

import SMTPSettings from "./SMTPSettings";
import DocumentService from "./DocumentService";
import PluginPage from "./Plugins";
import { DeviceType } from "@docspace/common/constants";
import Badge from "@docspace/components/badge";
import Box from "@docspace/components/box";

const IntegrationWrapper = (props) => {
  const {
    t,
    tReady,
    currentDeviceType,
    toDefault,
    isSSOAvailable,
    standalone,
    enablePlugins,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      isSSOAvailable &&
        !window.location.pathname.includes("single-sign-on") &&
        toDefault();
    };
  }, []);

  const data = [
    {
      id: "ldap",
      name: t("LDAP"),
      content: <LDAP />,
    },
    {
      id: "third-party-services",
      name: t("Translations:ThirdPartyTitle"),
      content: <ThirdParty />,
    },
    {
      id: "single-sign-on",
      name: t("SingleSignOn"),
      content: <SSO />,
    },
    {
      id: "smtp-settings",
      name: t("SMTPSettings"),
      content: <SMTPSettings />,
    },
  ];

  if (standalone) {
    const documentServiceData = {
      id: "document-service",
      name: t("DocumentService"),
      content: <DocumentService />,
    };

    data.push(documentServiceData);
  }

  if (enablePlugins) {
    const pluginLabel = (
      <Box displayProp="flex" style={{ gap: "8px" }}>
        {t("Common:Plugins")}

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

    data.splice(1, 0, {
      id: "plugins",
      name: pluginLabel,
      content: <PluginPage />,
    });
  }

  const getCurrentTab = () => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    return currentTab !== -1 ? currentTab : 0;
  };

  const currentTab = getCurrentTab();

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/integration/${e.id}`
      )
    );
  };

  return (
    <Submenu
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
  );
};

export default inject(({ auth, ssoStore }) => {
  const { standalone, enablePlugins } = auth.settingsStore;
  const { load: toDefault } = ssoStore;
  const { currentDeviceType } = auth.settingsStore;
  const { isSSOAvailable } = auth.currentQuotaStore;

  return {
    toDefault,
    isSSOAvailable,
    standalone,
    currentDeviceType,
    enablePlugins,
  };
})(
  withTranslation(["Settings", "SingleSignOn", "Translations", "WebPlugins"])(
    observer(IntegrationWrapper)
  )
);
