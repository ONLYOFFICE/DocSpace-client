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
        `/portal-settings/security/${e.id}`,
      ),
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
