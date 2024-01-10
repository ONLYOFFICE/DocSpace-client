import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import toastr from "@docspace/components/toast/toastr";
import Box from "@docspace/components/box";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import { tablet } from "@docspace/components/utils/device";

const ButtonContainer = ({ saveLdapSettings, restoreToDefault }) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = () => {
    saveLdapSettings().catch((e) => toastr.error(e));
  };
  const onResetClick = () => {
    restoreToDefault()
      .then(() => toastr.success("Settings:SuccessfullySaveSettingsMessage"))
      .catch((e) => toastr.error(e));
  };
  return (
    <Box className="ldap_buttons-container">
      <SaveCancelButtons
        onSaveClick={onSaveClick}
        onCancelClick={onResetClick}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings
        className="save-cancel-buttons"
        cancelEnable
        showReminder
      />
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const { saveLdapSettings, restoreToDefault } = ldapStore;

  return {
    saveLdapSettings,
    restoreToDefault,
  };
})(observer(ButtonContainer));
