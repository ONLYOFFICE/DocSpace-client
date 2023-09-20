import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotaPerUserComponent = (props) => {
  const { isDisabled, setUserQuota } = props;

  const { t } = useTranslation("Settings");

  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onToggleChange = (e) => {
    const { checked } = e.currentTarget;

    setIsToggleChecked(checked);
  };

  const onSaveUserQuota = async (size) => {
    console.log("onSaveUserQuota", size);
    timerId = setTimeout(() => setIsLoading(true), 200);

    await setUserQuota(size);

    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
  };

  return (
    <StyledBaseQuotaComponent isDisabled={isDisabled}>
      <div className="toggle-container">
        <ToggleButton
          className="quotas_toggle-button"
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

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { setUserQuota } = currentQuotaStore;
  const { isItemQuotaAvailable } = currentQuotaStore;

  return { setUserQuota, isDisabled: !isItemQuotaAvailable };
})(observer(QuotaPerUserComponent));
