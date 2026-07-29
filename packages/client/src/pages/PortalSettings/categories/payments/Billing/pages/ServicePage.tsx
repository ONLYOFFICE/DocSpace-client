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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import { toastr } from "@docspace/ui-kit/components/toast";
import { default as AiPage } from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPage";
import { default as AiSearchPage } from "@docspace/ui-kit/billing/services/pages/ai-search/AiSearchPage";
import { default as BackupPage } from "@docspace/ui-kit/billing/services/pages/backup/BackupPage";
import { default as AdditionalStoragePage } from "@docspace/ui-kit/billing/services/pages/additional-storage/AdditionalStoragePage";
import { default as DocsConnectPage } from "@docspace/ui-kit/billing/services/pages/docs-connect/DocsConnectPage";
import { default as BackupPageLoader } from "@docspace/ui-kit/billing/services/pages/backup/BackupPageLoader";
import type { TDocsConnectPageState } from "@docspace/ui-kit/billing/types";

import config from "PACKAGE_FILE";

import {
  getDocsConnectTrialState,
  isDocsConnectCanceled,
} from "../../../developer-tools/DocsConnect/utils";
import { DOCS_CONNECT_ROUTE } from "../../../developer-tools/DocsConnect/constants";
import BuyPlanPanel from "../../../developer-tools/DocsConnect/BuyPlanPanel";
import CancelPlanDialog from "../../../developer-tools/DocsConnect/CancelPlanDialog";
import RemoveSubscriptionDialog from "../../../developer-tools/DocsConnect/RemoveSubscriptionDialog";
import PromoPage from "../../../developer-tools/DocsConnect/PromoPage";
import { PAYMENT_ROUTES } from "../../utils";

interface ServicePageProps {
  getAIConfig?: () => Promise<void>;
  fetchPayerInfo?: () => Promise<void>;
  docsConnectInfo?: TDocsConnectInfo | null;
  docsConnectLoading?: boolean;
  buyPlanPanelVisible?: boolean;
  cancelPlanDialogVisible?: boolean;
  removeSubscriptionDialogVisible?: boolean;
  fetchDocsConnectInfo?: () => void;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  openCancelPlanDialog?: () => void;
  openRemoveSubscriptionDialog?: () => void;
  cancelScheduledChange?: () => Promise<void>;
}

// Renders a single add-on service detail page based on the current route.
// The BillingRoot provider is supplied by the parent Billing wrapper, so this
// page must not create its own.
const ServicePage = (props: ServicePageProps) => {
  const {
    getAIConfig,
    fetchPayerInfo,
    docsConnectInfo,
    docsConnectLoading,
    buyPlanPanelVisible,
    cancelPlanDialogVisible,
    removeSubscriptionDialogVisible,
    fetchDocsConnectInfo,
    openBuyPlan,
    openCancelPlanDialog,
    openRemoveSubscriptionDialog,
    cancelScheduledChange,
  } = props;
  useTranslation(["DocsConnect", "Common"]);
  const [isCancelChangeLoading, setIsCancelChangeLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { pathname } = location;
  const isDocsConnect = pathname.includes("docs-connect");

  useEffect(() => {
    fetchPayerInfo?.();
  }, [fetchPayerInfo]);

  useEffect(() => {
    if (isDocsConnect && !docsConnectInfo) fetchDocsConnectInfo?.();
  }, [isDocsConnect, docsConnectInfo, fetchDocsConnectInfo]);

  const navigateToRoute = (route: string) =>
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
    );

  const onViewUsage = () => navigateToRoute("/billing/usage");

  const renderDocsConnect = () => {
    if (docsConnectLoading) return <BackupPageLoader />;

    if (!docsConnectInfo) return <PromoPage />;

    const {
      endDate,
      daysLeft,
      totalDays,
      percent: spentPercent,
      isPaid,
      expired,
    } = getDocsConnectTrialState(docsConnectInfo);

    const planUsers = docsConnectInfo.tenant?.payment?.quantity ?? 0;
    const pricePerUser =
      (docsConnectInfo.prices?.pricePerUser ?? 0) +
      (docsConnectInfo.devPackEnabled
        ? (docsConnectInfo.prices?.devPackPrice ?? 0)
        : 0);
    const scheduledChange = isPaid
      ? (docsConnectInfo.scheduledChange ?? null)
      : null;

    const state: TDocsConnectPageState = {
      isPaid,
      expired,
      daysLeft,
      totalDays,
      spentPercent,
      endDate,
      currency: docsConnectInfo.wallet?.currency ?? "USD",
      credits: docsConnectInfo.wallet?.availableCredits ?? 0,
      planUsers,
      pricePerUser,
      basePricePerUser: docsConnectInfo.prices?.pricePerUser ?? 0,
      devPackEnabled: docsConnectInfo.devPackEnabled ?? false,
      monthlyCharge: planUsers * pricePerUser,
      scheduledChange: scheduledChange
        ? {
            nextUsers: scheduledChange.nextUsers,
            dueDate: scheduledChange.dueDate,
            nextDevPackEnabled: scheduledChange.nextDevPackEnabled,
          }
        : null,
      deactivated: isPaid && (docsConnectInfo.deactivated ?? false),
      canceled: isDocsConnectCanceled(docsConnectInfo),
    };

    const onCancelChange = async () => {
      if (isCancelChangeLoading) return;

      setIsCancelChangeLoading(true);
      try {
        await cancelScheduledChange?.();
      } catch (e) {
        toastr.error(e as Error);
      } finally {
        setIsCancelChangeLoading(false);
      }
    };

    return (
      <>
        <DocsConnectPage
          state={state}
          onTopUp={() => navigate(PAYMENT_ROUTES.wallet)}
          onTopUpComplete={() => fetchDocsConnectInfo?.()}
          onViewUsage={() => navigate(PAYMENT_ROUTES.usage)}
          onBuyPlan={() => openBuyPlan?.("trial")}
          onEditPlan={() => openBuyPlan?.("edit")}
          onGoToTenant={() => navigate(DOCS_CONNECT_ROUTE)}
          onCancelPlan={() => openCancelPlanDialog?.()}
          onRemovePlan={() => openRemoveSubscriptionDialog?.()}
          onCancelChange={onCancelChange}
          isCancelChangeLoading={isCancelChangeLoading}
        />
        {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
        {cancelPlanDialogVisible ? <CancelPlanDialog /> : null}
        {removeSubscriptionDialogVisible ? <RemoveSubscriptionDialog /> : null}
      </>
    );
  };

  return (
    <>
      {pathname.includes("ai-services") ? (
        <AiPage
          getAIConfig={getAIConfig}
          withBottomMargin
          onViewMore={onViewUsage}
          onOpenSupportedModels={() =>
            navigateToRoute("/portal-settings/ai-settings/ai-models")
          }
        />
      ) : null}
      {pathname.includes("ai-search") ? (
        <AiSearchPage
          getAIConfig={getAIConfig}
          withBottomMargin
          onViewMore={onViewUsage}
        />
      ) : null}
      {pathname.includes("backup") ? (
        <BackupPage withBottomMargin onViewMore={onViewUsage} />
      ) : null}
      {pathname.includes("disk-storage") ? (
        <AdditionalStoragePage withBottomMargin />
      ) : null}
      {isDocsConnect ? renderDocsConnect() : null}
    </>
  );
};

export const Component = inject(
  ({ settingsStore, currentTariffStatusStore, docsConnectStore }: TStore) => {
    const { getAIConfig } = settingsStore;
    const { fetchPayerInfo } = currentTariffStatusStore;

    return {
      getAIConfig,
      fetchPayerInfo,
      docsConnectInfo: docsConnectStore.info,
      docsConnectLoading: docsConnectStore.isLoading,
      buyPlanPanelVisible: docsConnectStore.buyPlanPanelVisible,
      cancelPlanDialogVisible: docsConnectStore.cancelPlanDialogVisible,
      removeSubscriptionDialogVisible:
        docsConnectStore.removeSubscriptionDialogVisible,
      fetchDocsConnectInfo: docsConnectStore.fetchInfo,
      openBuyPlan: docsConnectStore.openBuyPlan,
      openCancelPlanDialog: docsConnectStore.openCancelPlanDialog,
      openRemoveSubscriptionDialog:
        docsConnectStore.openRemoveSubscriptionDialog,
      cancelScheduledChange: docsConnectStore.cancelScheduledChange,
    };
  },
)(observer(ServicePage));

export default Component;
