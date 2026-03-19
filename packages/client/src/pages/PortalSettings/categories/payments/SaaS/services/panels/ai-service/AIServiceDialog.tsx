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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import styles from "../../styles/BackupServiceDialog.module.scss";

import GetStartedBody from "./GetStartedBody";
import PricingBillingBody from "./PricingBillingBody";

import { DateTime } from "luxon";
import { useNavigate } from "react-router";
import { AI_TOOLS } from "@docspace/shared/constants";
import TopUpButtons from "../../../shared/top-up-balance/sub-components/TopUpButtons";

import { buyWalletService } from "@docspace/shared/api/portal";
import TopUpAiModal from "../../../shared/top-up-balance/TopUpAiModal";
import TopUpModal from "../../../shared/top-up-balance/TopUpModal";
import { AmountProvider } from "../../../wallet/context";
interface AIServiceDialogProps {
  visible: boolean;
  onClose: () => void;
  isEnabled?: boolean;
  formatWalletCurrency?: (
    item: number | null,
    fractionDigits: number,
  ) => string;
  fetchTransactionHistory?: (
    startDate?: DateTime | null,
    endDate?: DateTime | null,
    credit?: boolean,
    debit?: boolean,
    participantName?: string,
    serviceName?: string,
  ) => Promise<void>;
  fetchBalance?: () => Promise<void>;
  logoText?: string;
  isTopUpVisible?: boolean;
  fetchAiServiceBalance?: () => Promise<void>;
  walletCustomerEmail?: string;
  walletCustomerStatusNotActive?: boolean;
  currency?: string;
  featureCountData?: number;
  wasFirstAiServiceTopUp?: boolean;
}

type DialogView = "get-started" | "pricing" | "top-up" | "top-up-wallet";

const AIServiceDialog: React.FC<AIServiceDialogProps> = ({
  visible,
  onClose,
  logoText,
  fetchTransactionHistory,
  fetchBalance,
  fetchAiServiceBalance,
  walletCustomerEmail,
  walletCustomerStatusNotActive,
  currency,
  featureCountData,
  wasFirstAiServiceTopUp,
}) => {
  const { t } = useTranslation(["Services", "Common", "Payments"]);

  const [view, setView] = useState<DialogView>("top-up");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendedAmount, setRecommendedAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    featureCountData ?? 0,
  );

  const navigate = useNavigate();

  const onTopUpClick = () => {
    setView("top-up");
  };

  const onGetStartedClick = () => {
    setView("get-started");
  };

  const onPricingBillingClick = () => {
    setView("pricing");
  };

  const onFetchHistory = async () => {
    await fetchTransactionHistory?.(null, null, true, true, AI_TOOLS);
  };

  const onRedirect = () => {
    if (!wasFirstAiServiceTopUp)
      navigate("/portal-settings/payments/services/ai-services");

    onClose();
  };

  const onTopUpBalance = () => {
    setView("top-up-wallet");
  };

  const onAmountDifferenceChange = (diff: number, amount: number) => {
    setRecommendedAmount(diff);
    setSelectedAmount(amount);
  };

  const onBackWalletClick = () => {
    setView("top-up");
  };

  const container =
    view === "top-up-wallet" ? (
      <TopUpModal
        visible={view === "top-up-wallet"}
        onClose={onBackWalletClick}
        afterTopUp={onBackWalletClick}
        headerProps={{
          isBackButton: true,
          onBackClick: onBackWalletClick,
          onCloseClick: onClose,
        }}
        {...(recommendedAmount > 0 && {
          reccomendedAmount: recommendedAmount.toString(),
          amount: selectedAmount.toString(),
        })}
        serviceName={AI_TOOLS}
      />
    ) : view === "get-started" ? (
      <GetStartedBody
        onPricingBillingClick={onPricingBillingClick}
        visible={view === "get-started"}
        onClose={onClose}
        onBack={onTopUpClick}
      />
    ) : view === "pricing" ? (
      <PricingBillingBody
        onBack={onTopUpClick}
        visible={view === "pricing"}
        onClose={onClose}
        onTopUpClick={onTopUpClick}
      />
    ) : null;

  const initialAmount = selectedAmount > 0 ? selectedAmount.toString() : "";

  return (
    <AmountProvider initialAmount={initialAmount}>
      <ModalDialog
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.aside}
        withBodyScroll
        containerVisible={view !== "top-up"}
      >
        <ModalDialog.Container>{container}</ModalDialog.Container>
        <ModalDialog.Header>
          {t("Payments:AddCreditsToAI", { organizationName: logoText })}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.dialogBody}>
            <TopUpAiModal
              onPricingBillingClick={onPricingBillingClick}
              onGetStartedClick={onGetStartedClick}
              onTopUpBalance={onTopUpBalance}
              onAmountDifferenceChange={onAmountDifferenceChange}
              visible={visible}
            />
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <TopUpButtons
            currency={currency!}
            fetchBalance={fetchBalance}
            fetchServiceBalance={fetchAiServiceBalance}
            fetchTransactionHistory={onFetchHistory}
            onClose={onClose}
            walletCustomerEmail={walletCustomerEmail || ""}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
            walletCustomerStatusNotActive={walletCustomerStatusNotActive}
            onTopUpBalance={buyWalletService}
            serviceName={AI_TOOLS}
            afterTopUp={onRedirect}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </AmountProvider>
  );
};

export default inject(
  ({
    paymentStore,
    settingsStore,
    servicesStore,
    currentTariffStatusStore,
  }: TStore) => {
    const {
      formatWalletCurrency,
      fetchTransactionHistory,
      fetchBalance,
      walletCodeCurrency,
    } = paymentStore;
    const { logoText } = settingsStore;

    const { fetchAiServiceBalance, featureCountData, wasFirstAiServiceTopUp } =
      servicesStore;
    const { walletCustomerStatusNotActive, walletCustomerEmail } =
      currentTariffStatusStore;

    return {
      isEnabled: true,
      currency: walletCodeCurrency,
      formatWalletCurrency,
      logoText,
      fetchTransactionHistory,
      fetchBalance,
      fetchAiServiceBalance,
      walletCustomerEmail,
      walletCustomerStatusNotActive,
      featureCountData,
      wasFirstAiServiceTopUp,
    };
  },
)(observer(AIServiceDialog));

