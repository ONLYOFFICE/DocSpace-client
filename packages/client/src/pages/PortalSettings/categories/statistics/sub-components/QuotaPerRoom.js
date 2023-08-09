import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotaPerRoomComponent = () => {
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
  const onSaveRoomQuota = async (size) => {
    const name = "room";
    console.log("onSaveRoomQuota", size);
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
    <StyledBaseQuotaComponent>
      <div className="toggle-container">
        <ToggleButton
          className="quotas_toggle-button"
          name="room"
          label={t("DefineQuotaPerRoom")}
          onChange={onToggleChange}
          isChecked={isToggleChecked}
          isDisabled={isLoading.room}
        />
        <Text className="toggle_label">{t("SetDefaultRoomQuota")}</Text>
        {isToggleChecked && (
          <QuotaForm
            label={t("QuotaPerRoom")}
            maxInputWidth={"214px"}
            onSave={onSaveRoomQuota}
            isLoading={isLoading.room}
          />
        )}
      </div>
    </StyledBaseQuotaComponent>
  );
};

export default QuotaPerRoomComponent;
