// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import {
  conversionToBytes,
  getPowerFromBytes,
  getSizeFromBytes,
} from "@docspace/shared/utils/common";
import { TextInput } from "@docspace/shared/components/text-input";
import { ComboBox } from "@docspace/shared/components/combobox";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Text } from "@docspace/shared/components/text";

import { Checkbox } from "@docspace/shared/components/checkbox";
import StyledBody from "./StyledComponent";

const isDefaultValue = (initPower, initSize, power, value, initialSize) => {
  if (!initialSize && initialSize !== 0) return false;

  if (initialSize === -1) return false;

  if (initPower == power && initSize == value) return true;

  return false;
};

const getInitialSize = (initialSize, initPower) => {
  if (initialSize > 0)
    return getSizeFromBytes(initialSize, initPower).toString();

  if (initialSize < 0) return "";

  return initialSize.toString();
};

const getInitialPower = (initialSize) => {
  if (initialSize > 0) return getPowerFromBytes(initialSize, 4);

  return 2;
};

const getOptions = (t) => [
  { key: 0, label: t("Common:Bytes") },
  { key: 1, label: t("Common:Kilobyte") },
  { key: 2, label: t("Common:Megabyte") },
  { key: 3, label: t("Common:Gigabyte") },
  { key: 4, label: t("Common:Terabyte") },
];

const getConvertedSize = (value, power) => {
  if (value.trim() === "") return "";

  return conversionToBytes(value, power);
};
const QuotaForm = ({
  isLoading,
  isDisabled,
  maxInputWidth,
  onSetQuotaBytesSize,
  initialSize = "",
  isError,
  isButtonsEnable = false,
  onSave,
  onCancel,
  label,
  checkboxLabel,
  description,
  isAutoFocussed = false,
  tabIndex,
}) => {
  const initPower = getInitialPower(initialSize);
  const initSize = getInitialSize(initialSize, initPower);

  const [power, setPower] = useState(initPower);
  const [size, setSize] = useState(initSize);
  const [hasError, setHasError] = useState(false);
  const [isChecked, setIsChecked] = useState(initialSize === -1);

  useEffect(() => {
    setSize(initSize);
    setPower(initPower);
  }, [initialSize]);

  const { t } = useTranslation(["Settings", "Common"]);
  const options = getOptions(t);

  const onChangeTextInput = (e) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      const transmittedSize = getConvertedSize(value, power);

      onSetQuotaBytesSize && onSetQuotaBytesSize(transmittedSize);
      setSize(value);
    }
  };

  const onSelectComboBox = (option) => {
    const { key } = option;

    size.trim() !== "" &&
      onSetQuotaBytesSize &&
      onSetQuotaBytesSize(conversionToBytes(size, key));

    setPower(key);
  };

  const onChangeCheckbox = () => {
    const changeСheckbox = !isChecked;

    setIsChecked(changeСheckbox);

    const sizeValue = changeСheckbox ? -1 : getConvertedSize(size, power);

    onSetQuotaBytesSize && onSetQuotaBytesSize(sizeValue);
  };
  const isSizeError = () => {
    if (size.trim() === "") {
      setHasError(true);
      return true;
    }

    return false;
  };
  const onKeyDownInput = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      if (isButtonsEnable) {
        if (isSizeError()) return;

        onSaveClick();

        setHasError(false);
      }
    }
  };
  const onSaveClick = async () => {
    if (isSizeError()) return;

    onSave & onSave(conversionToBytes(size, power));

    setHasError(false);
  };

  const onCancelClick = () => {
    onCancel && onCancel();

    setSize(initSize);
    setPower(initPower);
  };

  const isDisable = isLoading || isDisabled || (checkboxLabel && isChecked);
  const isDefaultQuota = isDefaultValue(
    initPower,
    initSize,
    power,
    size,
    initialSize,
  );

  return (
    <StyledBody
      maxInputWidth={maxInputWidth}
      isLabel={!!label}
      isCheckbox={!!checkboxLabel}
    >
      {label && <Text fontWeight={600}>{label}</Text>}
      {description && (
        <Text fontSize="12px" className="quota_description">
          {description}
        </Text>
      )}
      <div className="quota-container">
        <TextInput
          className="quota_limit"
          isAutoFocussed={isAutoFocussed}
          value={size}
          onChange={onChangeTextInput}
          isDisabled={isDisable}
          onKeyDown={onKeyDownInput}
          hasError={isError || hasError}
          pattern="^\d+(?:\.\d{0,2})?"
          scale
          withBorder
          tabIndex={tabIndex}
        />
        <ComboBox
          className="quota_value"
          options={options}
          isDisabled={isDisable}
          selectedOption={options.find((elem) => elem.key === power)}
          size="content"
          onSelect={onSelectComboBox}
          showDisabledItems
          manualWidth="auto"
          directionY="both"
        />
      </div>
      {checkboxLabel && (
        <Checkbox
          label={checkboxLabel}
          isChecked={isChecked}
          className="quota_checkbox"
          onChange={onChangeCheckbox}
          isDisabled={isLoading || isDisabled}
        />
      )}

      {isButtonsEnable && (
        <SaveCancelButtons
          isSaving={isLoading}
          onSaveClick={onSaveClick}
          onCancelClick={onCancelClick}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:CancelButton")}
          reminderText={t("YouHaveUnsavedChanges")}
          displaySettings
          saveButtonDisabled={isDefaultQuota}
          disableRestoreToDefault={isDefaultQuota}
          showReminder={!isDefaultQuota}
        />
      )}
    </StyledBody>
  );
};

QuotaForm.propTypes = {
  maxInputWidth: PropTypes.string,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  isButtonsEnable: PropTypes.bool,
  onSetQuotaBytesSize: PropTypes.func,
  initialSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default QuotaForm;
