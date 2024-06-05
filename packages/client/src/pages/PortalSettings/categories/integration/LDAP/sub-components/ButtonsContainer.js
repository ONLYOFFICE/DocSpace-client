import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { Box } from "@docspace/shared/components/box";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

const ButtonContainer = ({
  saveLdapSettings,
  restoreToDefault,
  hasChanges,
  isDefaultSettings,

  isLdapEnabled,
  isUIDisabled,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const onSaveClick = React.useCallback(() => {
    saveLdapSettings(t).catch((e) => toastr.error(e));
  }, [saveLdapSettings, t]);

  const onResetClick = React.useCallback(() => {
    restoreToDefault(t).catch((e) => toastr.error(e));
  }, [restoreToDefault, t]);

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
        saveButtonDisabled={!isLdapEnabled || isUIDisabled || !hasChanges}
        disableRestoreToDefault={
          !isLdapEnabled || isUIDisabled || isDefaultSettings
        }
        showReminder
        additionalClassSaveButton="ldap-save"
        additionalClassCancelButton="ldap-reset"
      />
    </Box>
  );
};

export default inject(({ currentQuotaStore, ldapStore }) => {
  const {
    save,
    restoreToDefault,
    hasChanges,
    isDefaultSettings,

    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;
  const { isLdapAvailable } = currentQuotaStore;

  return {
    saveLdapSettings: save,
    restoreToDefault,
    hasChanges,
    isDefaultSettings,

    isLdapEnabled,
    isUIDisabled,
  };
})(observer(ButtonContainer));
