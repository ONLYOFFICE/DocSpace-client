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
import React, { useState, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";

type AmountProps = {
  setAmount: (amount: string) => void;
  amount: string;
  language?: string;
  currency?: string;
};

const formattedAmount = (
  value: number,
  language: string = "en",
  currency: string = "USD",
) => {
  const formatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
};

const Amount = ({ setAmount, amount, language, currency }: AmountProps) => {
  const [selectedAmount, setSelectedAmount] = useState<string | undefined>();
  const { t } = useTranslation("Payments");

  const amountTabs = useMemo(
    () => [
      {
        name: formattedAmount(10, language, currency),
        id: "10",
        value: 10,
        content: null,
      },
      {
        name: formattedAmount(20, language, currency),
        id: "20",
        value: 20,
        content: null,
      },
      {
        name: formattedAmount(30, language, currency),
        id: "30",
        value: 30,
        content: null,
      },
      {
        name: formattedAmount(50, language, currency),
        id: "50",
        value: 50,
        content: null,
      },
      {
        name: formattedAmount(100, language, currency),
        id: "100",
        value: 100,
        content: null,
      },
    ],
    [language, currency],
  );

  const onSelectAmount = (data: {
    id: string;
    value: number;
    name: string;
  }) => {
    setSelectedAmount(data.id);
    setAmount(data.value.toString());
  };

  const onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      setAmount(value);
      setSelectedAmount(value);
    }
  };

  return (
    <div className="amount-container">
      <Text fontWeight="700" fontSize="16px">
        {t("AmountSelection")}
      </Text>
      <Tabs
        items={amountTabs}
        selectedItemId={selectedAmount}
        onSelect={onSelectAmount}
        type={TabsTypes.Secondary}
        allowNoSelection
      />
      <Text fontWeight={600}>{t("Amount")}</Text>
      <TextInput
        value={amount}
        onChange={onChangeTextInput}
        pattern="^\d+(?:\.\d{0,2})?"
        scale
        withBorder
        type={InputType.text}
        placeholder={t("EnterAmount")}
      />
    </div>
  );
};

export default inject(({ paymentStore, authStore }: TStore) => {
  const { language } = authStore;
  const { walletBalance } = paymentStore;

  return {
    currency: walletBalance.subAccounts[0].currency,
    language,
  };
})(observer(Amount));
