// (c) Copyright Ascensio System SIA 2009-2026
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
      name: t("Common:PortalTariffPlan", {
        productName: t("Common:ProductName"),
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

