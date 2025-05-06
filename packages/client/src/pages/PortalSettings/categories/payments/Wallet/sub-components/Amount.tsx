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
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { Tabs, TabsTypes, TTabItem } from "@docspace/shared/components/tabs";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { Tooltip } from "@docspace/shared/components/tooltip";

import { formatCurrencyValue } from "../utils";
import "../styles/Amount.scss";

type AmountProps = {
  setAmount: (amount: string) => void;
  amount: string;
  language: string;
  currency: string;
  walletCustomerEmail?: boolean;
};

const Amount = (props: AmountProps) => {
  const { setAmount, amount, language, currency, walletCustomerEmail } = props;

  const [selectedAmount, setSelectedAmount] = useState<string | undefined>();
  const { t } = useTranslation("Payments");

  const amountTabs = useMemo(
    () => [
      {
        name: formatCurrencyValue(language, 10, currency),
        id: "10",
        value: 10,
        content: null,
        isDisabled: !walletCustomerEmail,
      },
      {
        name: formatCurrencyValue(language, 20, currency),
        id: "20",
        value: 20,
        content: null,
        isDisabled: !walletCustomerEmail,
      },
      {
        name: formatCurrencyValue(language, 30, currency),
        id: "30",
        value: 30,
        content: null,
        isDisabled: !walletCustomerEmail,
      },
      {
        name: formatCurrencyValue(language, 50, currency),
        id: "50",
        value: 50,
        content: null,
        isDisabled: !walletCustomerEmail,
      },
      {
        name: formatCurrencyValue(language, 100, currency),
        id: "100",
        value: 100,
        content: null,
        isDisabled: !walletCustomerEmail,
      },
    ],
    [language, currency, walletCustomerEmail],
  );

  const onSelectAmount = (data: TTabItem) => {
    setSelectedAmount(data.id);
    setAmount(data.id);
  };

  const onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      setAmount(value);
      setSelectedAmount(value);
    }
  };

  const textTooltip = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("FirstAddPaymentMethod")}
      </Text>
    );
  };

  return (
    <div className="amount-container">
      <div data-tooltip-id="iconTooltip">
        <div className="tabs-wrapper">
          <Text fontWeight="700" fontSize="16px" className="amount-title-main">
            {t("AmountSelection")}
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
        <Text fontWeight={600} className="amount-title ">
          {t("Amount")}
        </Text>
        <TextInput
          value={amount}
          onChange={onChangeTextInput}
          pattern="\d+"
          scale
          withBorder
          type={InputType.text}
          placeholder={t("EnterAmount")}
          isDisabled={!walletCustomerEmail}
        />
      </div>
      {!walletCustomerEmail ? (
        <Tooltip
          id="iconTooltip"
          place="bottom"
          maxWidth="300px"
          float
          getContent={textTooltip}
          openOnClick={isMobile}
        />
      ) : null}
    </div>
  );
};

export default Amount;
