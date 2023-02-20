import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { StyledBaseQuotaComponent } from "./StyledComponent";
import BaseQuotaContentComponent from "./sub-components/BaseQuotaContent";

import RadioButtonGroup from "@docspace/components/radio-button-group";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";

const DISABLE = "Disable",
  ENABLE = "Enable";
const BaseQuotaComponent = () => {
  const [radioButtonState, setRadioButtonState] = useState(DISABLE);

  const { t } = useTranslation("Settings");
  const onChangeRadioButton = (e) => {
    const value = e.target.value;
    if (value === radioButtonState) return;

    setRadioButtonState(value);
  };

  return (
    <StyledBaseQuotaComponent>
      <Text fontSize="16px" fontWeight={700}>
        {t("DefineQuotaPerUser")}
      </Text>
      <RadioButtonGroup
        name="restore_backup"
        orientation="vertical"
        fontSize="13px"
        fontWeight="400"
        className="backup_radio-button"
        options={[
          { value: DISABLE, label: "Disable" },
          { value: ENABLE, label: "Enable" },
        ]}
        onClick={onChangeRadioButton}
        selected={radioButtonState}
        spacing="10px"
      />
      <div className="radio-button_content">
        <BaseQuotaContentComponent isEnable={radioButtonState === ENABLE} />
      </div>
    </StyledBaseQuotaComponent>
  );
};

export default BaseQuotaComponent;
