import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotaPerUserComponent = (props) => {
  const { isDisabled } = props;

  const { t } = useTranslation("Settings");

  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onToggleChange = (e) => {
    const { checked } = e.currentTarget;

    setIsToggleChecked(checked);
  };

  const startLoading = (name) => {
    setTimeout(() => setIsLoading({ ...isLoading, [name]: true }), 200);
  };
  const resetLoading = (name) => {
    setIsLoading({ [name]: false });
  };

  const onSaveUserQuota = async (size) => {
    console.log("onSaveUserQuota", size);
    const name = "user";
    timerId = startLoading(name);

    var promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        //reject(new Error("timeout"));
        resolve();
      }, [1000]);
    });

    await promise;

    timerId && clearTimeout(timerId);
    timerId = null;

    resetLoading(name);
  };

  return (
    <StyledBaseQuotaComponent isDisabled={isDisabled}>
      <div className="toggle-container">
        <ToggleButton
          className="quotas_toggle-button"
          name="user"
          label={t("DefineQuotaPerUser")}
          onChange={onToggleChange}
          isChecked={isToggleChecked}
          isDisabled={isDisabled || isLoading}
        />
        <Text className="toggle_label">{t("SetDefaultUserQuota")}</Text>
        {isToggleChecked && (
          <QuotaForm
            isButtonsEnable
            label={t("QuotaPerUser")}
            maxInputWidth={"214px"}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onSave={onSaveUserQuota}
          />
        )}
      </div>
    </StyledBaseQuotaComponent>
  );
};

export default QuotaPerUserComponent;
