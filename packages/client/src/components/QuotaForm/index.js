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

import StyledBody from "./StyledComponent";
import { Checkbox } from "@docspace/shared/components/checkbox";

const isDefaultValue = (initPower, initSize, power, value, initialSize) => {
  if (initialSize === -1) return false;

  if (initPower == power && initSize == value) return true;

  return false;
};
const QuotaForm = ({
  isLoading,
  isDisabled,
  maxInputWidth,
  onSetQuotaBytesSize,
  initialSize,
  isError,
  isButtonsEnable = false,
  onSave,
  onCancel,
  label,
  checkboxLabel,
  description,
  isAutoFocussed = false,
}) => {
  const initPower = initialSize > 0 ? getPowerFromBytes(initialSize, 4) : 0;
  const initSize =
    initialSize > 0
      ? getSizeFromBytes(initialSize, initPower)
      : initialSize === 0
        ? "0"
        : "";

  useEffect(() => {
    setSize(initSize);
    setPower(initPower);
  }, [initialSize]);

  const [power, setPower] = useState(initPower);
  const [size, setSize] = useState(initSize);
  const [hasError, setHasError] = useState(false);
  const [isChecked, setIsChecked] = useState(initialSize === -1);

  const { t } = useTranslation(["Settings", "Common"]);
  const options = [
    { key: 0, label: t("Common:Bytes") },
    { key: 1, label: t("Common:Kilobyte") },
    { key: 2, label: t("Common:Megabyte") },
    { key: 3, label: t("Common:Gigabyte") },
    { key: 4, label: t("Common:Terabyte") },
  ];

  const getConvertedSize = (value) => {
    return value.trim() !== "" ? conversionToBytes(value, power) : "";
  };
  const onChangeTextInput = (e) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      const transmittedSize = getConvertedSize(value);

      onSetQuotaBytesSize && onSetQuotaBytesSize(transmittedSize);
      setSize(value);
    }
  };

  const onSelectComboBox = (option) => {
    const { key } = option;

    onSetQuotaBytesSize && onSetQuotaBytesSize(conversionToBytes(size, key));
    setPower(key);
  };

  const onChangeCheckbox = () => {
    const changeСheckbox = !isChecked;

    setIsChecked(changeСheckbox);

    const sizeValue = changeСheckbox ? -1 : getConvertedSize(size);

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

        return;
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
    initialSize
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
          pattern="^[ 0-9]+$"
          scale
          withBorder
        />
        <ComboBox
          className="quota_value"
          options={options}
          isDisabled={isDisable}
          selectedOption={options.find((elem) => elem.key === power)}
          size="content"
          onSelect={onSelectComboBox}
          showDisabledItems
          manualWidth={"fit-content"}
        />
      </div>
      {checkboxLabel && (
        <Checkbox
          label={checkboxLabel}
          isChecked={isChecked}
          onChange={onChangeCheckbox}
          isDisabled={isDisable}
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
  initialPower: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default QuotaForm;
