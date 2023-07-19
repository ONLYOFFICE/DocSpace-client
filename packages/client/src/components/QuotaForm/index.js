import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import TextInput from "@docspace/components/text-input";
import ComboBox from "@docspace/components/combobox";
import Button from "@docspace/components/button";
import StyledBody from "./StyledComponent";

const conversionToBytes = (size, power) => size * Math.pow(1024, power);
const QuotaForm = ({
  isLoading,
  onSaveQuota,
  isButtonsEnable = true,
  maxInputWidth,
  onSetQuotaSize,
}) => {
  const [size, setSize] = useState("");
  const [power, setPower] = useState(0);
  const [isError, setIsError] = useState(false);

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
      onSetQuotaSize && onSetQuotaSize(conversionToBytes(value, power));
      setSize(value);
    }
  };

  const onSelectComboBox = (option) => {
    const { key } = option;

    onSetQuotaSize && onSetQuotaSize(conversionToBytes(size, key));
    setPower(key);
  };

  const isSizeError = () => {
    if (size.trim() === "") {
      setIsError(true);
      return true;
    }

    return false;
  };
  const onKeyDown = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      if (isSizeError()) return;
      onSaveQuota && onSaveQuota();
    }

    setIsError(false);
  };

  const onButtonClick = () => {
    if (isSizeError()) return;

    onSaveQuota && onSaveQuota(conversionToBytes(size, power));
  };

  return (
    <StyledBody maxInputWidth={maxInputWidth}>
      <TextInput
        className="quota_limit"
        isAutoFocussed={true}
        value={size}
        onChange={onChangeTextInput}
        isDisabled={isLoading}
        onKeyDown={onKeyDown}
        hasError={isError}
        pattern="[0-9]*"
        scale
        withBorder
      />
      <ComboBox
        className="quota_value"
        options={options}
        isDisabled={isLoading}
        selectedOption={options.find((elem) => elem.key === power)}
        size="content"
        onSelect={onSelectComboBox}
        showDisabledItems
        manualWidth={"fit-content"}
      />

      {isButtonsEnable && (
        <Button
          size="small"
          primary
          label={t("Common:Save")}
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={onButtonClick}
        />
      )}
    </StyledBody>
  );
};

QuotaForm.propTypes = {
  maxInputWidth: PropTypes.string,
  isButtonsEnable: PropTypes.bool,
};
export default QuotaForm;
