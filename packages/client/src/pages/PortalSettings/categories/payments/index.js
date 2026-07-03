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
import {
  getDocsConnectTrialState,
  isDocsConnectCanceled,
} from "../developer-tools/DocsConnect/utils";

import config from "../../../../../package.json";
import PaymentsEnterprise from "./Standalone";
import DocsConnectGetStartedModal from "./SaaS/DocsConnectGetStartedModal";
import BuyPlanPanel from "../developer-tools/DocsConnect/BuyPlanPanel";
import CancelPlanDialog from "../developer-tools/DocsConnect/CancelPlanDialog";
import {
  MainTariff,
  Wallet,
  Usage,
  PaymentMethod,
  ServicesList,
  BillingRoot,
} from "@docspace/ui-kit/billing";
import { getBrandName } from "@docspace/shared/constants/brands";

const TAB_IDS = {
  MAIN_TARIFF: "portal-payments",
  ADDONS: "services",
  WALLET: "wallet",
  PAYMENT_METHOD: "payment-method",
  USAGE: "usage",
};

const TAB_ORDER = [
  TAB_IDS.MAIN_TARIFF,
  TAB_IDS.ADDONS,
  TAB_IDS.WALLET,
  TAB_IDS.PAYMENT_METHOD,
  TAB_IDS.USAGE,
];

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
    docsConnectInfo,
    getStartedVisible,
    openGetStarted,
    closeGetStarted,
    fetchDocsConnectInfo,
    openBuyPlan,
    buyPlanPanelVisible,
    openDocsConnectCancelDialog,
    docsConnectCancelDialogVisible,
  } = props;
  const location = useLocation();
  const [currentTabId, setCurrentTabId] = useState(
    () =>
      TAB_ORDER.find((id) => location.pathname.includes(id)) || TAB_ORDER[0],
  );
  const navigate = useNavigate();
  const { t } = useTranslation(["Payments", "Settings", "Common"]);

  const onDocsConnectClick = () => {
    if (docsConnectInfo) {
      const { isTrial, expired } = getDocsConnectTrialState(docsConnectInfo);
      if (isTrial && expired) {
        openBuyPlan?.("trial");
        return;
      }
      navigate(
        combineUrl(
          window.ClientConfig?.proxy?.url,
          config.homepage,
          PAYMENT_ROUTES.docsConnect,
        ),
      );
      return;
    }
    openGetStarted?.();
  };

  const onDocsConnectToggle = () => {
    if (!docsConnectInfo) {
      openGetStarted?.();
      return;
    }

    const { isTrial, expired, isPaid } =
      getDocsConnectTrialState(docsConnectInfo);

    if (isTrial && expired) {
      openBuyPlan?.("trial");
      return;
    }

    if (
      docsConnectInfo.deactivated ||
      isDocsConnectCanceled(docsConnectInfo)
    ) {
      openBuyPlan?.("edit");
      return;
    }

    if (isPaid) openDocsConnectCancelDialog?.();
  };

  const docsConnectCardState = useMemo(() => {
    if (!docsConnectInfo)
      return {
        subscribed: false,
        isTrial: false,
        trialDaysLeft: 0,
        trialEndingSoon: false,
        trialExpired: false,
        trialEndDate: "",
        tariffPrice: 0,
        tariffUsers: 0,
        scheduledUsers: null,
        scheduledDate: "",
        scheduledDevPackDisabled: false,
        deactivated: false,
        canceled: false,
      };

    const { isTrial, daysLeft, totalDays, expired, endDate } =
      getDocsConnectTrialState(docsConnectInfo);
    const trialExpired = isTrial && expired;
    const trialEndingSoon =
      isTrial && !expired && totalDays > 0 && daysLeft / totalDays < 0.5;

    const tariffUsers = docsConnectInfo.tenant?.payment?.quantity ?? 0;
    const pricePerUser =
      (docsConnectInfo.prices?.pricePerUser ?? 0) +
      (docsConnectInfo.devPackEnabled
        ? (docsConnectInfo.prices?.devPackPrice ?? 0)
        : 0);

    return {
      subscribed: true,
      isTrial,
      trialDaysLeft: daysLeft,
      trialEndingSoon,
      trialExpired,
      trialEndDate: endDate,
      tariffPrice: tariffUsers * pricePerUser,
      tariffUsers,
      scheduledUsers: docsConnectInfo.scheduledChange?.nextUsers ?? null,
      scheduledDate: docsConnectInfo.scheduledChange?.dueDate ?? "",
      scheduledDevPackDisabled:
        docsConnectInfo.scheduledChange?.devPackDisabled ?? false,
      deactivated: docsConnectInfo.deactivated ?? false,
      canceled: isDocsConnectCanceled(docsConnectInfo),
    };
  }, [docsConnectInfo]);

  const paymentConfig = useMemo(
    () => ({
      language,
      logoText,
      walletHelpUrl,
      user,
      openOnNewPage,
      routes: PAYMENT_ROUTES,
      onServicesInit: fetchDocsConnectInfo,
    }),
    [
      language,
      logoText,
      walletHelpUrl,
      user,
      openOnNewPage,
      fetchDocsConnectInfo,
    ],
  );

  const data = [
    {
      id: TAB_IDS.MAIN_TARIFF,
      name: t("Common:TariffPlan", {
        productName: getBrandName("ProductName"),
      }),
      content: <MainTariff />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    !isNotPaidPeriod && {
      id: TAB_IDS.ADDONS,
      name: t("Common:Addons"),
      content: (
        <ServicesList
          getAIConfig={getAIConfig}
          onDocsConnectClick={onDocsConnectClick}
          onDocsConnectToggle={onDocsConnectToggle}
          docsConnectState={docsConnectCardState}
          onOpenSupportedModels={() =>
            navigateToRoute("/portal-settings/ai-settings/models")
          }
        />
      ),
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    {
      id: TAB_IDS.WALLET,
      name: t("Common:Wallet"),
      content: (
        <Wallet
          onViewUsage={() => onSelect({ id: TAB_IDS.USAGE })}
          onAddonsClick={() => onSelect({ id: TAB_IDS.ADDONS })}
        />
      ),
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    !isNotPaidPeriod && {
      id: TAB_IDS.PAYMENT_METHOD,
      name: t("Common:PaymentMethod"),
      content: <PaymentMethod />,
      onClick: () => {
        clearAbortControllerArr();
      },
    },
    {
      id: TAB_IDS.USAGE,
      name: t("Common:Usage"),
      content: (
        <Usage
          onDiskStorageClick={() => navigateToRoute(PAYMENT_ROUTES.diskStorage)}
          onBackupClick={() => navigateToRoute(PAYMENT_ROUTES.backup)}
          onAIServicesClick={() => navigateToRoute(PAYMENT_ROUTES.aiServices)}
        />
      ),
      onClick: () => {
        clearAbortControllerArr();
      },
    },
  ].filter(Boolean);

  const onSelect = (e) => {
    const url = isManagement()
      ? `/management/payments/${e.id}`
      : `/portal-settings/payments/${e.id}`;

    navigate(combineUrl(window.ClientConfig?.proxy?.url, config.homepage, url));
  };

  const navigateToRoute = (route) => {
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
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
      <DocsConnectGetStartedModal
        visible={getStartedVisible}
        onClose={closeGetStarted}
      />
      {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
      {docsConnectCancelDialogVisible ? <CancelPlanDialog /> : null}
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
    docsConnectStore,
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
      docsConnectInfo: docsConnectStore?.info,
      getStartedVisible: docsConnectStore?.getStartedVisible,
      openGetStarted: docsConnectStore?.openGetStarted,
      closeGetStarted: docsConnectStore?.closeGetStarted,
      fetchDocsConnectInfo: docsConnectStore?.fetchInfo,
      openBuyPlan: docsConnectStore?.openBuyPlan,
      buyPlanPanelVisible: docsConnectStore?.buyPlanPanelVisible,
      openDocsConnectCancelDialog: docsConnectStore?.openCancelPlanDialog,
      docsConnectCancelDialogVisible:
        docsConnectStore?.cancelPlanDialogVisible,
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
