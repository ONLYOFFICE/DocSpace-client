import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotaPerItemComponent = (props) => {
  const { isDisabled, saveQuota, disableQuota, toggleLabel, formLabel } = props;

  const { t } = useTranslation("Settings");

  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onToggleChange = async (e) => {
    const { checked } = e.currentTarget;

    setIsToggleChecked(checked);

    if (checked) return;

    setIsLoading(true);

    await disableQuota();

    setIsLoading(false);
  };

  const onSaveQuota = async (size) => {
    console.log("onSaveUserQuota", size);
    timerId = setTimeout(() => setIsLoading(true), 200);

    await saveQuota(size);

    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
  };

  return (
    <StyledBaseQuotaComponent isDisabled={isDisabled}>
      <div className="toggle-container">
        <ToggleButton
          fontWeight={600}
          fontSize="14px"
          className="quotas_toggle-button"
          label={toggleLabel}
          onChange={onToggleChange}
          isChecked={isToggleChecked}
          isDisabled={isDisabled || isLoading}
        />
        <Text className="toggle_label" fontSize="12px">
          {t("SetDefaultUserQuota")}
        </Text>
        {isToggleChecked && (
          <QuotaForm
            isButtonsEnable
            label={formLabel}
            maxInputWidth={"214px"}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onSave={onSaveQuota}
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
})(observer(QuotaPerItemComponent));
