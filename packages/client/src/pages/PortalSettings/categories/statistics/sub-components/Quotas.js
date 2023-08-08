import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import QuotaForm from "../../../../../components/QuotaForm";

let timerId = null;
const QuotasComponent = () => {
  const { t } = useTranslation("Settings");

  const [isToggleChecked, setIsToggleChecked] = useState({
    room: false,
    user: false,
  });

  const [isLoading, setIsLoading] = useState({ room: false, user: false });

  const onToggleChange = (e) => {
    const { checked } = e.currentTarget;
    const { name } = e.target;

    setIsToggleChecked({
      ...isToggleChecked,
      [name]: checked,
    });
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

  const isRoomQuotaEnable = isToggleChecked.room;
  const isUserQuotaEnable = isToggleChecked.user;

  return (
    <StyledBaseQuotaComponent>
      <div className="quotas_label">
        <Text fontSize="16px" fontWeight={700}>
          {"Quotas"}
        </Text>
        <Text>{t("QuotasDescription")}</Text>
      </div>
      <div className="toggle-container">
        <ToggleButton
          className="quotas_toggle-button"
          name="room"
          label={t("DefineQuotaPerRoom")}
          onChange={onToggleChange}
          isChecked={isRoomQuotaEnable}
          isDisabled={isLoading.room}
        />
        <Text className="toggle_label">{t("SetDefaultRoomQuota")}</Text>
        {isRoomQuotaEnable && (
          <QuotaForm
            label={t("QuotaPerRoom")}
            maxInputWidth={"214px"}
            onSave={onSaveRoomQuota}
            isLoading={isLoading.room}
          />
        )}
      </div>
      <div className="toggle-container">
        <ToggleButton
          className="quotas_toggle-button"
          name="user"
          label={t("DefineQuotaPerUser")}
          onChange={onToggleChange}
          isChecked={isUserQuotaEnable}
          isDisabled={isLoading.user}
        />
        <Text className="toggle_label">{t("SetDefaultUserQuota")}</Text>
        {isUserQuotaEnable && (
          <QuotaForm
            label={t("QuotaPerUser")}
            maxInputWidth={"214px"}
            isLoading={isLoading.user}
            onSave={onSaveUserQuota}
          />
        )}
      </div>
    </StyledBaseQuotaComponent>
  );
};

export default QuotasComponent;
