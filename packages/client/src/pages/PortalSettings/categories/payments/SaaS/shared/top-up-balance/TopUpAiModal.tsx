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
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";

import Amount from "./sub-components/Amount";
import TopUpButtons from "./sub-components/TopUpButtons";
import { AmountProvider } from "../../wallet/context";
import styles from "./styles/TopUpModal.module.scss";

import modalStyles from "./styles/TopUpAiModal.module.scss";
import { buyWalletService } from "@docspace/shared/api/portal";

import { useNavigate } from "react-router";

import FromWalletToAi from "./sub-components/FromWalletToAi";
import { AI_TOOLS } from "@docspace/shared/constants";
import { DateTime } from "luxon";
import { Link } from "@docspace/ui-kit/components";

type TopUpAiModalProps = {
  onTopUpBalance: () => void;
  onPricingBillingClick: () => void;
  onGetStartedClick: () => void;
  onAmountDifferenceChange?: (diff: number, amount: number) => void;
  visible: boolean;
  currency?: string;
  fetchTransactionHistory?: (
    startDate?: DateTime | null,
    endDate?: DateTime | null,
    credit?: boolean,
    debit?: boolean,
    participantName?: string,
    serviceName?: string,
  ) => Promise<void>;
  walletCustomerEmail?: string;
  fetchBalance?: () => Promise<void>;
  fetchAiServiceBalance?: () => Promise<void>;

  cardLinked?: string;
  accountLink?: string;
  isEditAutoPayment?: boolean;
  headerProps?: {
    isBackButton: boolean;
    onBackClick: () => void;
    onCloseClick: () => void;
  };
  wasFirstTopUp?: boolean;
  reccomendedAmount?: string;
  amount?: string;
  walletCustomerStatusNotActive?: boolean;

  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
  logoText?: string;
  isLoading?: boolean;
};

const TopUpAiModal = (props: TopUpAiModalProps) => {
  const {
    walletCustomerEmail,
    reccomendedAmount,
    walletCustomerStatusNotActive,
    formatWalletCurrency,
    onTopUpBalance,
    onAmountDifferenceChange,
    logoText,
    onPricingBillingClick,
    onGetStartedClick,
    isLoading,
  } = props;

  const { t } = useTranslation(["Payments", "Services", "Common"]);

  const isDisabled = (isLoading || walletCustomerStatusNotActive) ?? false;

  return (
    <>
      <Text className={modalStyles.description}>
        {t("Services:CreditsFromWalletDescription", {
          organizationName: logoText,
        })}
      </Text>

      <Link
        onClick={onGetStartedClick}
        textDecoration="underline dotted"
        color="accent"
        fontWeight={600}
      >
        {t("Services:HowDoesItWork")}
      </Link>

      <FromWalletToAi
        onTopUpBalance={onTopUpBalance}
        onAmountDifferenceChange={onAmountDifferenceChange}
      />

      <Amount
        formatWalletCurrency={formatWalletCurrency}
        walletCustomerEmail={walletCustomerEmail}
        isDisabled={isDisabled}
        walletCustomerStatusNotActive={walletCustomerStatusNotActive}
        reccomendedAmount={reccomendedAmount}
        minValue={"10"}
      />

      <Text fontSize="12px" className={modalStyles.helperText}>
        {t("Payments:AICreditsHelper")}
      </Text>

      <Link
        className={modalStyles.pricingBillingLink}
        onClick={onPricingBillingClick}
        textDecoration="underline dotted"
        color="accent"
        fontWeight={600}
      >
        {t("Services:AIPricingAndBilling")}
      </Link>
    </>
  );
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    settingsStore,
    servicesStore,
  }: TStore) => {
    const {
      fetchBalance,
      fetchTransactionHistory,
      cardLinked,
      accountLink,
      walletCodeCurrency,
      wasFirstTopUp,
      formatWalletCurrency,
    } = paymentStore;
    const { formatAiServiceCurrency, fetchAiServiceBalance } = servicesStore;

    const { walletCustomerStatusNotActive, walletCustomerEmail } =
      currentTariffStatusStore;
    const { logoText } = settingsStore;

    return {
      currency: walletCodeCurrency,
      walletCustomerEmail,
      fetchBalance,
      fetchTransactionHistory,
      cardLinked,
      accountLink,
      wasFirstTopUp,
      walletCustomerStatusNotActive,
      formatWalletCurrency,
      logoText,
      formatAiServiceCurrency,

      fetchAiServiceBalance,
    };
  },
)(observer(TopUpAiModal));
