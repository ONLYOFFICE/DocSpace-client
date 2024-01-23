import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotaPerItemComponent = (props) => {
  const {
    isDisabled,
    saveQuota,
    disableQuota,
    toggleLabel,
    formLabel,
    updateQuotaInfo,
    initialSize,
    isQuotaSet,
    type,

    defaultQuota,
  } = props;

  const { t } = useTranslation("Settings");

  const [isToggleChecked, setIsToggleChecked] = useState(isQuotaSet);

  const [isLoading, setIsLoading] = useState(false);

  const onToggleChange = async (e) => {
    const { checked } = e.currentTarget;

    setIsToggleChecked(checked);

    if (checked) return;

    setIsLoading(true);

    if (defaultQuota === -1) {
      setIsLoading(false);
      return;
    }

    await disableQuota();
    await updateQuotaInfo(type);

    setIsLoading(false);
  };

  const onSaveQuota = async (size) => {
    timerId = setTimeout(() => setIsLoading(true), 200);

    await saveQuota(size);
    await updateQuotaInfo(type);

    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
  };

  const onCancel = () => {
    !isQuotaSet && setIsToggleChecked(false);
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
            onCancel={onCancel}
            initialSize={initialSize}
          />
        )}
      </div>
    </StyledBaseQuotaComponent>
  );
};

export default inject(({ auth, storageManagement }, { type }) => {
  const { currentQuotaStore } = auth;
  const { setUserQuota, defaultUsersQuota, defaultRoomsQuota } =
    currentQuotaStore;
  const { isStatisticsAvailable } = currentQuotaStore;

  const { updateQuotaInfo } = storageManagement;

  const defaultQuota = type === "user" ? defaultUsersQuota : defaultRoomsQuota;
  return {
    setUserQuota,
    defaultQuota,
    isDisabled: !isStatisticsAvailable,
    updateQuotaInfo,
  };
})(observer(QuotaPerItemComponent));
