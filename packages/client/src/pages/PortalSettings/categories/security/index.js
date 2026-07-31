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

import React, { useEffect, useState } from "react";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";
import config from "PACKAGE_FILE";
import MobileSecurityLoader from "./sub-components/loaders/mobile-security-loader";
import AccessLoader from "./sub-components/loaders/access-loader";
import SecurityLoader from "./sub-components/loaders/security-loader";

import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

import AccessPortal from "./access-portal";
import LoginHistory from "./login-history";
import AuditTrail from "./audit-trail";
import { resetSessionStorage } from "../../utils";
import useSecurity from "./useSecurity";
import { getBrandName } from "@docspace/shared/constants/brands";

const SecurityWrapper = (props) => {
  const {
    t,
    tReady,
    resetIsInit,
    currentDeviceType,

    settingsStore,
    tfaStore,
    setup,
    clearAbortControllerArr,
    showPortalSettingsLoader,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const [currentTabId, setCurrentTabId] = useState();

  const defaultProps = createDefaultHookSettingsProps({
    settingsStore,
    tfaStore,
    setup,
  });

  const { getAccessPortalData, getLoginHistoryData, getAuditTrailData } =
    useSecurity(defaultProps.security);

  const data = [
    {
      id: "access-portal",
      name: t("PortalAccess", { productName: getBrandName("ProductName") }),
      content: <AccessPortal />,
      onClick: async () => {
        clearAbortControllerArr();
        await getAccessPortalData();
      },
    },
    {
      id: "login-history",
      name: t("LoginHistoryTitle"),
      content: <LoginHistory />,
      onClick: async () => {
        clearAbortControllerArr();
        await getLoginHistoryData();
      },
    },
    {
      id: "audit-trail",
      name: t("AuditTrailNav"),
      content: <AuditTrail />,
      onClick: async () => {
        clearAbortControllerArr();
        await getAuditTrailData();
      },
    },
  ];

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      resetIsInit();
      resetSessionStorage();
    };
  }, []);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/security/${e.id}`,
      ),
    );
    setCurrentTabId(e.id);
  };

  if ((showPortalSettingsLoader && data.length) || !tReady)
    return currentTabId === data[0].id ? (
      currentDeviceType !== DeviceType.desktop ? (
        <MobileSecurityLoader />
      ) : (
        <SecurityLoader />
      )
    ) : (
      <AccessLoader />
    );

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={(e) => onSelect(e)}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
      withAnimation
    />
  );
};

export const Component = inject(
  ({ settingsStore, setup, tfaStore, clientLoadingStore }) => {
    const { resetIsInit } = setup;

    const { clearAbortControllerArr, currentDeviceType } = settingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      resetIsInit,

      showPortalSettingsLoader,

      settingsStore,
      tfaStore,
      setup,
      clearAbortControllerArr,
      currentDeviceType,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(SecurityWrapper)));
