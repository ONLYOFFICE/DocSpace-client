import React, { useEffect, useState } from "react";
import { Submenu } from "@docspace/shared/components/submenu";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";

import AccessPortal from "./access-portal/index.js";
import SecurityLoader from "./sub-components/loaders/security-loader";
import LoginHistory from "./login-history/index.js";
import MobileSecurityLoader from "./sub-components/loaders/mobile-security-loader";
import AccessLoader from "./sub-components/loaders/access-loader";
import AuditTrail from "./audit-trail/index.js";
import Sessions from "./sessions/index";
import { resetSessionStorage } from "../../utils";
import { DeviceType } from "@docspace/shared/enums";

const SecurityWrapper = (props) => {
  const { t, loadBaseInfo, resetIsInit, currentDeviceType } = props;
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const data = [
    {
      id: "access-portal",
      name: t("PortalAccess"),
      content: <AccessPortal />,
    },
    {
      id: "login-history",
      name: t("LoginHistoryTitle"),
      content: <LoginHistory />,
    },
    {
      id: "audit-trail",
      name: t("AuditTrailNav"),
      content: <AuditTrail />,
    },
    {
      id: "sessions",
      name: t("Sessions"),
      content: <Sessions />,
    },
  ];

  const load = async () => {
    await loadBaseInfo();
    setIsLoading(true);
  };

  useEffect(() => {
    return () => {
      resetIsInit();
      resetSessionStorage();
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    if (currentTab !== -1) setCurrentTab(currentTab);

    load();
  }, []);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/security/${e.id}`
      )
    );
  };

  if (!isLoading)
    return currentTab === 0 ? (
      currentDeviceType !== DeviceType.desktop ? (
        <MobileSecurityLoader />
      ) : (
        <SecurityLoader />
      )
    ) : (
      <AccessLoader />
    );
  return (
    <Submenu
      data={data}
      startSelect={currentTab}
      onSelect={(e) => onSelect(e)}
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

export default inject(({ settingsStore, setup }) => {
  const { initSettings, resetIsInit } = setup;

  return {
    loadBaseInfo: async () => {
      await initSettings();
    },
    resetIsInit,
    currentDeviceType: settingsStore.currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(SecurityWrapper)));
