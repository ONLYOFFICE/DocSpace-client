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
import { AmountProvider } from "../../../pages/PortalSettings/categories/payments/Wallet/context";
import styles from "./styles/TopUpModal.module.scss";

import modalStyles from "./styles/TopUpAiModal.module.scss";
import { buyWalletService } from "@docspace/shared/api/portal";

import { useNavigate } from "react-router";

import FromWalletToAi from "./sub-components/FromWalletToAi";
import { AI_TOOLS } from "@docspace/shared/constants";
import { DateTime } from "luxon";

type TopUpAiModalProps = {
  onTopUpBalance: () => void;
  onAmountDifferenceChange?: (diff: number, amount: number) => void;
  visible: boolean;
  currency?: string;
  fetchTransactionHistory?: (
    startDate: DateTime | null,
    endDate: DateTime | null,
    credit: boolean,
    debit: boolean,
    participantName?: string,
  ) => Promise<void>;
  walletCustomerEmail?: boolean;
  fetchBalance?: () => Promise<void>;
  fetchAiServiceBalance?: () => Promise<void>;
  onClose: (isTopUp: boolean) => void;
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
  walletBalance?: number;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
  initialAmount?: string;
  logoText?: string;
};

const TopUpAiModal = (props: TopUpAiModalProps) => {
  const {
    visible,
    currency = "",
    fetchTransactionHistory,
    walletCustomerEmail,
    fetchBalance,
    fetchAiServiceBalance,
    onClose,
    headerProps,
    reccomendedAmount,
    walletCustomerStatusNotActive,
    formatWalletCurrency,
    walletBalance,
    onTopUpBalance,
    onAmountDifferenceChange,
    initialAmount,
    logoText,
  } = props;

  const { t } = useTranslation(["Payments", "Services", "Common"]);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = (isLoading || walletCustomerStatusNotActive) ?? false;

  const onRedirect = () => {
    navigate("/portal-settings/ai-services");

    onClose(false);
  };

  const onCloseGlobal = () => {
    onClose(false);
  };

  const onFetchHistory = async () => {
    await fetchTransactionHistory?.(null, null, true, true, AI_TOOLS);
  };

  return (
    <AmountProvider initialAmount={reccomendedAmount || initialAmount}>
      <ModalDialog
        visible={visible}
        onClose={onCloseGlobal}
        displayType={ModalDialogType.aside}
        {...headerProps}
        withBodyScroll
      >
        <ModalDialog.Header>
          {t("TopUpAi", { organizationName: logoText })}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.modalBody}>
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
              maxValue={walletBalance?.toString()}
            />

            <Text fontSize="12px" className={modalStyles.helperText}>
              {t("Payments:AICreditsHelper")}
            </Text>
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <TopUpButtons
            currency={currency}
            fetchBalance={fetchBalance}
            fetchServiceBalance={fetchAiServiceBalance}
            fetchTransactionHistory={onFetchHistory}
            onClose={onClose}
            walletCustomerEmail={walletCustomerEmail}
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
      walletBalance,
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
      walletBalance,
      fetchAiServiceBalance,
    };
  },
)(observer(TopUpAiModal));
