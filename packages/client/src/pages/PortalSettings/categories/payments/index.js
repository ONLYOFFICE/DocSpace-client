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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";
import { isManagement } from "@docspace/shared/utils/common";
import { PAYMENT_ROUTES } from "./utils";

import config from "../../../../../package.json";
import PaymentsEnterprise from "./Standalone";
import {
  MainTariff,
  Wallet,
  PaymentMethod,
  ServicesList,
  BillingRoot,
} from "@docspace/ui-kit/billing";
import { getBrandName } from "@docspace/shared/constants/brands";

const PaymentsPage = (props) => {
  const {
    currentDeviceType,
    standalone,
    clearAbortControllerArr,
    language,
    user,
    logoText,
    walletHelpUrl,
    getAIConfig,
    openOnNewPage,
    isNotPaidPeriod,
  } = props;
  const location = useLocation();
  const tabIds = ["portal-payments", "payment-method", "wallet", "services"];
  const [currentTabId, setCurrentTabId] = useState(
    () => tabIds.find((id) => location.pathname.includes(id)) || tabIds[0],
  );
  const navigate = useNavigate();
  const { t } = useTranslation(["Payments", "Settings", "Common"]);

  const paymentConfig = useMemo(
    () => ({
      language,
      logoText,
      walletHelpUrl,
      user,
      openOnNewPage,
      routes: PAYMENT_ROUTES,
    }),
    [language, logoText, walletHelpUrl, user, openOnNewPage],
  );

  const data = [
    {
      id: "portal-payments",
      name: t("Common:TariffPlan", {
        productName: getBrandName("ProductName"),
      }),
      content: <MainTariff />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    !isNotPaidPeriod && {
      id: "payment-method",
      name: t("Common:PaymentMethod"),
      content: <PaymentMethod />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    {
      id: "wallet",
      name: t("Common:Wallet"),
      content: <Wallet />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    !isNotPaidPeriod && {
      id: "services",
      name: t("Settings:Services"),
      content: <ServicesList getAIConfig={getAIConfig} />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
  ].filter(Boolean);

  const onSelect = (e) => {
    const url = isManagement()
      ? `/management/payments/${e.id}`
      : `/portal-settings/payments/${e.id}`;

    navigate(
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, url),
    );
  };

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  if (standalone) return <PaymentsEnterprise />;

  return (
    <BillingRoot config={paymentConfig}>
      <Tabs
        items={data}
        selectedItemId={currentTabId}
        onSelect={(e) => onSelect(e)}
        stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
        withAnimation
      />
    </BillingRoot>
  );
};

export const Component = inject(
  ({
    settingsStore,
    authStore,
    userStore,
    filesSettingsStore,
    currentTariffStatusStore,
  }) => {
    const {
      standalone,
      currentDeviceType,
      clearAbortControllerArr,
      logoText,
      walletHelpUrl,
      getAIConfig,
    } = settingsStore;

    const { user } = userStore;
    const { openOnNewPage } = filesSettingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;

    return {
      standalone,
      currentDeviceType,
      clearAbortControllerArr,
      logoText,
      walletHelpUrl,
      getAIConfig,
      openOnNewPage,
      isNotPaidPeriod,
      language: authStore?.language,
      user: user
        ? {
            id: user.id,
            email: user.email,
            isOwner: user.isOwner,
          }
        : undefined,
    };
  },
)(observer(PaymentsPage));

