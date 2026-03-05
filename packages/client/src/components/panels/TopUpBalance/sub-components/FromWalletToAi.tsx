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

import { Text } from "@docspace/ui-kit/components/text";
import modalStyles from "../styles/TopUpAiModal.module.scss";
import WalletInfo from "./WalletInfo";
import AiAgents from "PUBLIC_DIR/images/icons/16/ai-agents.svg?url";
import { useTranslation } from "react-i18next";
import { useAmountValue } from "../../../../pages/PortalSettings/categories/payments/Wallet/context";
import { inject, observer } from "mobx-react";
import React, { useEffect } from "react";

interface IFromWalletToAi {
  onTopUpBalance: () => void;
  onAmountDifferenceChange?: (diff: number, amount: number) => void;
  walletBalance?: number;
  logoText?: string;
  formatAiServiceCurrency?: () => string;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;

  walletCustomerEmail?: string;
}

const FromWalletToAi = (props: IFromWalletToAi) => {
  const {
    onTopUpBalance,
    onAmountDifferenceChange,
    walletBalance,
    logoText,
    formatAiServiceCurrency,
    formatWalletCurrency,

    walletCustomerEmail,
  } = props;
  const { t } = useTranslation(["Payments", "Services", "Common"]);
  const aiServiceBalanceValue = formatAiServiceCurrency!();
  const { amount } = useAmountValue();
  const balanceValue = formatWalletCurrency!();

  const amountNumber = Number(amount);
  const walletBalanceNumber = walletBalance!;
  const amountDiff = Math.abs(amountNumber - walletBalanceNumber);

  useEffect(() => {
    if (onAmountDifferenceChange)
      onAmountDifferenceChange(Math.ceil(amountDiff), amountNumber);
  }, [amountDiff, amountNumber, onAmountDifferenceChange]);

  const isBalanceInsufficient =
    !walletCustomerEmail ||
    walletBalanceNumber === 0 ||
    amountNumber > walletBalanceNumber;

  return (
    <div className={modalStyles.transferSection}>
      <div className={modalStyles.transferBlock}>
        <Text fontWeight="600">{t("Payments:TopUpFrom")}</Text>

        <WalletInfo
          balance={balanceValue}
          isBalanceInsufficient={isBalanceInsufficient}
          onTopUp={isBalanceInsufficient ? onTopUpBalance : undefined}
        />
      </div>

      <div className={modalStyles.transferBlock}>
        <Text fontWeight="600">{t("Payments:TopUpTo")}</Text>

        <WalletInfo
          title={t("Services:OrganizationAI", {
            organizationName: logoText,
          })}
          balance={aiServiceBalanceValue}
          iconUrl={AiAgents}
        />
      </div>
    </div>
  );
};

export default inject(
  ({
    paymentStore,
    settingsStore,
    servicesStore,
    currentTariffStatusStore,
  }: TStore) => {
    const { formatAiServiceCurrency } = servicesStore;

    const { logoText } = settingsStore;
    const { walletBalance, formatWalletCurrency } = paymentStore;
    const { walletCustomerEmail } = currentTariffStatusStore;
    return {
      logoText,
      formatAiServiceCurrency,
      walletBalance,
      formatWalletCurrency,

      walletCustomerEmail,
    };
  },
)(observer(FromWalletToAi));
