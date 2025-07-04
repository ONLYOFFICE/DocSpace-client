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

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { TextInput, InputType } from "@docspace/shared/components/text-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TAutoTopUpSettings } from "@docspace/shared/api/portal/types";

import CheckRoundSvg from "PUBLIC_DIR/images/icons/16/check.round.react.svg";

import styles from "../styles/AutoPayments.module.scss";

type AutoPaymentsProps = {
  onAdditionalSave?: () => void;
  noMargin?: boolean;
  walletCustomerEmail?: boolean;
  updateAutoPayments?: () => Promise<void>;
  autoPayments?: TAutoTopUpSettings | null | undefined;
  isAutoPaymentExist?: boolean;
  setMinBalance?: (value: string) => void;
  setUpToBalance?: (value: string) => void;
  isAutomaticPaymentsEnabled?: boolean;
  setIsAutomaticPaymentsEnabled?: (value: boolean) => void;
  minBalance?: string;
  upToBalance?: string;
  isEditAutoPayment?: boolean;
  setMinBalanceError?: (value: boolean) => void;
  minBalanceError?: boolean;
  setUpToBalanceError?: (value: boolean) => void;
  upToBalanceError?: boolean;
  isDisabled?: boolean;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
};

type CurrentPaymentSettingsProps = {
  autoPayments: TAutoTopUpSettings;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
};

const CurrentPaymentSettings = ({
  autoPayments,
  formatWalletCurrency,
}: CurrentPaymentSettingsProps) => {
  const { t } = useTranslation("Payments");

  const { minBalance, upToBalance } = autoPayments!;

  return (
    <div className={styles.infoBlock}>
      <div className={styles.infoBlockTitle}>
        <CheckRoundSvg />
        <Text fontSize="12px" fontWeight={600}>
          {t("AutoTopUp")}
        </Text>
      </div>
      <Text fontSize="12px" fontWeight={400} className={styles.infoDescription}>
        {t("WhenBalanceDropsTo", {
          min: formatWalletCurrency!(minBalance, 0),
          max: formatWalletCurrency!(upToBalance, 0),
        })}
      </Text>
    </div>
  );
};

const AutoPayments = ({
  walletCustomerEmail,
  updateAutoPayments,
  autoPayments,
  isAutoPaymentExist,
  isEditAutoPayment,
  setMinBalance,
  setUpToBalance,
  isAutomaticPaymentsEnabled,
  setIsAutomaticPaymentsEnabled,
  minBalance,
  upToBalance,
  onAdditionalSave,
  setMinBalanceError,
  minBalanceError,
  setUpToBalanceError,
  upToBalanceError,
  noMargin,
  isDisabled,
  formatWalletCurrency,
}: AutoPaymentsProps) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const showCurrentSettings = isAutoPaymentExist && !isEditAutoPayment;

  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentSettings, setIsCurrentSettings] =
    useState(showCurrentSettings);
  const [animateSettings, setAnimateSettings] = useState(false);
  const [minUpToBalance, setMinUpToBalance] = useState(6);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  const validateMaxUpToBalance = (value: string, minimumBalance: string) => {
    const numValue = parseInt(value, 10);
    const minInputValue = minimumBalance ? parseInt(minimumBalance, 10) : 5;

    const minValue = minInputValue + 1;

    if (Number.isNaN(numValue) || numValue < minValue || numValue > 5000) {
      setUpToBalanceError!(true);
      return;
    }

    setUpToBalanceError!(false);
  };

  const validateMinBalance = (value: string) => {
    const numValue = parseInt(value, 10);

    if (Number.isNaN(numValue) || numValue < 5 || numValue > 1000) {
      setMinBalanceError!(true);
      return;
    }

    setMinBalanceError!(false);
    setMinUpToBalance(numValue + 1);

    if (upToBalance) {
      validateMaxUpToBalance(upToBalance, value);
    }
  };

  const onMinBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (!validity.valid) return;

    setMinBalance!(value);
    validateMinBalance(value);
  };

  const onMaxUpToBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (!validity.valid) return;

    setUpToBalance!(value);
    validateMaxUpToBalance(value, minBalance!);
  };

  const onSave = async (isEnable: boolean = true) => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    try {
      await updateAutoPayments!();
      setIsCurrentSettings(isEnable);
      setIsLoading(false);
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

  const onToggleClick = () => {
    const isEnable = !isAutomaticPaymentsEnabled;

    setIsAutomaticPaymentsEnabled!(isEnable);

    if (!isEnable && isAutoPaymentExist) {
      onSave(isEnable);
    }
  };

  const onSaveAutoPayment = () => {
    onSave();
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
      className={styles.inputDescription}
      noSelect
      fontWeight={400}
    >
      {t("EnterAnIntegerAmountBetween", {
        min: formatWalletCurrency!(min, 0),
        max: formatWalletCurrency!(max, 0),
      })}
    </Text>
  );

  const renderInputField = () => (
    <div className={styles.inputFields}>
      <div className={styles.inputField}>
        <Text
          fontSize="12px"
          className={styles.inputLabel}
          noSelect
          fontWeight={600}
        >
          {t("WhenBalanceGoesBellow")}
        </Text>
        <TextInput
          scale
          value={minBalance!}
          onChange={onMinBalanceChange}
          hasError={minBalanceError}
          type={InputType.text}
          pattern="\d+"
          isDisabled={isDisabled}
        />
        {description(5, 1000)}
      </div>

      <div className={styles.inputField}>
        <Text
          fontSize="12px"
          className={styles.inputLabel}
          noSelect
          fontWeight={600}
        >
          {t("BringCreditBackUpTo")}
        </Text>
        <TextInput
          scale
          value={upToBalance!}
          onChange={onMaxUpToBalanceChange}
          hasError={upToBalanceError}
          type={InputType.text}
          pattern="\d+"
          isDisabled={isDisabled}
        />
        {description(minUpToBalance, 5000)}
      </div>
      {!onAdditionalSave ? (
        <div className={styles.inputButtons}>
          <Button
            key="OkButton"
            label={t("Common:SaveButton")}
            size={ButtonSize.small}
            primary
            onClick={onSaveAutoPayment}
            isLoading={isLoading}
            isDisabled={
              isDisabled ||
              minBalanceError ||
              upToBalanceError ||
              !minBalance ||
              !upToBalance
            }
          />
          <Button
            key="CancelButton"
            label={t("Common:CancelButton")}
            size={ButtonSize.small}
            onClick={onClose}
            isDisabled={isDisabled || isLoading}
          />
        </div>
      ) : null}
    </div>
  );

  const renderCurrentSettings = () => (
    <div
      className={classNames(styles.settingsWrapper, {
        [styles.animated]: animateSettings,
        [styles.showBlock]: isDisabled || isFirstRender.current,
      })}
    >
      <CurrentPaymentSettings
        autoPayments={autoPayments!}
        formatWalletCurrency={formatWalletCurrency}
      />
      <Button
        key="EditButton"
        label={t("Common:EditButton")}
        size={ButtonSize.small}
        onClick={onEditClick}
        isDisabled={isDisabled}
      />
    </div>
  );

  return (
    <div
      className={classNames(styles.automaticPaymentsBlock, {
        [styles.noMargin]: noMargin,
      })}
    >
      <div className={styles.autoPaymentHeader}>
        <Text noSelect isBold fontSize="16px">
          {t("AutomaticPayments")}
        </Text>
        <ToggleButton
          isChecked={isAutomaticPaymentsEnabled}
          onChange={onToggleClick}
          className={styles.toggleButton}
          isDisabled={isDisabled || !walletCustomerEmail}
        />
      </div>

      <Text fontSize="12px" className={styles.autoPaymentDescription} noSelect>
        {t("AutomaticallyTopUpCard")}
      </Text>

      {isAutomaticPaymentsEnabled
        ? isCurrentSettings
          ? renderCurrentSettings()
          : renderInputField()
        : null}
    </div>
  );
};

export default inject(({ paymentStore, currentTariffStatusStore }: TStore) => {
  const {
    updateAutoPayments,
    autoPayments,
    isAutoPaymentExist,
    setMinBalance,
    setUpToBalance,
    isAutomaticPaymentsEnabled,
    setIsAutomaticPaymentsEnabled,
    minBalance,
    upToBalance,
    setMinBalanceError,
    minBalanceError,
    setUpToBalanceError,
    upToBalanceError,
    formatWalletCurrency,
  } = paymentStore;

  const { walletCustomerEmail } = currentTariffStatusStore;

  return {
    walletCustomerEmail,
    updateAutoPayments,
    autoPayments,
    isAutoPaymentExist,
    setMinBalance,
    setUpToBalance,
    isAutomaticPaymentsEnabled,
    setIsAutomaticPaymentsEnabled,
    minBalance,
    upToBalance,
    setMinBalanceError,
    minBalanceError,
    setUpToBalanceError,
    upToBalanceError,
    formatWalletCurrency,
  };
})(observer(AutoPayments));
