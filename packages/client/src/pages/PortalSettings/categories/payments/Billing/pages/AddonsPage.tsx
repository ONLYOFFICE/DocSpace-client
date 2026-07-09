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
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { ServicesList } from "@docspace/ui-kit/billing";
import type { TDocsConnectCardState } from "@docspace/ui-kit/billing/types";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import config from "PACKAGE_FILE";

import {
  getDocsConnectTrialState,
  isDocsConnectCanceled,
} from "../../../developer-tools/DocsConnect/utils";
import BuyPlanPanel from "../../../developer-tools/DocsConnect/BuyPlanPanel";
import CancelPlanDialog from "../../../developer-tools/DocsConnect/CancelPlanDialog";
import DocsConnectGetStartedModal from "../../SaaS/DocsConnectGetStartedModal";
import { PAYMENT_ROUTES } from "../../utils";

interface AddonsPageProps {
  getAIConfig?: () => Promise<void>;
  docsConnectInfo?: TDocsConnectInfo | null;
  getStartedVisible?: boolean;
  openGetStarted?: () => void;
  closeGetStarted?: () => void;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  buyPlanPanelVisible?: boolean;
  openCancelPlanDialog?: () => void;
  cancelPlanDialogVisible?: boolean;
}

const AddonsPage = (props: AddonsPageProps) => {
  const {
    getAIConfig,
    docsConnectInfo,
    getStartedVisible,
    openGetStarted,
    closeGetStarted,
    openBuyPlan,
    buyPlanPanelVisible,
    openCancelPlanDialog,
    cancelPlanDialogVisible,
  } = props;
  const navigate = useNavigate();

  const navigateToRoute = (route: string) =>
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
    );

  const onDocsConnectClick = () => {
    if (docsConnectInfo) {
      const { isTrial, expired } = getDocsConnectTrialState(docsConnectInfo);
      if (isTrial && expired) {
        openBuyPlan?.("trial");
        return;
      }
      navigateToRoute(PAYMENT_ROUTES.docsConnect);
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

    if (docsConnectInfo.deactivated || isDocsConnectCanceled(docsConnectInfo)) {
      openBuyPlan?.("edit");
      return;
    }

    if (isPaid) openCancelPlanDialog?.();
  };

  const docsConnectCardState = useMemo<TDocsConnectCardState>(() => {
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
      deactivated: docsConnectInfo.deactivated ?? false,
      canceled: isDocsConnectCanceled(docsConnectInfo),
    };
  }, [docsConnectInfo]);

  return (
    <>
      <ServicesList
        getAIConfig={getAIConfig}
        onDocsConnectClick={onDocsConnectClick}
        onDocsConnectToggle={onDocsConnectToggle}
        docsConnectState={docsConnectCardState}
        onOpenSupportedModels={() =>
          navigateToRoute("/portal-settings/ai-settings/ai-models")
        }
      />
      <DocsConnectGetStartedModal
        visible={getStartedVisible ?? false}
        onClose={() => closeGetStarted?.()}
      />
      {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
      {cancelPlanDialogVisible ? <CancelPlanDialog /> : null}
    </>
  );
};

export const Component = inject(({ settingsStore, docsConnectStore }: TStore) => ({
  getAIConfig: settingsStore.getAIConfig,
  docsConnectInfo: docsConnectStore.info,
  getStartedVisible: docsConnectStore.getStartedVisible,
  openGetStarted: docsConnectStore.openGetStarted,
  closeGetStarted: docsConnectStore.closeGetStarted,
  openBuyPlan: docsConnectStore.openBuyPlan,
  buyPlanPanelVisible: docsConnectStore.buyPlanPanelVisible,
  openCancelPlanDialog: docsConnectStore.openCancelPlanDialog,
  cancelPlanDialogVisible: docsConnectStore.cancelPlanDialogVisible,
}))(observer(AddonsPage));

export default Component;
