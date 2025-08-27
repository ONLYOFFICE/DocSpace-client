// (c) Copyright Ascensio System SIA 2009-2025
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

import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { IconButton } from "@docspace/shared/components/icon-button";
import { toastr } from "@docspace/shared/components/toast";
import { DeviceType } from "@docspace/shared/enums";
import { Link } from "@docspace/shared/components/link";
import { TColorScheme } from "@docspace/shared/themes";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import TransactionHistory from "./TransactionHistory";
import TopUpModal from "../../../../../components/panels/TopUpBalance/TopUpModal";
import WalletRefilledModal from "./WalletRefilledModal";
import { formattedBalanceTokens } from "./utils";
import PayerInformation from "../PayerInformation";
import AutoPaymentInfo from "./sub-components/AutoPaymentInfo";
import styles from "./styles/Wallet.module.scss";

const RefreshIconButton = ({
  isRefreshing,
  onClick,
}: {
  isRefreshing: boolean;
  onClick: () => void;
}) => {
  return (
    <IconButton
      iconName={RefreshReactSvgUrl}
      size={16}
      onClick={onClick}
      className={classNames(styles.refreshIcon, {
        [styles.spinning]: isRefreshing,
      })}
    />
  );
};

type WalletProps = {
  walletBalance: number;
  language: string;
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

const typeClassMap: Record<string, string> = {
  integer: "integer",
  group: "group",
  decimal: "decimal",
  fraction: "fraction",
  currency: "currency",
  literal: "literal",
};

const Wallet = (props: WalletProps) => {
  const {
    walletBalance,
    language,
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

  const tokens = formattedBalanceTokens(
    language,
    walletBalance,
    walletCodeCurrency || "",
    3,
  );

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
      const elapsedTime = Date.now() - startTime;
      const animationCycleTime = 1000;

      if (elapsedTime < animationCycleTime) {
        const delay = animationCycleTime - elapsedTime;

        setTimeout(() => {
          setIsRefreshing(false);
        }, delay);
      } else {
        const totalNeededTime =
          Math.ceil(elapsedTime / animationCycleTime) * animationCycleTime;
        const remainingTime = totalNeededTime - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => {
            setIsRefreshing(false);
          }, remainingTime);
        } else {
          setIsRefreshing(false);
        }
      }
    }
  };

  const goLinkCard = () => {
    cardLinked
      ? window.open(cardLinked, "_self")
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
          color={currentColorScheme?.main?.accent}
          dataTestId="wallet_learn_more_link"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}

      {isCardLinkedToPortal ? (
        <PayerInformation
          style={undefined}
          theme={undefined}
          user={undefined}
          accountLink={undefined}
          payerInfo={undefined}
          email={undefined}
          isNotPaidPeriod={undefined}
          isStripePortalAvailable={undefined}
        />
      ) : null}
      <div className={styles.balanceWrapper}>
        <div className={styles.headerContainer}>
          <Text isBold fontSize="18px" className={styles.balanceTitle}>
            {t("BalanceText")}
          </Text>

          {!isNotPaidPeriod && isCardLinkedToPortal ? (
            <RefreshIconButton isRefreshing={isRefreshing} onClick={onClick} />
          ) : null}
        </div>

        <div className={styles.balanceAmountContainer}>
          {tokens.map((token) => (
            <Text
              key={`${token.type}-${token.value}`}
              className={styles[typeClassMap[token.type]] || ""}
            >
              {token.value}
            </Text>
          ))}
        </div>

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
    const { language } = authStore;
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
      language,
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
