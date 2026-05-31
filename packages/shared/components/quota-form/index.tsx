/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import {
  conversionToBytes,
  getPowerFromBytes,
  getSizeFromBytes,
} from "../../utils/common";
import { TextInput, InputType } from "@docspace/ui-kit/components/text-input";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/ui-kit/components/combobox";
import { SaveCancelButtons } from "../save-cancel-buttons";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { TTranslation } from "../../types";

import { QuotaFormProps } from "./QuotaForm.types";
import styles from "./QuotaForm.module.scss";

const isDefaultValue = (
  initPower: number,
  initSize: number,
  power: number,
  value: number,
  initialSize: number,
) => {
  if (!initialSize && initialSize !== 0) return false;

  if (initialSize === -1) return false;

  if (initPower === power && initSize === value) return true;

  return false;
};

const getInitialSize = (initialSize: number, initPower: number) => {
  if (initialSize > 0)
    return getSizeFromBytes(initialSize, initPower).toString();

  if (initialSize < 0) return "";

  return initialSize.toString();
};

const getInitialPower = (initialSize: number) => {
  if (initialSize > 0) return getPowerFromBytes(initialSize, 4);

  return 2;
};

const getOptions = (t: TTranslation) => [
  { key: 0, label: t("Common:Bytes") },
  { key: 1, label: t("Common:Kilobyte") },
  { key: 2, label: t("Common:Megabyte") },
  { key: 3, label: t("Common:Gigabyte") },
  { key: 4, label: t("Common:Terabyte") },
];

const getConvertedSize = (value: string, power: number) => {
  if (value.trim() === "") return "";
  return conversionToBytes(Number(value), power);
};
export const QuotaForm = forwardRef<{ focus: () => void }, QuotaFormProps>(
  (
    {
      isLoading,
      isDisabled,
      maxInputWidth,
      onSetQuotaBytesSize,
      initialSize = 0,
      isError,
      isButtonsEnable = false,
      onSave,
      onCancel,
      label,
      checkboxLabel,
      description,
      isAutoFocussed = false,
      tabIndex,
      dataTestId,
    },
    ref,
  ) => {
    const initPower = getInitialPower(initialSize);
    const initSize = getInitialSize(initialSize, initPower);

    const [power, setPower] = useState(initPower);
    const [size, setSize] = useState(initSize);
    const [hasError, setHasError] = useState(false);
    const [isChecked, setIsChecked] = useState(initialSize === -1);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setSize(initSize);
      setPower(initPower);
    }, [initSize, initPower, setSize, setPower]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        inputRef.current?.select();
      },
    }));

    const { t } = useTranslation(["Common"]);
    const options = getOptions(t);

    const onChangeTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, validity } = e.target;

      if (validity.valid) {
        const transmittedSize = getConvertedSize(value, power);

        if (onSetQuotaBytesSize) onSetQuotaBytesSize(transmittedSize);
        setSize(value);
      }
    };

    const onSelectComboBox = (option: TOption) => {
      const { key } = option;

      if (onSetQuotaBytesSize && size.trim() !== "")
        onSetQuotaBytesSize(conversionToBytes(Number(size), Number(key)));

      setPower(Number(key));
    };

    const onChangeCheckbox = () => {
      const changeCheckbox = !isChecked;

      setIsChecked(changeCheckbox);

      const sizeValue = changeCheckbox ? -1 : getConvertedSize(size, power);

      if (onSetQuotaBytesSize) onSetQuotaBytesSize(sizeValue.toString());
    };

    const isSizeError = () => {
      if (size.trim() === "") {
        setHasError(true);
        return true;
      }

      return false;
    };

    const onSaveClick = async () => {
      if (isSizeError()) return;

      if (onSave) onSave(conversionToBytes(Number(size), Number(power)));

      setHasError(false);
    };

    const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.keyCode === 13 || e.which === 13) {
        if (isButtonsEnable) {
          if (isSizeError()) return;

          onSaveClick();

          setHasError(false);
        }
      }
    };

    const onCancelClick = () => {
      if (onCancel) onCancel();

      setSize(initSize);
      setPower(initPower);
    };

    const isDisable =
      isLoading ||
      isDisabled ||
      (checkboxLabel !== undefined && checkboxLabel.length > 0 && isChecked);

    const isDefaultQuota = isDefaultValue(
      initPower,
      Number(initSize),
      power,
      Number(size),
      initialSize,
    );

    return (
      <div
        className={classNames(styles.quotaForm, {
          [styles.isCheckbox]: !!checkboxLabel,
          [styles.isLabel]: !!label,
          [styles.isButtonsEnable]: isButtonsEnable,
        })}
        data-testid={dataTestId ?? "quota-form"}
      >
        {label ? <Text fontWeight={600}>{label}</Text> : null}
        {description ? (
          <Text
            fontSize="12px"
            className={classNames(styles.quotaDescription, "quota_description")}
          >
            {description}
          </Text>
        ) : null}
        <div className={classNames(styles.quotaContainer, "quota-container")}>
          <TextInput
            forwardedRef={inputRef}
            type={InputType.text}
            name="quota_limit"
            className={classNames(styles.quotaLimit, "quota_limit")}
            style={{ maxWidth: maxInputWidth }}
            isAutoFocussed={isAutoFocussed}
            value={size}
            onChange={onChangeTextInput}
            isDisabled={isDisable}
            onKeyDown={onKeyDownInput}
            hasError={isError || hasError}
            pattern="^(?!^0(?:\.\d{0,2})?$)\d+(?:\.\d{0,2})?$"
            scale
            withBorder
            tabIndex={tabIndex}
            testId={dataTestId ? `${dataTestId}_input` : "quota-text-input"}
          />
          <ComboBox
            className={classNames(styles.quotaValue, "quota_value")}
            options={options}
            isDisabled={isDisable}
            selectedOption={options.find((elem) => elem.key === power)!}
            size={ComboBoxSize.content}
            onSelect={onSelectComboBox}
            showDisabledItems
            manualWidth="auto"
            directionY="both"
            dataTestId={
              dataTestId ? `${dataTestId}_size_combo_box` : "quota-combo-box"
            }
          />
        </div>
        {checkboxLabel ? (
          <Checkbox
            label={checkboxLabel}
            isChecked={isChecked}
            className={classNames(styles.quotaCheckbox, "quota_checkbox", {
              [styles.isButtonsEnable]: isButtonsEnable,
            })}
            onChange={onChangeCheckbox}
            isDisabled={isLoading || isDisabled}
            dataTestId={
              dataTestId ? `${dataTestId}_checkbox` : "quota-checkbox"
            }
          />
        ) : null}

        {isButtonsEnable ? (
          <SaveCancelButtons
            isSaving={isLoading}
            onSaveClick={onSaveClick}
            onCancelClick={onCancelClick}
            saveButtonLabel={t("Common:SaveButton")}
            cancelButtonLabel={t("Common:CancelButton")}
            reminderText={t("Common:YouHaveUnsavedChanges")}
            displaySettings
            saveButtonDisabled={isDefaultQuota}
            disableRestoreToDefault={isDefaultQuota}
            showReminder={!isDefaultQuota}
            saveButtonDataTestId={
              dataTestId ? `${dataTestId}_save_button` : "quota-save-button"
            }
            cancelButtonDataTestId={
              dataTestId ? `${dataTestId}_cancel_button` : "quota-cancel-button"
            }
          />
        ) : null}
      </div>
    );
  },
);

export default QuotaForm;
