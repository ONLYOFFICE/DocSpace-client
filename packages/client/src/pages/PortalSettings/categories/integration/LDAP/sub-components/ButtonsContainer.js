import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Box from "@docspace/components/box";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const ButtonContainer = (props) => {
  const { saveLdapSettings } = props;
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = () => {
    saveLdapSettings();
  };
  const onResetClick = () => {
    console.log("on reset click");
  };
  return (
    <Box className="ldap_buttons-container">
      <SaveCancelButtons
        onSaveClick={onSaveClick}
        onCancelClick={onResetClick}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings
        cancelEnable
        showReminder
      />
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const { saveLdapSettings } = ldapStore;

  return {
    saveLdapSettings,
  };
})(observer(ButtonContainer));
