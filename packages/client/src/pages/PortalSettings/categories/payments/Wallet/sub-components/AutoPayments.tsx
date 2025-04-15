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
import { inject, observer } from "mobx-react";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { TextInput, InputType } from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TAutoTopUpSettings } from "@docspace/shared/api/portal/types";

import CheckRoundSvg from "PUBLIC_DIR/images/icons/16/check.round.react.svg";

import "../styles/AutoPayments.scss";
import { formatCurrencyValue } from "../utils";

interface AutoPaymentsProps {
  walletCustomerEmail: boolean;
  isAutoPaymentExist: boolean;
  updateAutoPayments: (
    enabled: boolean,
    minBalance: number,
    upToBalance: number,
    currency: string,
  ) => Promise<void>;
  automaticPayments: TAutoTopUpSettings | null;
  language: string;
  currency: string;
}

interface CurrentPaymentSettingsProps {
  automaticPayments: TAutoTopUpSettings | null;
  language: string;
  currency: string;
}

const CurrentPaymentSettings = ({
  automaticPayments,
  language,
  currency,
}: CurrentPaymentSettingsProps) => {
  const { t } = useTranslation("Payments");

  if (!automaticPayments) return null;

  const { minBalance, upToBalance } = automaticPayments;

  return (
    <div className="info-block">
      <div className="info-block-title">
        <CheckRoundSvg />
        <Text fontSize="12px" fontWeight={600}>
          {t("AutoTopUp")}
        </Text>
      </div>
      <Text fontSize="12px" fontWeight={400} className="info-description">
        {t("WhenBalanceDropsTo", {
          min: formatCurrencyValue(language, minBalance, currency),
          max: formatCurrencyValue(language, upToBalance, currency),
        })}
      </Text>
    </div>
  );
};

const AutoPayments: React.FC<AutoPaymentsProps> = ({
  walletCustomerEmail,
  isAutoPaymentExist,
  automaticPayments,
  updateAutoPayments,
  language,
  currency,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const [isAutomaticPaymentsEnabled, setIsAutomaticPaymentsEnabled] =
    useState(isAutoPaymentExist);
  const [minBalance, setMinBalance] = useState(
    isAutoPaymentExist ? automaticPayments?.minBalance.toString() : "",
  );
  const [upToBalance, setUpToBalance] = useState(
    isAutoPaymentExist ? automaticPayments?.upToBalance.toString() : "",
  );
  const [minBalanceError, setMinBalanceError] = useState(false);
  const [upToBalanceError, setUpToBalanceError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentSettings, setIsCurrentSettings] =
    useState(isAutoPaymentExist);
  const [animateSettings, setAnimateSettings] = useState(isAutoPaymentExist);
  const [minUpToBalance, setMinUpToBalance] = useState(6);

  const validateMinBalance = (value: string) => {
    const numValue = parseInt(value, 10);

    if (Number.isNaN(numValue) || numValue < 5 || numValue > 1000) {
      setMinBalanceError(true);
      return;
    }

    setMinBalanceError(false);
    setMinUpToBalance(numValue + 1);
  };

  const validateMaxUpToBalance = (value: string) => {
    const numValue = parseInt(value, 10);
    const minInputValue = minBalance ? parseInt(minBalance, 10) : 5;
    const minValue = minInputValue + 1;

    if (Number.isNaN(numValue) || numValue < minValue || numValue > 5000) {
      setUpToBalanceError(true);
      return;
    }

    setUpToBalanceError(false);
  };

  const onMinBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setMinBalance(value);
    validateMinBalance(value);
  };

  const onMaxUpToBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setUpToBalance(value);
    validateMaxUpToBalance(value);
  };

  const onToggleClick = () => {
    setIsAutomaticPaymentsEnabled(!isAutomaticPaymentsEnabled);
  };

  const onSave = async () => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    try {
      await updateAutoPayments(true, +minBalance, +upToBalance, currency);

      setIsCurrentSettings(true);
      setAnimateSettings(false);
      setTimeout(() => {
        setAnimateSettings(true);
      }, 50);
    } catch (error) {
      toastr.error(error as string);
    }

    clearTimeout(timerId);
    setIsLoading(false);
  };

  const onClose = () => {
    if (isAutoPaymentExist) {
      setIsCurrentSettings(true);
      setAnimateSettings(false);
      setTimeout(() => {
        setAnimateSettings(true);
      }, 50);
      return;
    }

    onToggleClick();
  };

  const onEditClick = () => {
    setAnimateSettings(false);
    setIsCurrentSettings(false);
  };

  const description = (min: number, max: number) => (
    <Text
      fontSize="12px"
      className="input-description"
      noSelect
      fontWeight={400}
    >
      {t("EnterAnIntegerAmountBetween", {
        min: formatCurrencyValue(language, min, currency),
        max: formatCurrencyValue(language, max, currency),
      })}
    </Text>
  );

  const renderInputField = (
    <div className="input-fields">
      <div className="input-field">
        <Text fontSize="12px" className="input-label" noSelect fontWeight={600}>
          {t("WhenBalanceGoesBellow")}
        </Text>
        <TextInput
          scale
          value={minBalance}
          onChange={onMinBalanceChange}
          hasError={minBalanceError}
          type={InputType.text}
          inputMode="numeric"
        />
        {description(5, 1000)}
      </div>

      <div className="input-field">
        <Text fontSize="12px" className="input-label" noSelect fontWeight={600}>
          {t("BringCreditBackUpTo")}
        </Text>
        <TextInput
          scale
          value={upToBalance}
          onChange={onMaxUpToBalanceChange}
          hasError={upToBalanceError}
          type={InputType.text}
          inputMode="numeric"
        />
        {description(minUpToBalance, 5000)}
      </div>
      <div className="input-buttons">
        <Button
          key="OkButton"
          label={t("Common:SaveButton")}
          size={ButtonSize.small}
          primary
          onClick={onSave}
          isLoading={isLoading}
          isDisabled={
            minBalanceError || upToBalanceError || !minBalance || !upToBalance
          }
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.small}
          onClick={onClose}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );

  const renderCurrentSettings = (
    <div className={`settings-wrapper ${animateSettings ? "animated" : ""}`}>
      <CurrentPaymentSettings
        automaticPayments={automaticPayments}
        language={language}
        currency={currency}
      />
      <Button
        key="EditButton"
        label={t("Common:EditButton")}
        size={ButtonSize.small}
        onClick={onEditClick}
      />
    </div>
  );

  return (
    <div className="automatic-payments-block">
      <div className="auto-payment-header">
        <Text noSelect isBold fontSize="16px">
          {t("AutomaticPayments")}
        </Text>
        <ToggleButton
          isChecked={isAutomaticPaymentsEnabled}
          onChange={onToggleClick}
          className="toggle-button"
          isDisabled={!walletCustomerEmail}
        />
      </div>
      <Text fontSize="12px" className="auto-payment-description" noSelect>
        {t("AutomaticallyTopUpCard")}
      </Text>
      {isAutomaticPaymentsEnabled
        ? isCurrentSettings
          ? renderCurrentSettings
          : renderInputField
        : null}
    </div>
  );
};

export default inject(({ paymentStore, authStore }: TStore) => {
  const {
    walletCustomerEmail,
    updateAutoPayments,
    automaticPayments,
    isAutoPaymentExist,
  } = paymentStore;
  const { language } = authStore;

  return {
    walletCustomerEmail,
    isAutoPaymentExist,
    updateAutoPayments,
    automaticPayments,
    language,
  };
})(observer(AutoPayments));
