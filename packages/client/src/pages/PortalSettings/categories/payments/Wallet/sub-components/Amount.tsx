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
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { TabItem } from "@docspace/shared/components/tab-item";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Tooltip } from "@docspace/shared/components/tooltip";

import styles from "../styles/Amount.module.scss";
import { useAmountValue } from "../context";

type AmountProps = {
  isDisabled: boolean;
  walletCustomerEmail?: boolean;
  walletCustomerStatusNotActive?: boolean;
  reccomendedAmount?: string;
  formatWalletCurrency?: (item: number, fractionDigits?: number) => string;
};

const MAX_LENGTH = 6;

const Amount = (props: AmountProps) => {
  const {
    walletCustomerEmail,
    isDisabled,
    walletCustomerStatusNotActive,
    reccomendedAmount,
    formatWalletCurrency,
  } = props;

  const { amount, setAmount } = useAmountValue();
  const [selectedAmount, setSelectedAmount] = useState<string | undefined>();
  const { t } = useTranslation("Payments");

  const getAmountTabs = () => {
    const amounts = [10, 20, 30, 50, 100];
    return amounts.map((item) => ({
      name: `+${formatWalletCurrency!(item, 0)}`,
      id: item.toString(),
      value: item,
      content: null,
      isDisabled: isDisabled || !walletCustomerEmail,
    }));
  };

  const onSelectAmount = (e: React.MouseEvent<HTMLDivElement>) => {
    const itemId = e.currentTarget.dataset.id;
    const currentAmount = amount ? parseInt(amount, 10) : 0;
    const selectedValue = parseInt(itemId!, 10);
    const newTotal = (currentAmount + selectedValue).toString();

    const amountValue = newTotal.length <= MAX_LENGTH ? newTotal : amount;
    setSelectedAmount(itemId);
    setAmount(amountValue);
  };

  const onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (!validity.valid) return;

    setAmount(value);
  };

  const textTooltip = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("FirstAddPaymentMethod")}
      </Text>
    );
  };

  const amountTabs = getAmountTabs();

  return (
    <div className={styles.amountContainer}>
      <div data-tooltip-id="iconTooltip">
        <div className={styles.tabsWrapper}>
          <Text
            fontWeight="700"
            fontSize="16px"
            className={styles.amountTitleMain}
          >
            {t("AmountSelection")}
          </Text>
          <div className={styles.amountTabItemsContainer}>
            {amountTabs.map((item) => (
              <TabItem
                key={item.id}
                data-id={item.id}
                label={item.name}
                isActive={selectedAmount === item.id}
                onSelect={onSelectAmount}
                isDisabled={item.isDisabled}
                dataTestId={`tab_item_${item.id}`}
              />
            ))}
          </div>
        </div>
        <Text fontWeight={600} className={styles.amountTitle}>
          {t("Amount")}
        </Text>

        <TextInput
          value={amount}
          onChange={onChangeTextInput}
          pattern="^[1-9]\d*$"
          scale
          withBorder
          type={InputType.text}
          placeholder={t("EnterAmount")}
          isDisabled={isDisabled || !walletCustomerEmail}
          maxLength={MAX_LENGTH}
          testId="top_up_amount_input"
        />
        {reccomendedAmount ? (
          <Text className={styles.reccomendedAmount}>
            {t("RecommendedTopUpAmount", {
              amount: formatWalletCurrency!(+reccomendedAmount, 0),
            })}
          </Text>
        ) : null}
      </div>
      {!walletCustomerEmail || walletCustomerStatusNotActive ? (
        <Tooltip
          id="iconTooltip"
          place="bottom"
          maxWidth="300px"
          float
          getContent={textTooltip}
          openOnClick={isMobile}
          dataTestId="amount_tooltip"
        />
      ) : null}
    </div>
  );
};

export default Amount;
