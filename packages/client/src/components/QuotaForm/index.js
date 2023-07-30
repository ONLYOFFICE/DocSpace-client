import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import { conversionToBytes } from "@docspace/common/utils";
import TextInput from "@docspace/components/text-input";
import ComboBox from "@docspace/components/combobox";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";

import StyledBody from "./StyledComponent";

const QuotaForm = ({
  isLoading,
  maxInputWidth,
  onSetQuotaBytesSize,
  initialSize = "",
  initialPower = 0,
  isError,
  isButtonsEnable = true,
  onSave,
  label,
}) => {
  const [size, setSize] = useState(initialSize);
  const [power, setPower] = useState(initialPower);
  const [hasError, setHasError] = useState(false);

  const { t } = useTranslation(["Common"]);
  const options = [
    { key: 0, label: t("Common:Bytes") },
    { key: 1, label: t("Common:Kilobyte") },
    { key: 2, label: t("Common:Megabyte") },
    { key: 3, label: t("Common:Gigabyte") },
    { key: 4, label: t("Common:Terabyte") },
  ];

  const onChangeTextInput = (e) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      const transmittedSize =
        value.trim() !== "" ? conversionToBytes(value, power) : "";

      onSetQuotaBytesSize && onSetQuotaBytesSize(transmittedSize);
      setSize(value);
    }
  };

  const onSelectComboBox = (option) => {
    const { key } = option;

    onSetQuotaBytesSize && onSetQuotaBytesSize(conversionToBytes(size, key));
    setPower(key);
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
    console.log("onCancel");
  };

  const isDisabled = isLoading;
  return (
    <StyledBody maxInputWidth={maxInputWidth} label={label}>
      {label && <Text fontWeight={600}>{label}</Text>}
      <div className="quota-container">
        <TextInput
          className="quota_limit"
          isAutoFocussed={true}
          value={size}
          onChange={onChangeTextInput}
          isDisabled={isDisabled}
          onKeyDown={onKeyDownInput}
          hasError={isError || hasError}
          pattern="[0-9]*"
          scale
          withBorder
        />
        <ComboBox
          className="quota_value"
          options={options}
          isDisabled={isDisabled}
          selectedOption={options.find((elem) => elem.key === power)}
          size="content"
          onSelect={onSelectComboBox}
          showDisabledItems
          manualWidth={"fit-content"}
        />
      </div>
      {isButtonsEnable && (
        <SaveCancelButtons
          onSaveClick={onSaveClick}
          onCancelClick={onCancelClick}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:CancelButton")}
          reminderTest={t("YouHaveUnsavedChanges")}
          displaySettings
          cancelEnable
          saveButtonDisabled={false}
          showReminder
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
  initialSize: PropTypes.string,
  initialPower: PropTypes.number,
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;

  const { setUserQuota } = currentQuotaStore;
  return {
    setUserQuota,
  };
})(observer(QuotaForm));
