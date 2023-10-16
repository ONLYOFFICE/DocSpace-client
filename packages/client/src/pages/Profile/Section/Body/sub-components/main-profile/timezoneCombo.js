import React from "react";
import { useTranslation } from "react-i18next";

import ComboBox from "@docspace/components/combobox";
import Text from "@docspace/components/text";
import toastr from "@docspace/components/toast/toastr";

import { StyledRow } from "./styled-main-profile";
import { isMobile } from "@docspace/components/utils/device";

const TimezoneCombo = ({ title }) => {
  const { t } = useTranslation("Wizard");

  const timezones = [{ key: "03", label: "(UTC) +03 Moscow" }];
  const selectedTimezone = { key: "03", label: "(UTC) +03 Moscow" };

  return (
    <StyledRow title={title}>
      <Text as="div" className="label">
        {t("Wizard:Timezone")}
      </Text>
      <ComboBox
        onClick={() => toastr.warning("Work in progress (timezones)")}
        className="combo"
        directionY="both"
        options={timezones}
        selectedOption={selectedTimezone}
        //onSelect={onTimezoneSelect}
        isDisabled={false}
        noBorder={!isMobile()}
        scaled={isMobile()}
        scaledOptions={false}
        size="content"
        showDisabledItems={true}
        dropDownMaxHeight={364}
        manualWidth="250px"
        isDefaultMode={!isMobile()}
        withBlur={isMobile()}
        fillIcon={false}
      />
    </StyledRow>
  );
};

export default TimezoneCombo;
