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
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { toAbsoluteUrl } from "../../utils/index";

import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType } from "@docspace/shared/enums";
import { Link } from "@docspace/ui-kit/components/link";
import { TColorScheme } from "@docspace/ui-kit/providers/theme/themes";

import { finishRefreshingWithMinCycle } from "SRC_DIR/helpers/refreshing";

import TransactionHistory from "../shared/transaction-history";
import TopUpModal from "../shared/top-up-balance/TopUpModal";
import WalletRefilledModal from "./WalletRefilledModal";
import AutoPaymentInfo from "./sub-components/AutoPaymentInfo";
import styles from "./styles/Wallet.module.scss";
import BalanceAmount from "../shared/balance-amount";

type WalletProps = {
  walletBalance: number;
  walletCodeCurrency: string;
  isVisibleWalletSettings: boolean;
  wasChangeBalance?: boolean;
  isCardLinkedToPortal?: boolean;
  fetchBalance?: () => Promise<void>;
  fetchTransactionHistory?: () => Promise<void>;
  canUpdateTariff: VoidFunction;
  isNotPaidPeriod?: boolean;
  isMobile?: boolean;
  walletCustomerStatusNotActive?: boolean;
  cardLinked?: string;
  isPayer?: boolean;
  payerEmail?: string;
  walletHelpUrl?: string;
  currentColorScheme?: TColorScheme;
  reccomendedAmount?: string;
};

const Wallet = (props: WalletProps) => {
  const {
    walletBalance,
    walletCodeCurrency,
    isCardLinkedToPortal,
    isVisibleWalletSettings,
    wasChangeBalance,
    fetchBalance,
    fetchTransactionHistory,
    canUpdateTariff,
    isNotPaidPeriod,
    isMobile,
    walletCustomerStatusNotActive,
    cardLinked,
    isPayer,
    payerEmail,
    walletHelpUrl,
    currentColorScheme,
    reccomendedAmount,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);

  const [visible, setVisible] = useState(isVisibleWalletSettings);
  const [isEditAutoPayment, setIsEditAutoPayment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onClose = () => {
    setVisible(false);
  };

  const onOpen = () => {
    setVisible(true);
    setIsEditAutoPayment(false);
  };

  const onOpenLink = () => {
    setVisible(true);
    setIsEditAutoPayment(true);
  };

  const onClick = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    const startTime = Date.now();

    try {
      await Promise.all([fetchBalance!(), fetchTransactionHistory!()]);
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      finishRefreshingWithMinCycle({
        startTime,
        setRefreshing: setIsRefreshing,
      });
    }
  };

  const goLinkCard = () => {
    cardLinked
      ? window.open(toAbsoluteUrl(cardLinked), "_self")
      : toastr.error(t("Common:UnexpectedError"));
  };

  return (
    <div className={styles.walletContainer}>
      <Text className={styles.walletDescription}>
        {t("WalletDescription", { productName: t("Common:ProductName") })}
      </Text>

      {walletHelpUrl ? (
        <Link
          textDecoration="underline"
          fontWeight={600}
          href={walletHelpUrl}
          color={currentColorScheme?.main?.accent ?? undefined}
          dataTestId="wallet_learn_more_link"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}

      <div className={styles.balanceWrapper}>
        <BalanceAmount
          title={t("BalanceText")}
          showRefresh={!isNotPaidPeriod && isCardLinkedToPortal}
          isRefreshing={isRefreshing}
          onRefresh={onClick}
          amount={walletBalance}
          currency={walletCodeCurrency}
        />

        <Button
          size={isMobile ? ButtonSize.normal : ButtonSize.small}
          primary
          label={t("TopUpBalance")}
          onClick={onOpen}
          isDisabled={!canUpdateTariff || isNotPaidPeriod}
          scale={isMobile}
          className={classNames(styles.topUpButton, {
            [styles.isMobileButton]: isMobile,
          })}
          testId="top_up_balance_button"
        />
      </div>

      {walletCustomerStatusNotActive ? (
        <div className={styles.walletCustomerStatusNotActive}>
          <Text fontWeight={600} className={styles.warningColor}>
            {t("CardUnlinked")}
          </Text>
          <Text as="span" className={styles.warningColor}>
            {isPayer ? (
              t("LinkNewCard")
            ) : (
              <Trans
                t={t}
                i18nKey="LinkNewCardEmail"
                values={{
                  email: payerEmail,
                }}
                components={{
                  1: (
                    <Link
                      textDecoration="underline"
                      fontWeight="600"
                      className="error_description_link"
                      href={`mailto:${payerEmail}`}
                    />
                  ),
                }}
              />
            )}
          </Text>{" "}
          {isPayer ? (
            <Link
              as="span"
              onClick={goLinkCard}
              fontWeight={600}
              textDecoration="underline"
            >
              {t("AddPaymentMethod")}
            </Link>
          ) : null}
        </div>
      ) : (
        <AutoPaymentInfo onOpen={onOpenLink} />
      )}

      {visible ? (
        <TopUpModal
          visible={visible}
          onClose={onClose}
          isEditAutoPayment={isEditAutoPayment}
          reccomendedAmount={reccomendedAmount}
        />
      ) : null}

      {wasChangeBalance ? (
        <WalletRefilledModal visible={wasChangeBalance} />
      ) : null}

      <TransactionHistory />
    </div>
  );
};

export default inject(
  ({
    paymentStore,
    authStore,
    currentQuotaStore,
    currentTariffStatusStore,
    settingsStore,
  }: TStore) => {
    const {
      walletBalance,
      cardLinked,
      walletCodeCurrency,
      isPayer,
      isVisibleWalletSettings,
      wasChangeBalance,
      fetchBalance,
      fetchTransactionHistory,
      canUpdateTariff,
      isCardLinkedToPortal,
      reccomendedAmount,
    } = paymentStore;
    const { isFreeTariff } = currentQuotaStore;
    const {
      isNotPaidPeriod,
      walletCustomerStatusNotActive,
      walletCustomerEmail,
    } = currentTariffStatusStore;
    const { currentDeviceType, walletHelpUrl, currentColorScheme } =
      settingsStore;

    const isMobile = currentDeviceType === DeviceType.mobile;
    return {
      walletBalance,
      walletCodeCurrency,
      cardLinked,
      isPayer,
      isFreeTariff,
      isVisibleWalletSettings,
      wasChangeBalance,
      fetchBalance,
      fetchTransactionHistory,
      canUpdateTariff,
      isCardLinkedToPortal,
      isNotPaidPeriod,
      isMobile,
      walletCustomerStatusNotActive,
      payerEmail: walletCustomerEmail,
      walletHelpUrl,
      currentColorScheme,
      reccomendedAmount,
    };
  },
)(observer(Wallet));

