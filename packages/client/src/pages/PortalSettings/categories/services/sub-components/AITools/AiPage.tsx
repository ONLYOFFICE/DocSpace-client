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

import React, { useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import { Link } from "@docspace/ui-kit/components/link";

import { AI_TOOLS } from "@docspace/shared/constants";
import { DeviceType } from "@docspace/shared/enums";

import TransactionHistory from "SRC_DIR/pages/PortalSettings/categories/payments/TransactionHistory";
import BalanceAmount from "SRC_DIR/pages/PortalSettings/categories/payments/BalanceAmount";
import PayerInformation from "SRC_DIR/pages/PortalSettings/categories/payments/PayerInformation";
import ServiceToggleSection from "SRC_DIR/pages/PortalSettings/categories/services/sub-components/ServiceToggleSection";
import { finishRefreshingWithMinCycle } from "SRC_DIR/helpers/refreshing";

import ConfirmationDialog from "SRC_DIR/pages/PortalSettings/categories/services/sub-components/ConfirmationDialog";

import PricingBillingBody from "./sub-components/PricingBillingBody";
import TopUpContainer from "./sub-components/TopUpContainer";
import ModelSettingsTable from "./sub-components/ModelSettingsTable";
import AiPageLoader from "./AiPageLoader";

import styles from "./AiPage.module.scss";
import {
  formatDateLocalized,
  getAppTimezone,
} from "@docspace/ui-kit/utils/date";
import { setServiceState } from "@docspace/shared/api/portal";
import { toastr } from "@docspace/ui-kit/components";

type AiPageProps = {
  aiServiceCodeCurrency?: string;
  aiServiceBalance?: number;
  isAiToolsServiceOn?: boolean;
  changeServiceState?: (service: string) => void;
  onTopUpClick?: () => void;
  onPricingBillingClick?: () => void;
  language?: string;
  fetchAiServiceBalance?: () => Promise<void>;
  fetchTransactionHistory?: (
    startDate?: string | null,
    endDate?: string | null,
    credit?: boolean,
    debit?: boolean,
    participantName?: string,
    serviceName?: string,
  ) => Promise<void>;
  logoText?: string;
  aiServiceLastCreditAmount?: number | null;
  aiServiceLastCreditCurrency?: string;
  formatAiServiceCurrency?: (
    amount: number,
    fractionDigits: number,
    currency: string,
  ) => string;
  aiServiceLastCreditDate?: string;
  isAiServiceLowBalance?: boolean;
  isInitAiPage?: boolean;
  cardLinkedOnFreeTariff?: boolean;
  isFreeTariff?: boolean;
  isPayer?: boolean;
  currentDeviceType?: string;
  wasFirstAiServiceTopUp?: boolean;
};

const AiPage = (props: AiPageProps) => {
  const {
    isAiToolsServiceOn = false,
    changeServiceState,
    onTopUpClick,
    onPricingBillingClick,
    aiServiceBalance,
    aiServiceCodeCurrency,
    fetchAiServiceBalance,
    fetchTransactionHistory,
    logoText,
    aiServiceLastCreditAmount,
    aiServiceLastCreditCurrency,
    formatAiServiceCurrency,
    aiServiceLastCreditDate,
    language,
    isAiServiceLowBalance,
    isInitAiPage,
    cardLinkedOnFreeTariff,
    isFreeTariff,
    isPayer,
    currentDeviceType,
    wasFirstAiServiceTopUp,
  } = props;

  const { t } = useTranslation("Services");

  const [selectedTabId, setSelectedTabId] = useState("usage");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPricingBillingVisible, setIsPricingBillingVisible] = useState(false);
  const [isTopUpVisible, setIsTopUpVisible] = useState(false);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isTopUpConfirmVisible, setIsTopUpConfirmVisible] = useState(false);

  const isDisabled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;

  const navigate = useNavigate();

  useEffect(() => {
    if (isInitAiPage && !wasFirstAiServiceTopUp) {
      navigate("/portal-settings/services");
    }
  }, [isInitAiPage, wasFirstAiServiceTopUp]);

  const onRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    const startTime = Date.now();
    try {
      await Promise.all([
        fetchAiServiceBalance?.(),
        fetchTransactionHistory?.(null, null, true, true, "", "aitools"),
      ]);
    } finally {
      finishRefreshingWithMinCycle({
        startTime,
        setRefreshing: setIsRefreshing,
      });
    }
  };

  const onToggleChange = () => {
    setIsConfirmDialogVisible(true);
  };

  const onCloseConfirmDialog = () => {
    setIsConfirmDialogVisible(false);
  };

  const onConfirm = async () => {
    setIsConfirmDialogVisible(false);

    const raw = {
      service: AI_TOOLS,
      enabled: !isAiToolsServiceOn,
    };

    changeServiceState?.(AI_TOOLS);

    try {
      const result = await setServiceState(raw);

      if (!result) {
        toastr.error(t("Common:UnexpectedError"));
        changeServiceState?.(AI_TOOLS);
        return;
      }

      if (!isAiToolsServiceOn) toastr.success(t("Services:AIToolsEnabled"));
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:UnexpectedError"));
      changeServiceState?.(AI_TOOLS);
    }
  };

  const confirmationDialogContent = isAiToolsServiceOn
    ? {
        title: t("Common:Confirmation"),
        body: [
          t("Services:DisableAIToolsConfirm", {
            organizationName: logoText,
          }),
          <Trans
            key="DisableBalance"
            i18nKey="Services:DisableAIToolsConfirmBalance"
            t={t}
            values={{
              balance: formatAiServiceCurrency!(
                aiServiceBalance ?? 0,
                3,
                aiServiceCodeCurrency!,
              ),
            }}
            components={{
              1: <span style={{ fontWeight: 600 }} />,
            }}
          />,
          t("Services:DisableAIToolsConfirmReEnable"),
        ],
      }
    : {
        title: t("Common:Confirmation"),
        body: [
          t("Services:AIToolsDescription", {
            productName: t("Common:ProductName"),
            organizationName: logoText,
          }),
          t("Common:WantToContinue"),
        ],
      };

  const onOpenPricingBilling = () => {
    onPricingBillingClick?.();
    setIsPricingBillingVisible(true);
  };

  const onClosePricingBilling = () => {
    setIsPricingBillingVisible(false);
  };

  const onOpenTopUp = () => {
    onTopUpClick?.();
    setIsPricingBillingVisible(false);

    if (!isAiToolsServiceOn) {
      setIsTopUpConfirmVisible(true);
      return;
    }

    setIsTopUpVisible(true);
  };

  const onCloseTopUpConfirm = () => {
    setIsTopUpConfirmVisible(false);
  };

  const onConfirmTopUp = () => {
    setIsTopUpConfirmVisible(false);
    setIsTopUpVisible(true);
  };

  const onCloseTopUp = () => {
    setIsTopUpVisible(false);
  };

  const tabsItems: TTabItem[] = [
    {
      id: "usage",
      name: t("Usage"),
      content: (
        <div>
          <TransactionHistory
            withoutHeader={currentDeviceType !== DeviceType.mobile}
            serviceName={AI_TOOLS}
          />
        </div>
      ),
    },
    {
      id: "model-settings",
      name: t("ModelSettings"),
      content: <ModelSettingsTable isDisabled={isDisabled} />,
    },
  ];

  if (!isInitAiPage || !wasFirstAiServiceTopUp) return <AiPageLoader />;

  return (
    <div className={styles.container}>
      <PricingBillingBody
        visible={isPricingBillingVisible}
        onClose={onClosePricingBilling}
        isBackButton={false}
        withoutFooter
      />

      <TopUpContainer
        visible={isTopUpVisible}
        onCloseTopUpModal={onCloseTopUp}
        onBackClick={onCloseTopUp}
      />
      <div className={styles.toggleSection}>
        <ServiceToggleSection
          isEnabled={isAiToolsServiceOn}
          onToggle={onToggleChange}
          title={t("EnableOrganizationAI", { organizationName: logoText })}
          description={t("EnableAIDescription")}
          testId="service-ai-toggle-button"
          isDisabled={isDisabled}
        />
        <div className={styles.payerSection}>
          {/* @ts-expect-error all props are injected via MobX inject() */}
          {isDisabled ? <PayerInformation /> : null}
        </div>

        {isAiToolsServiceOn && isAiServiceLowBalance ? (
          <Text fontSize="15px" fontWeight={700} className={styles.lowBalance}>
            {t("LowBalance")}
          </Text>
        ) : null}
      </div>

      <div className={styles.balanceSection}>
        <div className={styles.balanceCard}>
          <BalanceAmount
            amount={aiServiceBalance}
            currency={aiServiceCodeCurrency}
            title={t("AvailableCredits")}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />

          <Button
            size={ButtonSize.small}
            primary
            label={t("TopUpCredits")}
            onClick={onOpenTopUp}
            scale
            testId="top_up_credits_button"
            isDisabled={isDisabled}
          />
        </div>
      </div>
      <div className={styles.lastTopUpRow}>
        {aiServiceLastCreditAmount ? (
          <Text className={styles.lastTopUpLabel} fontWeight={600}>
            <Trans
              t={t}
              ns="Services"
              i18nKey="LastTopUp"
              components={{
                1: <Text fontWeight={600} as="span" />,
              }}
              values={{
                currency: formatAiServiceCurrency!(
                  aiServiceLastCreditAmount,
                  3,
                  aiServiceLastCreditCurrency!,
                ),
                date: formatDateLocalized(
                  aiServiceLastCreditDate,
                  "DATE_FULL",
                  {
                    locale: language,
                    timezone: getAppTimezone(),
                  },
                ),
              }}
            />
          </Text>
        ) : null}

        <Link
          className={styles.pricingLink}
          onClick={onOpenPricingBilling}
          textDecoration="underline dotted"
          color="accent"
        >
          <Text fontSize="13px" fontWeight={600}>
            {t("AIPricingAndBilling")}
          </Text>
        </Link>
      </div>

      <div className={styles.tabsWrapper}>
        <Tabs
          items={tabsItems}
          selectedItemId={selectedTabId}
          onSelect={(item) => setSelectedTabId(item.id)}
          withoutStickyIntend
          //withAnimation
        />
      </div>

      {isConfirmDialogVisible ? (
        <ConfirmationDialog
          visible={isConfirmDialogVisible}
          onClose={onCloseConfirmDialog}
          onConfirm={onConfirm}
          title={confirmationDialogContent.title}
          bodyText={confirmationDialogContent.body}
        />
      ) : null}

      {isTopUpConfirmVisible ? (
        <ConfirmationDialog
          visible={isTopUpConfirmVisible}
          onClose={onCloseTopUpConfirm}
          onConfirm={onConfirmTopUp}
          title={t("ServiceIsDisabled")}
          bodyText={t("AddCreditsToEnableAI", { organizationName: logoText })}
        />
      ) : null}
    </div>
  );
};

export default inject(
  ({
    servicesStore,
    paymentStore,
    settingsStore,
    authStore,
    currentQuotaStore,
  }: TStore) => {
    const {
      fetchTransactionHistory,
      changeServiceState,
      isAiToolsServiceOn,
      cardLinkedOnFreeTariff,
      isPayer,
    } = paymentStore;
    const { logoText, currentDeviceType } = settingsStore;
    const { language } = authStore;
    const {
      aiServiceCodeCurrency,
      aiServiceBalance,
      fetchAiServiceBalance,
      aiServiceLastCreditAmount,
      aiServiceLastCreditCurrency,
      formatAiServiceCurrency,
      aiServiceLastCreditDate,
      isAiServiceLowBalance,
      isInitAiPage,
      wasFirstAiServiceTopUp,
    } = servicesStore;
    const { isFreeTariff } = currentQuotaStore;
    return {
      aiServiceBalance,
      aiServiceCodeCurrency,
      fetchAiServiceBalance,
      fetchTransactionHistory,
      logoText,
      aiServiceLastCreditAmount,
      aiServiceLastCreditCurrency,
      formatAiServiceCurrency,
      aiServiceLastCreditDate,
      language,
      isAiServiceLowBalance,
      changeServiceState,
      isAiToolsServiceOn,
      isInitAiPage,
      cardLinkedOnFreeTariff,
      isPayer,
      isFreeTariff,
      currentDeviceType,
      wasFirstAiServiceTopUp,
    };
  },
)(observer(AiPage));
