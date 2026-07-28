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

import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import PortalDeactivationSection from "./portalDeactivation";
import PortalDeletionSection from "./portalDeletion";
import DeleteDataLoader from "./DeleteDataLoader";
import config from "../../../../../package.json";
import useDeleteData from "./useDeleteData";
import { getBrandName } from "@docspace/shared/constants/brands";

const DeleteData = (props) => {
  const {
    t,
    isNotPaidPeriod,
    tReady,
    getPortalOwner,
    showPortalSettingsLoader,
    clearAbortControllerArr,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [currentTabId, setCurrentTabId] = useState();

  const { stripeUrl, fetchPortalDeletionData, fetchPortalDeactivationData } =
    useDeleteData({
      getPortalOwner,
    });

  const data = [
    {
      id: "deletion",
      name: t("Common:DeletePortal", { productName: getBrandName("ProductName") }),
      content: <PortalDeletionSection stripeUrl={stripeUrl} />,
      onClick: async () => {
        clearAbortControllerArr();
        await fetchPortalDeletionData();
      },
    },
    {
      id: "deactivation",
      name: t("PortalDeactivation", { productName: getBrandName("ProductName") }),
      content: <PortalDeactivationSection />,
      onClick: async () => {
        clearAbortControllerArr();
        await fetchPortalDeactivationData();
      },
    },
  ];

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/delete-data/${e.id}`,
      ),
    );
    setCurrentTabId(e.id);
  };

  if (showPortalSettingsLoader || !tReady) return <DeleteDataLoader />;

  return isNotPaidPeriod ? (
    <PortalDeletionSection />
  ) : (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={(e) => onSelect(e)}
      withAnimation
    />
  );
};

export const Component = inject(
  ({ currentTariffStatusStore, settingsStore, clientLoadingStore }) => {
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { getPortalOwner, clearAbortControllerArr } = settingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      isNotPaidPeriod,
      getPortalOwner,
      showPortalSettingsLoader,
      clearAbortControllerArr,
    };
  },
)(observer(withTranslation("Settings")(DeleteData)));
