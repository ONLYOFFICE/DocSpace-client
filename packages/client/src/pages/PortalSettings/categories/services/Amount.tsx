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
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";

import { getConvertedSize } from "@docspace/shared/utils/common";
import styles from "./styles/Amount.module.scss";
import { formatCurrencyValue } from "../payments/Wallet/utils";

type AmountProps = {
  setAmount: (amount: string) => void;
  amount: string;
  stepValue?: number;
  storageQuotaIncrement?: number;
  isoCurrencySymbol?: string;
  language?: string;
};

const Amount: React.FC<AmountProps> = ({
  setAmount,
  amount,
  stepValue = 0,
  storageQuotaIncrement = 0,
  isoCurrencySymbol,
  language,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<string | undefined>();
  const { t } = useTranslation("Payments");

  const amountTabs = [
    {
      name: `100 ${t("Common:Gigabyte")}`,
      id: "100",
      value: 100,
      content: null,
    },
    {
      name: `200 ${t("Common:Gigabyte")}`,
      id: "200",
      value: 200,
      content: null,
    },
    {
      name: `500 ${t("Common:Gigabyte")}`,
      id: "500",
      value: 500,
      content: null,
    },
    {
      name: `800 ${t("Common:Gigabyte")}`,
      id: "800",
      value: 800,
      content: null,
    },
    {
      name: `1 ${t("Common:Terabyte")}`,
      id: "1000",
      value: 1000,
      content: null,
    },
  ];

  const onSelectAmount = (element: any) => {
    if (element && element.id) {
      setSelectedAmount(element.id);
      setAmount(element.id);
    }
  };

  const onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      setAmount(value);
      setSelectedAmount(value);
    }
  };

  return (
    <div className={styles.amountContainer}>
      <div className={styles.tabsWrapper}>
        <Text fontWeight="700" fontSize="16px" className={styles.amountTitle}>
          {t("SelectAdditionalCapacity")}
        </Text>
        <Tabs
          items={amountTabs}
          selectedItemId={selectedAmount}
          onSelect={onSelectAmount}
          type={TabsTypes.Secondary}
          allowNoSelection
          withoutStickyIntend
        />
      </div>
      <Text fontWeight={600} className={styles.amountTitle}>
        <Trans
          i18nKey="AmountGB"
          ns="Payments"
          t={t}
          components={{
            1: <Text className={styles.quantity} as="span" fontWeight={600} />,
          }}
        />
      </Text>
      <TextInput
        value={amount}
        onChange={onChangeTextInput}
        pattern="\d+"
        scale
        withBorder
        type={InputType.text}
        placeholder={t("EnterAmount")}
      />

      <Text fontSize="12px" className={styles.storagePerMonth}>
        {t("PerStorage", {
          currency: formatCurrencyValue(
            language!,
            stepValue,
            isoCurrencySymbol!,
            0,
            7,
          ),
          amount: getConvertedSize(t, storageQuotaIncrement),
        })}
      </Text>
    </div>
  );
};

export default inject(({ paymentStore, authStore }: TStore) => {
  const { storageQuotaIncrementPrice, storageQuotaIncrement } = paymentStore;
  const { language } = authStore;
  const { value, isoCurrencySymbol } = storageQuotaIncrementPrice;

  return {
    stepValue: value,
    isoCurrencySymbol,
    storageQuotaIncrement,
    language,
  };
})(observer(Amount));
