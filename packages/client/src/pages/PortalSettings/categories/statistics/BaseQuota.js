import React, { useState } from "react";

import { StyledBaseQuotaComponent } from "./StyledComponent";

import RadioButtonGroup from "@docspace/components/radio-button-group";
import BaseQuotaContentComponent from "./sub-components/BaseQuotaContent";

const DISABLE = "Disable",
  ENABLE = "Enable";
const BaseQuotaComponent = () => {
  const [radioButtonState, setRadioButtonState] = useState(DISABLE);

  const onChangeRadioButton = (e) => {
    const value = e.target.value;
    if (value === radioButtonState) return;

    setRadioButtonState(value);
  };

  return (
    <StyledBaseQuotaComponent>
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
