import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import TextInput from "@docspace/components/text-input";
import ComboBox from "@docspace/components/combobox";
import Button from "@docspace/components/button";

const SettingQuotaComponent = ({ isLoading, SaveQuota, commonButtonProps }) => {
  const [quotaLimit, setQuotaLimit] = useState("");
  const [quotaValue, setQuotaValue] = useState(0);

  const { t } = useTranslation(["Common"]);
  const options = [
    { key: 0, label: t("Common:Bytes") },
    { key: 1, label: t("Common:Kilobyte") },
    { key: 2, label: t("Common:Megabyte") },
    { key: 3, label: t("Common:Gigabyte") },
    { key: 4, label: t("Common:Terabyte") },
  ];

  const onChangeTextInput = (e) => {
    const value = e.target.value;

    setQuotaLimit(value);
  };

  const onSelectComboBox = (option) => {
    const { key } = option;

    setQuotaValue(key);
  };
  const onKeyDown = (e) => {
    if (e.keyCode === 13 || e.which === 13) SaveQuota();
  };

  const onSaveQuota = () => {
    const quota = quotaLimit * Math.pow(1024, quotaValue);
    SaveQuota(quota);
  };

  return (
    <div className="setting_quota">
      <TextInput
        className="quota_limit"
        isAutoFocussed={true}
        value={quotaLimit}
        onChange={onChangeTextInput}
        isDisabled={isLoading}
        onKeyDown={onKeyDown}
        withBorder
      />
      <ComboBox
        className="quota_value"
        options={options}
        isDisabled={isLoading}
        selectedOption={options.find((elem) => elem.key === quotaValue)}
        dropDownMaxHeight={200}
        size="content"
        onSelect={onSelectComboBox}
        showDisabledItems
      />
      <Button {...commonButtonProps} onClick={onSaveQuota} />
    </div>
  );
};

export default SettingQuotaComponent;
