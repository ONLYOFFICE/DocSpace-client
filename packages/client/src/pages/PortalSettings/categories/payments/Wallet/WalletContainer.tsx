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
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { IconButton } from "@docspace/shared/components/icon-button";
import { toastr } from "@docspace/shared/components/toast";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import TransactionHistory from "./TransactionHistory";
import TopUpModal from "./TopUpModal";
import WalletRefilledModal from "./WalletRefilledModal";
import { formattedBalanceTokens } from "./utils";
import PayerInformation from "../PayerInformation";
import AutoPaymentInfo from "./sub-components/AutoPaymentInfo";
import "./styles/Wallet.scss";
import refreshStyles from "./styles/RefreshIcon.module.scss";

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
      className={classNames(refreshStyles.refreshIcon, {
        [refreshStyles.spinning]: isRefreshing,
      })}
    />
  );
};

type WalletProps = {
  walletBalance: number;
  language: string;
  walletCodeCurrency: string;
  isPayer: boolean;
  cardLinkedOnFreeTariff: boolean;
  isFreeTariff: boolean;
  isNonProfit: boolean;
  isVisibleWalletSettings: boolean;
  wasChangeBalance?: boolean;
  wasFirstTopUp?: boolean;
  fetchBalance?: () => Promise<void>;
  fetchTransactionHistory?: () => Promise<void>;
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
    isPayer,
    cardLinkedOnFreeTariff,
    isFreeTariff,
    isNonProfit,
    isVisibleWalletSettings,
    wasChangeBalance,
    fetchBalance,
    fetchTransactionHistory,
    wasFirstTopUp,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);

  const [visible, setVisible] = useState(isVisibleWalletSettings);
  const [isEditAutoPayment, setIsEditAutoPayment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tokens = formattedBalanceTokens(
    language,
    walletBalance,
    walletCodeCurrency || "",
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

  const isDisbled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;

  const onClick = async () => {
    setIsRefreshing(true);

    const startTime = Date.now();

    try {
      await Promise.all([fetchBalance!(), fetchTransactionHistory!()]);

      const elapsedTime = Date.now() - startTime;
      const minimumAnimationTime = 1000;

      const waitForAnimation = async () => {
        const delay = minimumAnimationTime - elapsedTime;
        await new Promise((resolve) => {
          setTimeout(resolve, delay);
        });
      };

      if (elapsedTime < minimumAnimationTime) {
        await waitForAnimation();
      }
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="wallet-container">
      <Text className="wallet-description">
        {t("WalletDescription", { productName: t("Common:ProductName") })}
      </Text>
      {!isNonProfit && (cardLinkedOnFreeTariff || !isFreeTariff) ? (
        <PayerInformation />
      ) : null}

      <div className="balance-wrapper">
        <div className="header-container">
          <Text isBold fontSize="16px">
            {t("BalanceText")}
          </Text>
          {wasFirstTopUp ? (
            <RefreshIconButton isRefreshing={isRefreshing} onClick={onClick} />
          ) : null}
        </div>

        <div className="balance-amount-container">
          {tokens.map((token) => (
            <Text
              key={`${token.type}-${token.value}`}
              className={typeClassMap[token.type] || ""}
            >
              {token.value}
            </Text>
          ))}
        </div>

        <Button
          size={ButtonSize.normal}
          primary
          label={t("TopUpBalance")}
          onClick={onOpen}
          isDisabled={isDisbled}
        />
      </div>

      <AutoPaymentInfo onOpen={onOpenLink} />

      {visible ? (
        <TopUpModal
          visible={visible}
          onClose={onClose}
          isEditAutoPayment={isEditAutoPayment}
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
  ({ paymentStore, authStore, currentQuotaStore }: TStore) => {
    const { language } = authStore;
    const {
      walletBalance,
      cardLinked,
      cardLinkedOnFreeTariff,
      walletCodeCurrency,
      isPayer,
      isVisibleWalletSettings,
      wasChangeBalance,
      wasFirstTopUp,
      fetchBalance,
      fetchTransactionHistory,
    } = paymentStore;
    const { isFreeTariff, isNonProfit } = currentQuotaStore;

    return {
      walletBalance,
      walletCodeCurrency,
      language,
      cardLinked,
      isPayer,
      cardLinkedOnFreeTariff,
      isFreeTariff,
      isNonProfit,
      isVisibleWalletSettings,
      wasChangeBalance,
      wasFirstTopUp,
      fetchBalance,
      fetchTransactionHistory,
    };
  },
)(observer(Wallet));
