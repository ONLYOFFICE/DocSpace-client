import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { Box } from "@docspace/shared/components/box";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

const ButtonContainer = ({ saveLdapSettings, restoreToDefault }) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = () => {
    saveLdapSettings()
      .then(() => toastr.success(t("Settings:SuccessfullySaveSettingsMessage")))
      .catch((e) => toastr.error(e));
  };
  const onResetClick = () => {
    restoreToDefault()
      .then(() => toastr.success(t("Settings:SuccessfullySaveSettingsMessage")))
      .catch((e) => toastr.error(e));
  };
  return (
    <Box className="ldap_buttons-container">
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onResetClick}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Settings:DefaultSettings")}
        displaySettings={true}
        hasScroll={true}
        hideBorder={true}
        cancelEnable
        showReminder
        additionalClassSaveButton="ldap-save"
        additionalClassCancelButton="ldap-reset"
      />
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const { save, restoreToDefault } = ldapStore;

  return {
    saveLdapSettings: save,
    restoreToDefault,
  };
})(observer(ButtonContainer));
