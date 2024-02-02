import React from "react";
import { inject, observer } from "mobx-react";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Heading } from "@docspace/shared/components/heading";
import { Box } from "@docspace/shared/components/box";
import StyledSettings from "./StyledSettings";

const GeneralSettings = ({
  storeForceSave,
  setStoreForceSave,
  enableThirdParty,
  setEnableThirdParty,
  t,
}) => {
  const onChangeStoreForceSave = React.useCallback(() => {
    setStoreForceSave(!storeForceSave);
  }, [setStoreForceSave, storeForceSave]);

  const onChangeThirdParty = React.useCallback(() => {
    setEnableThirdParty(!enableThirdParty, "enableThirdParty");
  }, [setEnableThirdParty, enableThirdParty]);

  return (
    <StyledSettings>
      <Box className="settings-section">
        <Heading className="heading" level={2} size="xsmall">
          {t("StoringFileVersion")}
        </Heading>
        <ToggleButton
          className="intermediate-version toggle-btn"
          label={t("IntermediateVersion")}
          onChange={onChangeStoreForceSave}
          isChecked={storeForceSave}
        />
      </Box>

      <Box className="settings-section">
        <Heading className="heading" level={2} size="xsmall">
          {t("ThirdPartyAccounts")}
        </Heading>
        <ToggleButton
          className="toggle-btn"
          label={t("ThirdPartyBtn")}
          onChange={onChangeThirdParty}
          isChecked={enableThirdParty}
        />
      </Box>
    </StyledSettings>
  );
};

export default inject(({ filesSettingsStore }) => {
  const {
    enableThirdParty,
    setEnableThirdParty,
    storeForcesave,
    setStoreForceSave,
  } = filesSettingsStore;

  return {
    storeForceSave: storeForcesave,
    setStoreForceSave,
    enableThirdParty,
    setEnableThirdParty,
  };
})(observer(GeneralSettings));
